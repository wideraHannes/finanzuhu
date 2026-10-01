/**
 * The money math. Pure functions over plain arrays — no I/O, no next/*,
 * no date library. This is the file the example tests are written against.
 *
 * Every function takes an explicit `reference` date instead of reading the
 * clock: the ledger is a fixed simulation, so "today" is the last booking,
 * not the day someone happens to run the demo.
 */

export type Range = "week" | "month" | "3m";

export type Transaction = {
  id: string;
  date: string; // ISO day, e.g. "2026-09-25"
  amount: number; // signed euros: income positive, expenses negative
  description: string;
  counterparty: string;
  category: string;
  type: "income" | "expense";
  method: string;
  recurring: boolean;
};

export type Summary = {
  income: number; // positive
  expenses: number; // positive magnitude
  net: number; // income - expenses
};

export type CategoryShare = {
  category: string;
  total: number; // positive magnitude
  share: number; // 0..1 of all expenses in the range
};

export type SpendingBucket = {
  label: string; // category name or YYYY-MM
  total: number; // positive expense magnitude
};

export type SpendingOverview = {
  categories: SpendingBucket[];
  months: SpendingBucket[];
};

export type CategoryBudget = {
  category: string;
  budget: number; // planned monthly amount, positive euros
  actual: number; // positive magnitude of the month's expenses
  ratio: number; // actual / budget; 0 when nothing is budgeted
};

/** How a category stands against its budget. Thresholds: 80 % and 100 %. */
export type BudgetState = "within" | "close" | "over";

export type SeriesPoint = {
  date: string; // ISO day the bucket starts on
  income: number;
  expenses: number; // positive magnitude
  balance: number; // account balance at the end of the bucket
};

const DAY = 24 * 60 * 60 * 1000;

function toDate(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
}

function toISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** First day (inclusive) of the given range, counting back from `reference`. */
export function rangeStart(range: Range, reference: string): string {
  const d = toDate(reference);
  if (range === "week") {
    return toISO(new Date(d.getTime() - 6 * DAY));
  }
  d.setUTCMonth(d.getUTCMonth() - (range === "month" ? 1 : 3));
  return toISO(new Date(d.getTime() + DAY));
}

/** The bookings of `range`, still sorted by date ascending. */
export function inRange(
  transactions: Transaction[],
  range: Range,
  reference: string,
): Transaction[] {
  const start = rangeStart(range, reference);
  return transactions.filter((t) => t.date >= start && t.date <= reference);
}

/** Opening balance plus every booking — the account balance. */
export function balance(transactions: Transaction[], opening: number): number {
  return transactions.reduce((sum, t) => sum + t.amount, opening);
}

/** In, out and the difference for one range. */
export function summarize(
  transactions: Transaction[],
  range: Range,
  reference: string,
): Summary {
  let income = 0;
  let expenses = 0;
  for (const t of inRange(transactions, range, reference)) {
    if (t.amount >= 0) income += t.amount;
    else expenses -= t.amount;
  }
  return { income, expenses, net: income - expenses };
}

/** Expenses of the range per category, biggest first. */
export function byCategory(
  transactions: Transaction[],
  range: Range,
  reference: string,
): CategoryShare[] {
  const totals = new Map<string, number>();
  let all = 0;
  for (const t of inRange(transactions, range, reference)) {
    if (t.amount >= 0) continue;
    totals.set(t.category, (totals.get(t.category) ?? 0) - t.amount);
    all -= t.amount;
  }
  return [...totals]
    .map(([category, total]) => ({
      category,
      total,
      share: all === 0 ? 0 : total / all,
    }))
    .sort((a, b) => b.total - a.total);
}

/** "2026-09-25" -> "2026-09" — the calendar month a booking belongs to. */
export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

