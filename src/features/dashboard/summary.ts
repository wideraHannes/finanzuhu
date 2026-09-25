import type { CategoryShare, Range, SeriesPoint, Transaction } from "@/lib/finance";

/** Exactly what `GET /api/summary` returns — the contract the cards read. */
export type DashboardSummary = {
  balance: number;
  freeToSpend: number;
  asOf: string; // ISO day the ledger ends on
  range: Range;
  income: number;
  expenses: number;
  net: number;
  series: SeriesPoint[];
  categories: CategoryShare[];
};

export async function fetchSummary(range: Range): Promise<DashboardSummary> {
  const response = await fetch(`/api/summary?range=${range}`);
  if (!response.ok) throw new Error("Could not load the summary.");
  return response.json();
}

export async function fetchTransactions(): Promise<Transaction[]> {
  const response = await fetch("/api/transactions");
  if (!response.ok) throw new Error("Could not load the transactions.");
  const { items } = await response.json();
  return items as Transaction[];
}
