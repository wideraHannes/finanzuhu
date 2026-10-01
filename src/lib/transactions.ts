import "server-only";

import { randomUUID } from "node:crypto";
import { readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import type { Transaction } from "@/lib/finance";

const CSV = join(process.cwd(), "data", "transactions.csv");
const DEFAULT_CSV = join(process.cwd(), "data", "transactions.default.csv");
const HEADER =
  "id,date,amount,description,counterparty,category,type,method,recurring";

type FileSystem = Pick<
  typeof import("node:fs"),
  "readFileSync" | "writeFileSync" | "renameSync" | "unlinkSync"
>;

export type TransactionInput = Omit<Transaction, "id">;

export class InvalidTransactionError extends Error {}
export class TransactionNotFoundError extends Error {}

function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value
  );
}

function parseLedger(contents: string): Transaction[] {
  const lines = contents.trim().split(/\r?\n/);
  if (lines[0] !== HEADER)
    throw new Error("The transaction ledger has an invalid header.");
  return lines.slice(1).map((line) => {
    const fields = line.split(",");
    const [
      id,
      date,
      amount,
      description,
      counterparty,
      category,
      type,
      method,
      recurring,
    ] = fields;
    if (
      fields.length !== 9 ||
      !id ||
      !isCalendarDate(date) ||
      !Number.isFinite(Number(amount)) ||
      (type !== "income" && type !== "expense") ||
      (recurring !== "true" && recurring !== "false")
    ) {
      throw new Error("The transaction ledger contains invalid data.");
    }
    return {
      id,
      date,
      amount: Number(amount),
      description,
      counterparty,
      category,
      type,
      method,
      recurring: recurring === "true",
    };
  });
}

function serializeLedger(transactions: Transaction[]): string {
  const rows = transactions.map((transaction) =>
    [
      transaction.id,
      transaction.date,
      transaction.amount.toFixed(2),
      transaction.description,
      transaction.counterparty,
      transaction.category,
      transaction.type,
      transaction.method,
      transaction.recurring,
    ].join(","),
  );
  return `${HEADER}\n${rows.length ? `${rows.join("\n")}\n` : ""}`;
}

function validateInput(input: TransactionInput): void {
  const textFields = [
    input.date,
    input.description,
    input.counterparty,
    input.category,
    input.method,
  ];
  if (
    textFields.some(
      (value) =>
        typeof value !== "string" || !value.trim() || /[,\r\n]/.test(value),
    )
  ) {
    throw new InvalidTransactionError(
      "Text fields are required and cannot contain commas or line breaks.",
    );
  }
  if (!isCalendarDate(input.date))
    throw new InvalidTransactionError(
      "Date must be a real YYYY-MM-DD calendar date.",
    );
  if (!Number.isFinite(input.amount))
    throw new InvalidTransactionError("Amount must be a finite number.");
  if (input.type !== "income" && input.type !== "expense")
    throw new InvalidTransactionError("Type must be income or expense.");
  if (typeof input.recurring !== "boolean")
    throw new InvalidTransactionError("Recurring must be true or false.");
}

/** Creates an isolated ledger service; tests bind it to temporary files. */
export function createTransactionLedger({
  ledgerPath = CSV,
  defaultLedgerPath = DEFAULT_CSV,
  fileSystem = { readFileSync, writeFileSync, renameSync, unlinkSync },
}: {
  ledgerPath?: string;
  defaultLedgerPath?: string;
  fileSystem?: FileSystem;
} = {}) {
  let cache: Transaction[] | null = null;

  function read(): Transaction[] {
    if (!cache)
      cache = parseLedger(
        fileSystem.readFileSync(/* turbopackIgnore: true */ ledgerPath, "utf8"),
      );
    return cache;
  }

  function replace(transactions: Transaction[]): Transaction[] {
    const temporaryPath = `${ledgerPath}.${randomUUID()}.tmp`;
    try {
      fileSystem.writeFileSync(
        temporaryPath,
        serializeLedger(transactions),
        "utf8",
      );
      fileSystem.renameSync(temporaryPath, ledgerPath);
    } catch (error) {
      try {
        fileSystem.unlinkSync(temporaryPath);
      } catch {
        /* nothing to clean up */
      }
      throw error;
    }
    cache = transactions;
    return transactions;
  }

  return {
    getTransactions: read,
    createTransaction(input: TransactionInput): Transaction {
      validateInput(input);
      const current = read();
      let id: string;
      do id = `tx_${randomUUID()}`;
      while (current.some((transaction) => transaction.id === id));
      const created = { ...input, id };
      replace(
        [...current, created].sort(
          (a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id),
        ),
      );
      return created;
    },
    removeTransaction(id: string): Transaction[] {
      const current = read();
      const next = current.filter((transaction) => transaction.id !== id);
      if (next.length === current.length)
        throw new TransactionNotFoundError("Transaction not found.");
      return replace(next);
    },
    resetTransactions(): Transaction[] {
      return replace(
        parseLedger(
          fileSystem.readFileSync(
            /* turbopackIgnore: true */ defaultLedgerPath,
            "utf8",
          ),
        ),
      );
    },
  };
}

const ledger = createTransactionLedger();

/**
 * The committed ledger, parsed once per process.
 *
 * The file is ours and contains no commas or quotes inside fields, so a
 * `split(',')` is the whole parser — a CSV dependency would only add a concept.
 */
export const getTransactions = ledger.getTransactions;
export const createTransaction = ledger.createTransaction;
export const removeTransaction = ledger.removeTransaction;
export const resetTransactions = ledger.resetTransactions;

/** The demo's "today": the last booking, not the wall clock. */
export function referenceDate(): string {
  return getTransactions().reduce(
    (latest, transaction) =>
      transaction.date > latest ? transaction.date : latest,
    "",
  );
}
