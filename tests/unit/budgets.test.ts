import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  budgetState,
  budgetStatus,
  monthKey,
  type Transaction,
} from "@/lib/finance";

/** A booking with only the fields the budget math looks at. */
function tx(date: string, amount: number, category: string): Transaction {
  return {
    id: date + amount + category,
    date,
    amount,
    description: "test",
    counterparty: "test",
    category,
    type: amount >= 0 ? "income" : "expense",
    method: "card",
    recurring: false,
  };
}

describe("monthKey", () => {
  it("reduces an ISO day to its calendar month", () => {
    expect(monthKey("2026-09-25")).toBe("2026-09");
  });
});

describe("budgetStatus", () => {
  it("sums the month's expenses of a budgeted category", () => {
    const rows = [
      tx("2026-09-02", -30, "Groceries"),
      tx("2026-09-17", -70, "Groceries"),
    ];

    expect(budgetStatus(rows, { Groceries: 400 }, "2026-09-25")).toEqual([
      { category: "Groceries", budget: 400, actual: 100, ratio: 0.25 },
    ]);
  });

  it("counts only bookings inside the calendar month of the reference date", () => {
    const rows = [
      tx("2026-09-01", -10, "Groceries"), // first day — counts
      tx("2026-09-30", -20, "Groceries"), // last day — counts
      tx("2026-08-31", -500, "Groceries"), // previous month
      tx("2026-10-01", -500, "Groceries"), // next month
    ];

    expect(budgetStatus(rows, { Groceries: 100 }, "2026-09-15")[0]).toEqual({
      category: "Groceries",
      budget: 100,
      actual: 30,
      ratio: 0.3,
    });
  });

  it("ignores income in a budgeted category", () => {
    const rows = [
      tx("2026-09-10", -40, "Groceries"),
      tx("2026-09-11", 500, "Groceries"), // refund — must not reduce the actual
    ];

    expect(budgetStatus(rows, { Groceries: 100 }, "2026-09-25")[0].actual).toBe(
      40,
    );
  });

  it("keeps a budgeted category without bookings at an actual of 0", () => {
    const rows = [tx("2026-09-10", -40, "Groceries")];

    expect(budgetStatus(rows, { Travel: 200 }, "2026-09-25")).toContainEqual({
      category: "Travel",
      budget: 200,
      actual: 0,
      ratio: 0,
    });
  });

  it("leaves categories without a budget out of the result", () => {
    const rows = [tx("2026-09-10", -40, "Fuel")];

    expect(budgetStatus(rows, { Groceries: 100 }, "2026-09-25")).toEqual([
      { category: "Groceries", budget: 100, actual: 0, ratio: 0 },
    ]);
  });

  it("reports an overspend as a ratio above 1 without capping it", () => {
    const rows = [tx("2026-09-10", -600, "Groceries")];

    expect(budgetStatus(rows, { Groceries: 400 }, "2026-09-25")[0].ratio).toBe(
      1.5,
    );
  });

  it("treats a budget of 0 as a ratio of 0 instead of Infinity", () => {
    const rows = [tx("2026-09-10", -50, "Groceries")];
    const [entry] = budgetStatus(rows, { Groceries: 0 }, "2026-09-25");

    expect(entry.ratio).toBe(0);
    expect(Number.isFinite(entry.ratio)).toBe(true);
  });

  it("returns an empty list when there are no budgets", () => {
    const rows = [tx("2026-09-10", -50, "Groceries")];

    expect(budgetStatus(rows, {}, "2026-09-25")).toEqual([]);
  });

  it("sorts by ratio descending, ties by category", () => {
    const rows = [
      tx("2026-09-10", -90, "Groceries"), // 0.9
      tx("2026-09-10", -50, "Mobility"), // 0.5
      tx("2026-09-10", -150, "Travel"), // 1.5
    ];

    const result = budgetStatus(
      rows,
      { Groceries: 100, Mobility: 100, Travel: 100, Education: 0 },
      "2026-09-25",
    );

    expect(result.map((entry) => entry.category)).toEqual([
      "Travel",
      "Groceries",
      "Mobility",
      "Education",
    ]);
  });
});

describe("budgetState", () => {
  it("separates within, close and over budget at 80% and 100%", () => {
    expect(budgetState(0)).toBe("within");
    expect(budgetState(0.799)).toBe("within");
    expect(budgetState(0.8)).toBe("close");
    expect(budgetState(1)).toBe("close");
    expect(budgetState(1.0001)).toBe("over");
  });
});

describe("data/budgets.json", () => {
  it("budgets only categories that exist in the ledger", () => {
    const root = process.cwd();
    const budgets: Record<string, number> = JSON.parse(
      readFileSync(join(root, "data", "budgets.json"), "utf8"),
    );
    const [, ...lines] = readFileSync(join(root, "data", "transactions.csv"), "utf8")
      .trim()
      .split("\n");
    const known = new Set(lines.map((line) => line.split(",")[5]));

    expect(Object.keys(budgets).length).toBeGreaterThan(0);
    for (const [category, amount] of Object.entries(budgets)) {
      expect(known).toContain(category);
      expect(amount).toBeGreaterThan(0);
    }
  });
});
