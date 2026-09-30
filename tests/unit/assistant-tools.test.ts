import { describe, expect, it } from "vitest";

import { searchTransactions } from "@/lib/assistant-tools";
import type { Transaction } from "@/lib/finance";

/** A booking with only the fields the search looks at. */
function tx(date: string, amount: number, category: string): Transaction {
  return {
    id: date + amount + category,
    date,
    amount,
    description: `${category} on ${date}`,
    counterparty: "test",
    category,
    type: amount >= 0 ? "income" : "expense",
    method: "card",
    recurring: false,
  };
}

const LEDGER = [
  tx("2026-07-31", -10, "Mobility"),
  tx("2026-08-01", -20, "Mobility"),
  tx("2026-08-15", -40, "Groceries"),
  tx("2026-08-31", -30, "Mobility"),
  tx("2026-09-01", -50, "Mobility"),
];

describe("searchTransactions", () => {
  it("filters by an inclusive date range", () => {
    const result = searchTransactions(
      [LEDGER[0], LEDGER[1], LEDGER[3], LEDGER[4]],
      { from: "2026-08-01", to: "2026-08-31" },
    );

    expect(result.transactions.map((t) => t.date)).toEqual([
      "2026-08-01",
      "2026-08-31",
    ]);
    expect(result.count).toBe(2);
    expect(result.total).toBe(-50);
  });

  it("filters by category", () => {
    const result = searchTransactions(LEDGER, { category: "Groceries" });

    expect(result).toEqual({
      count: 1,
      total: -40,
      transactions: [
        {
          date: "2026-08-15",
          amount: -40,
          description: "Groceries on 2026-08-15",
          counterparty: "test",
          category: "Groceries",
        },
      ],
    });
  });

  it("combines date range and category", () => {
    const result = searchTransactions(LEDGER, {
      from: "2026-08-01",
      to: "2026-08-31",
      category: "Mobility",
    });

    expect(result.transactions.map((t) => t.date)).toEqual([
      "2026-08-01",
      "2026-08-31",
    ]);
    expect(result.total).toBe(-50);
  });

  it("returns an empty result when nothing matches", () => {
    expect(searchTransactions(LEDGER, { category: "Travel" })).toEqual({
      count: 0,
      total: 0,
      transactions: [],
    });
  });

  it("rounds the total to cents", () => {
    const rows = [tx("2026-08-01", -0.1, "Fees"), tx("2026-08-02", -0.2, "Fees")];

    expect(searchTransactions(rows, {}).total).toBe(-0.3);
  });
});
