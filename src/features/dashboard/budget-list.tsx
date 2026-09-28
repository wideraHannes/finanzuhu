"use client";

import { useState } from "react";
import { Pencil, TriangleAlert } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { formatEUR } from "@/lib/format";
import {
  budgetState,
  type BudgetState,
  type CategoryBudget,
} from "@/lib/finance";
import type { DashboardSummary } from "@/features/dashboard/summary";

const BAR_COLOR: Record<BudgetState, string> = {
  within: "bg-income",
  close: "bg-warning",
  over: "bg-expense",
};

// Same three states as the bar, as a quiet tinted pill next to the name.
const BADGE_COLOR: Record<BudgetState, string> = {
  within: "bg-income/10 text-income",
  close: "bg-warning/15 text-warning",
  over: "bg-expense/10 text-expense",
};

/** "€ 4.80 left" / "€ 4.80 over" — the number people actually act on. */
function remainder(budget: CategoryBudget, state: BudgetState): string {
  const diff = budget.budget - budget.actual;
  return state === "over"
    ? `${formatEUR(-diff)} over`
    : `${formatEUR(diff)} left`;
}

/**
 * The planned amount as an inline editor: one field, no dialog.
 *
 * Mounted only while its row is being edited, so the draft lives and dies with
 * it — no stale value can survive a cancel. Enter and blur commit, Escape
 * cancels; an empty or unparseable field is a cancel rather than a zero, which
 * is what a mis-click on the clear button should do.
 */
function AmountEditor({
  budget,
  onCommit,
  onCancel,
}: {
  budget: number;
  onCommit: (amount: number) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState(String(budget));

  function commit() {
    const amount = Number(draft.replace(",", "."));
    if (draft.trim() === "" || !Number.isFinite(amount) || amount < 0) {
      onCancel();
      return;
    }
    // Nothing changed — spare the write and the refetch.
    if (amount === budget) onCancel();
    else onCommit(amount);
  }

  return (
    <span className="flex items-center gap-1">
      <span aria-hidden>of</span>
      <Input
        // The field only exists because the user just clicked it open.
        autoFocus
        aria-label="Monthly budget in euros"
        className="tabular h-7 w-24 px-2 text-right text-sm"
        inputMode="decimal"
        min={0}
        onBlur={commit}
        onChange={(event) => setDraft(event.target.value)}
        onFocus={(event) => event.target.select()}
        onKeyDown={(event) => {
          if (event.key === "Enter") commit();
          if (event.key === "Escape") onCancel();
        }}
        step={10}
        type="number"
        value={draft}
      />
    </span>
  );
}

/**
 * Plan against actual, one row per budgeted category.
 *
 * Only categories that have an entry in the budget plan appear here —
 * unbudgeted spending belongs to the transactions view, not to this card.
 * The figures always cover the calendar month of `asOf`, independent of the
 * range the rest of the dashboard shows: a monthly plan has no meaning in a
 * rolling week or quarter.
 *
 * The planned amounts are editable in place. A save patches every cached
 * summary optimistically — the bar and the pill are the feedback, so they have
 * to move on the click, not on the refetch that follows it.
 */
export function BudgetList({ data }: { data?: DashboardSummary }) {
  const budgets = data?.budgets ?? [];
  const [editing, setEditing] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const save = useMutation({
    mutationFn: async (next: { category: string; amount: number }) => {
      const response = await fetch("/api/budgets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      if (!response.ok) throw new Error("The budget could not be saved.");
      return response.json();
    },
    onMutate: ({ category, amount }) => {
      queryClient.setQueriesData<DashboardSummary>(
        { queryKey: ["summary"] },
        (summary) =>
          summary && {
            ...summary,
            budgets: summary.budgets.map((budget) =>
              budget.category === category
                ? {
                    ...budget,
                    budget: amount,
                    ratio: amount > 0 ? budget.actual / amount : 0,
                  }
                : budget,
            ),
          },
      );
    },
    // Whether the write landed or failed, the server holds the truth: refetch
    // instead of unwinding the patch by hand.
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["summary"] }),
  });

  // The plan total of the month, so the card answers "how am I doing overall?"
  // before the eye walks the list.
  const totals = budgets.reduce(
    (sum, b) => ({
      actual: sum.actual + b.actual,
      budget: sum.budget + b.budget,
    }),
    { actual: 0, budget: 0 },
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budgets</CardTitle>
        {data && budgets.length > 0 && (
          <CardAction className="tabular text-sm text-muted-foreground">
            <span
              className={`font-medium ${
                totals.actual > totals.budget ? "text-expense" : "text-foreground"
              }`}
            >
              {formatEUR(totals.actual)}
            </span>{" "}
            of {formatEUR(totals.budget)}
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        {!data ? (
          <ul className="space-y-4">
            {Array.from({ length: 6 }, (_, i) => (
              <li key={i} className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-2 w-full" />
              </li>
            ))}
          </ul>
        ) : budgets.length === 0 ? (
          <p className="text-sm text-muted-foreground">No budgets set.</p>
        ) : (
          <ul className="space-y-4">
            {budgets.map((budget) => {
              const state = budgetState(budget.ratio);

              return (
                <li key={budget.category} className="group space-y-1.5">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="truncate font-medium">
                        {budget.category}
                      </span>
                      <span
                        className={`tabular shrink-0 rounded-full px-1.5 py-0.5 text-xs font-medium ${BADGE_COLOR[state]}`}
                      >
                        {state === "over" && (
                          <TriangleAlert
                            aria-label="Over budget"
                            className="mr-1 inline size-3 -translate-y-px"
                          />
                        )}
                        {Math.round(budget.ratio * 100)}%
                      </span>
                    </span>
                    <span className="tabular flex shrink-0 items-center gap-1 text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {formatEUR(budget.actual)}
                      </span>
                      {editing === budget.category ? (
                        <AmountEditor
                          budget={budget.budget}
                          onCancel={() => setEditing(null)}
                          onCommit={(amount) => {
                            setEditing(null);
                            save.mutate({ category: budget.category, amount });
                          }}
                        />
                      ) : (
                        <button
                          aria-label={`Edit the budget for ${budget.category}`}
                          className="flex items-center gap-1 rounded-md px-1 py-0.5 -mr-1 transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                          onClick={() => setEditing(budget.category)}
                          type="button"
                        >
                          of {formatEUR(budget.budget)}
                          <Pencil className="size-3 opacity-0 transition-opacity group-hover:opacity-60 group-focus-within:opacity-60" />
                        </button>
                      )}
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-[width] duration-500 ${BAR_COLOR[state]}`}
                      style={{
                        // Over budget fills the bar; the number keeps the truth.
                        width: `${Math.max(Math.min(budget.ratio, 1) * 100, 1)}%`,
                      }}
                    />
                  </div>

                  <p
                    className={`tabular text-xs ${
                      state === "over" ? "text-expense" : "text-muted-foreground"
                    }`}
                  >
                    {remainder(budget, state)}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
        {save.isError && (
          <p className="mt-4 text-xs text-destructive">
            The budget could not be saved. Please try again.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
