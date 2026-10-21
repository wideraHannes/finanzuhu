import type { CategoryShare, Range, SeriesPoint } from "@/lib/finance";

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
