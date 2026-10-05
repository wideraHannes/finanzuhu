import { describe, expect, it } from "vitest";

import { transactionsToCsv } from "@/features/transactions/transaction-csv";
import type { Transaction } from "@/lib/finance";

function tx(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: "transaction-1",
    date: "2026-09-25",
    amount: -12.5,
    description: "Weekly groceries",
    counterparty: "Market Hall",
    category: "Groceries",
    type: "expense",
    method: "direct_debit",
    recurring: false,
    ...overrides,
  };
}

describe("transactionsToCsv", () => {
  it("exports exactly the visible table columns with table formatting", () => {
    expect(
      transactionsToCsv([
        tx(),
        tx({ id: "income", amount: 1250, method: "bank_transfer" }),
      ]),
    ).toBe(
      [
        "date;description;category;method;amount",
        "25.09.26;Weekly groceries;Groceries;Direct debit;-12,50 €",
        "25.09.26;Weekly groceries;Groceries;Bank transfer;+1.250,00 €",
      ].join("\r\n"),
    );
  });

  it("preserves the supplied ledger order", () => {
    const csv = transactionsToCsv([
      tx({ id: "later", date: "2026-10-02", description: "Later" }),
      tx({ id: "earlier", date: "2026-08-01", description: "Earlier" }),
    ]);

    expect(csv.split("\r\n").slice(1)).toEqual([
      "02.10.26;Later;Groceries;Direct debit;-12,50 €",
      "01.08.26;Earlier;Groceries;Direct debit;-12,50 €",
    ]);
  });

  it("escapes delimiters, quotation marks, and line breaks", () => {
    expect(
      transactionsToCsv([
        tx({
          description: 'Store; "special"\norder',
          category: "Food; home",
        }),
      ]),
    ).toBe(
      [
        "date;description;category;method;amount",
        '25.09.26;"Store; ""special""\norder";"Food; home";Direct debit;-12,50 €',
      ].join("\r\n"),
    );
  });

  it("exports only a header when the ledger is empty", () => {
    expect(transactionsToCsv([])).toBe(
      "date;description;category;method;amount",
    );
  });
});
