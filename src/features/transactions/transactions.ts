import type { Transaction } from "@/lib/finance";

/** The three filters the ledger screen offers; "" always means "no filter". */
export type TransactionFilters = {
  q: string;
  category: string;
  type: "" | "income" | "expense";
};

export const NO_FILTERS: TransactionFilters = { q: "", category: "", type: "" };

/** Exactly what `GET /api/transactions` returns. */
export type TransactionsResponse = {
  items: Transaction[];
  total: number; // bookings in the ledger, ignoring the filters
  categories: string[]; // every category, so the select stays stable
};

export async function fetchTransactions(
  filters: TransactionFilters,
): Promise<TransactionsResponse> {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.category) params.set("category", filters.category);
  if (filters.type) params.set("type", filters.type);

  const response = await fetch(`/api/transactions?${params}`);
  if (!response.ok) throw new Error("Could not load the transactions.");
  return response.json();
}