/** Historical spending, grouped by category and calendar month. */
export function spendingOverview(
  transactions: Transaction[],
  from: string,
  to: string,
): SpendingOverview {
  const categories = new Map<string, number>();
  const months = new Map<string, number>();

  for (const transaction of transactions) {
    if (
      transaction.amount >= 0 ||
      transaction.date < from ||
      transaction.date > to
    ) {
      continue;
    }

    const amount = -transaction.amount;
    categories.set(
      transaction.category,
      (categories.get(transaction.category) ?? 0) + amount,
    );
    const month = monthKey(transaction.date);
    months.set(month, (months.get(month) ?? 0) + amount);
  }

  return {
    categories: [...categories]
      .map(([label, total]) => ({ label, total }))
      .sort((a, b) => b.total - a.total || a.label.localeCompare(b.label)),
    months: [...months]
      .map(([label, total]) => ({ label, total }))
      .sort((a, b) => a.label.localeCompare(b.label)),
  };
}

/**
 * Plan against actual per budgeted category, for the calendar month of
 * `reference`.
 *
 * One entry per budget key, so a budgeted category without a single booking
 * still shows up with an actual of 0. Categories that have bookings but no
 * budget are left out — the plain share list keeps rendering those.
 *
 * The ratio is not capped: the UI caps the bar, the number stays honest.
 */
export function budgetStatus(
  transactions: Transaction[],
  budgets: Record<string, number>,
  reference: string,
): CategoryBudget[] {
  const month = monthKey(reference);
  const actuals = new Map<string, number>();
  for (const t of transactions) {
    if (t.amount >= 0) continue;
    if (monthKey(t.date) !== month) continue;
    if (!(t.category in budgets)) continue;
    actuals.set(t.category, (actuals.get(t.category) ?? 0) - t.amount);
  }

  return Object.entries(budgets)
    .map(([category, budget]) => {
      const actual = actuals.get(category) ?? 0;
      return {
        category,
        budget,
        actual,
        ratio: budget > 0 ? actual / budget : 0,
      };
    })
    .sort((a, b) => b.ratio - a.ratio || a.category.localeCompare(b.category));
}

/** The three states a budget bar can be in. */
export function budgetState(ratio: number): BudgetState {
  if (ratio > 1) return "over";
  if (ratio >= 0.8) return "close";
  return "within";
}

/**
 * The chart data: daily buckets for week and month, weekly for 3m.
 * `balance` is the running account balance, so the line starts where the
 * account actually stood — bookings before the range are counted in.
 */
export function dailySeries(
  transactions: Transaction[],
  range: Range,
  reference: string,
  opening: number,
): SeriesPoint[] {
  const start = rangeStart(range, reference);
  const bucketDays = range === "3m" ? 7 : 1;

  let running = transactions
    .filter((t) => t.date < start)
    .reduce((sum, t) => sum + t.amount, opening);

  const points: SeriesPoint[] = [];
  const end = toDate(reference).getTime();
  for (let t = toDate(start).getTime(); t <= end; t += bucketDays * DAY) {
    const from = toISO(new Date(t));
    const to = toISO(new Date(t + bucketDays * DAY));
    let income = 0;
    let expenses = 0;
    for (const tx of transactions) {
      if (tx.date < from || tx.date >= to) continue;
      if (tx.amount >= 0) income += tx.amount;
      else expenses -= tx.amount;
    }
    running += income - expenses;
    points.push({ date: from, income, expenses, balance: running });
  }
  return points;
}

/**
 * What is left once the known fixed costs before the next salary are gone.
 *
 * The salary lands on the 25th and the standing orders between the 1st and the
 * 15th, so "still due this month" is zero on the reference date. The useful
 * horizon is one full cycle: every standing order due before the next pay day.
 */
export function freeToSpend(
  transactions: Transaction[],
  currentBalance: number,
): number {
  // One entry per standing order; the CSV is sorted, so the latest amount wins.
  const perContract = new Map<string, number>();
  for (const t of transactions) {
    if (!t.recurring || t.amount >= 0) continue;
    perContract.set(`${t.counterparty}|${t.category}`, -t.amount);
  }
  const fixed = [...perContract.values()].reduce((sum, a) => sum + a, 0);
  return currentBalance - fixed;
}
