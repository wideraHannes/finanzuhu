import "server-only";

import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { Transaction } from "@/lib/finance";

const CSV = join(process.cwd(), "data", "transactions.csv");

let cache: Transaction[] | null = null;

/**
 * The committed ledger, parsed once per process.
 *
 * The file is ours and contains no commas or quotes inside fields, so a
 * `split(',')` is the whole parser — a CSV dependency would only add a concept.
 */
export function getTransactions(): Transaction[] {
  if (cache) return cache;

  const [, ...lines] = readFileSync(CSV, "utf8").trim().split("\n");
  cache = lines.map((line) => {
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
    ] = line.split(",");
    return {
      id,
      date,
      amount: Number(amount),
      description,
      counterparty,
      category,
      type: type as Transaction["type"],
      method,
      recurring: recurring === "true",
    };
  });
  return cache;
}

/** The demo's "today": the last booking, not the wall clock. */
export function referenceDate(): string {
  const transactions = getTransactions();
  return transactions[transactions.length - 1].date;
}
