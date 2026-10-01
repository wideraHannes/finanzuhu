import { describe, expect, it } from "vitest";

import { spendingOverview, type Transaction } from "@/lib/finance";

function tx(date: string, amount: number, category: string): Transaction {
  return {
    id: `${date}-${amount}-${category}`,
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

describe("spendingOverview", () => {
  it("groups negative bookings into positive category totals", () => {
    const rows = [
      tx("2026-08-02", -12.5, "Groceries"),
      tx("2026-08-03", -7.25, "Transport"),
      tx("2026-08-04", -4.5, "Groceries"),
      tx("2026-08-05", 99, "Salary"),
    ];

    expect(
      spendingOverview(rows, "2026-08-01", "2026-08-31").categories,
    ).toEqual([
      { label: "Groceries", total: 17 },
      { label: "Transport", total: 7.25 },
    ]);
  });

  it("uses inclusive boundaries and returns chronological monthly totals", () => {
    const rows = [
      tx("2026-07-31", -100, "Outside"),
      tx("2026-08-01", -10, "Groceries"),
      tx("2026-08-31", -15, "Groceries"),
      tx("2026-09-01", -20, "Utilities"),
      tx("2026-09-02", -100, "Outside"),
    ];

    expect(spendingOverview(rows, "2026-08-01", "2026-09-01").months).toEqual([
      { label: "2026-08", total: 25 },
      { label: "2026-09", total: 20 },
    ]);
  });

  it("returns empty aggregates when the range has no spending", () => {
    expect(
      spendingOverview(
        [tx("2026-08-01", 50, "Salary")],
        "2026-08-01",
        "2026-08-31",
      ),
    ).toEqual({ categories: [], months: [] });
  });
});
