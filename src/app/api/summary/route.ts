import { account } from "@/lib/account";
import { getBudgets } from "@/lib/budgets";
import {
  balance,
  budgetStatus,
  byCategory,
  dailySeries,
  freeToSpend,
  summarize,
  type Range,
} from "@/lib/finance";
import { getTransactions, referenceDate } from "@/lib/transactions";

const RANGES: Range[] = ["week", "month", "3m"];

export function GET(request: Request) {
  const param = new URL(request.url).searchParams.get("range");
  const range = RANGES.includes(param as Range) ? (param as Range) : "3m";

  const transactions = getTransactions();
  const reference = referenceDate();
  const current = balance(transactions, account.openingBalance);

  return Response.json({
    balance: current,
    freeToSpend: freeToSpend(transactions, current),
    asOf: reference,
    range,
    ...summarize(transactions, range, reference),
    series: dailySeries(transactions, range, reference, account.openingBalance),
    categories: byCategory(transactions, range, reference),
    // Always the calendar month of `asOf`, independent of `range` — a monthly
    // plan has no meaning in a rolling week or quarter window.
    budgets: budgetStatus(transactions, getBudgets(), reference),
  });
}
