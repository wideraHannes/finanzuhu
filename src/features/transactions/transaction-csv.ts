import {
  formatPaymentMethod,
  formatShortDate,
  formatSignedEUR,
} from "@/lib/format";
import type { Transaction } from "@/lib/finance";

const DELIMITER = ";";
const HEADERS = ["date", "description", "category", "method", "amount"];

function escapeCsvField(value: string): string {
  return /[;"\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/** Serializes ledger rows in their supplied order for spreadsheet download. */
export function transactionsToCsv(transactions: Transaction[]): string {
  const rows = transactions.map((transaction) =>
    [
      formatShortDate(transaction.date),
      transaction.description,
      transaction.category,
      formatPaymentMethod(transaction.method),
      formatSignedEUR(transaction.amount),
    ]
      .map(escapeCsvField)
      .join(DELIMITER),
  );

  return [HEADERS.join(DELIMITER), ...rows].join("\r\n");
}
