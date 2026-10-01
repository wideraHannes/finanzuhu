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

export type TransactionInput = Omit<Transaction, "id">;

async function mutation<T>(url: string, options: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      typeof body?.error === "string"
        ? body.error
        : "The transaction could not be updated.",
    );
  }
  return body as T;
}

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

export function createTransaction(
  input: TransactionInput,
): Promise<Transaction> {
  return mutation("/api/transactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function removeTransaction(
  id: string,
): Promise<{ items: Transaction[] }> {
  return mutation(`/api/transactions/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export function resetTransactions(): Promise<{ items: Transaction[] }> {
  return mutation("/api/transactions/reset", { method: "POST" });
}
