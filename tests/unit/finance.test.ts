import { describe, expect, it } from "vitest";

import { balance, summarize, type Transaction } from "@/lib/finance";

/** A booking with only the fields the money math looks at. */
function tx(date: string, amount: number): Transaction {
  return {
    id: date + amount,
    date,
    amount,
    description: "test",
    counterparty: "test",
    category: "Groceries",
    type: amount >= 0 ? "income" : "expense",
    method: "card",
    recurring: false,
  };
}

describe("balance", () => {
  it("adds the opening balance and every booking", () => {
    const rows = [
      tx("2026-09-01", 3000),
      tx("2026-09-02", -800),
      tx("2026-09-03", -45.5),
    ];

    expect(balance(rows, 1000)).toBe(3154.5);
  });
});

describe("summarize", () => {
  it("splits income and expenses and ignores bookings outside the range", () => {
    const rows = [
      tx("2026-09-20", 500), // inside the last week
      tx("2026-09-24", -120),
      tx("2026-08-01", -9999), // outside — must not count
    ];

    expect(summarize(rows, "week", "2026-09-25")).toEqual({
      income: 500,
      expenses: 120,
      net: 380,
    });
  });
});
