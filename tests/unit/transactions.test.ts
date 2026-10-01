import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import {
  createTransactionLedger,
  InvalidTransactionError,
  TransactionNotFoundError,
} from "@/lib/transactions";

const HEADER =
  "id,date,amount,description,counterparty,category,type,method,recurring\n";
const SEED = `${HEADER}tx_1,2026-09-25,-10.00,Coffee,Cafe,Food,expense,card,false\n`;
const directories: string[] = [];

function testLedger() {
  const directory = mkdtempSync(join(tmpdir(), "finanzuhu-ledger-"));
  directories.push(directory);
  const ledgerPath = join(directory, "transactions.csv");
  const defaultLedgerPath = join(directory, "transactions.default.csv");
  writeFileSync(ledgerPath, SEED);
  writeFileSync(defaultLedgerPath, SEED);
  return {
    ledgerPath,
    defaultLedgerPath,
    ledger: createTransactionLedger({ ledgerPath, defaultLedgerPath }),
  };
}

afterEach(() =>
  directories
    .splice(0)
    .forEach((directory) =>
      rmSync(directory, { recursive: true, force: true }),
    ),
);

describe("transaction ledger", () => {
  it("creates a persisted transaction with a unique ID", () => {
    const { ledgerPath, defaultLedgerPath, ledger } = testLedger();
    const created = ledger.createTransaction({
      date: "2026-10-01",
      amount: 12.5,
      description: "Refund",
      counterparty: "Shop",
      category: "Other",
      type: "income",
      method: "transfer",
      recurring: false,
    });
    expect(created.id).not.toBe("tx_1");
    expect(
      createTransactionLedger({
        ledgerPath,
        defaultLedgerPath,
      }).getTransactions(),
    ).toContainEqual(created);
  });

  it("rejects invalid input without changing the ledger", () => {
    const { ledgerPath, ledger } = testLedger();
    expect(() =>
      ledger.createTransaction({
        date: "2026-02-30",
        amount: Infinity,
        description: "Bad, text",
        counterparty: "",
        category: "Food",
        type: "other" as "income",
        method: "card",
        recurring: false,
      }),
    ).toThrow(InvalidTransactionError);
    expect(readFileSync(ledgerPath, "utf8")).toBe(SEED);
  });

  it("removes known IDs and preserves unknown-ID state", () => {
    const { ledgerPath, ledger } = testLedger();
    expect(ledger.removeTransaction("tx_1")).toEqual([]);
    expect(() => ledger.removeTransaction("missing")).toThrow(
      TransactionNotFoundError,
    );
    expect(readFileSync(ledgerPath, "utf8")).toBe(HEADER);
  });

  it("restores the exact default ledger", () => {
    const { ledgerPath, ledger } = testLedger();
    ledger.removeTransaction("tx_1");
    ledger.resetTransactions();
    expect(readFileSync(ledgerPath, "utf8")).toBe(SEED);
  });
});
