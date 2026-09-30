import type { Transaction } from "@/lib/finance";

/** The filters of the assistant's `search_transactions` tool; absent means "no filter". */
export type TransactionQuery = {
  from?: string; // inclusive ISO day
  to?: string; // inclusive ISO day
  category?: string;
  type?: "income" | "expense";
};

export type TransactionSearchResult = {
  count: number;
  total: number; // signed sum in euros, rounded to cents
  transactions: Pick<
    Transaction,
    "date" | "amount" | "description" | "counterparty" | "category"
  >[];
};

/**
 * The bookings matching `query` plus their sum.
 *
 * The code adds up, not the model — that is what keeps the assistant's
 * totals honest. Takes the ledger as a parameter so it stays testable.
 */
export function searchTransactions(
  transactions: Transaction[],
  query: TransactionQuery,
): TransactionSearchResult {
  const matches = transactions.filter(
    (t) =>
      (!query.from || t.date >= query.from) &&
      (!query.to || t.date <= query.to) &&
      (!query.category || t.category === query.category) &&
      (!query.type || t.type === query.type),
  );
  const total = matches.reduce((sum, t) => sum + t.amount, 0);

  return {
    count: matches.length,
    total: Math.round(total * 100) / 100,
    transactions: matches.map(
      ({ date, amount, description, counterparty, category }) => ({
        date,
        amount,
        description,
        counterparty,
        category,
      }),
    ),
  };
}
