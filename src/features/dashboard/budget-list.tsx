import { TriangleAlert } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatEUR } from "@/lib/format";
import { budgetState, type BudgetState } from "@/lib/finance";
import type { DashboardSummary } from "@/features/dashboard/summary";

const TOP = 6;

const BAR_COLOR: Record<BudgetState, string> = {
  within: "bg-income",
  close: "bg-warning",
  over: "bg-expense",
};

/**
 * The expense breakdown of the selected range.
 *
 * With `showBudgets`, every category that has an entry in the budget plan
 * swaps its share bar for a plan/actual bar. The budget figures always cover
 * the calendar month of `asOf`, so the card only offers them on the month tab.
 * Categories without a budget keep the plain share rendering.
 */
export function CategoryList({
  data,
  showBudgets = false,
}: {
  data?: DashboardSummary;
  showBudgets?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{showBudgets ? "Categories and budgets" : "Top categories"}</CardTitle>
      </CardHeader>
      <CardContent>
        {!data ? (
          <ul className="space-y-4">
            {Array.from({ length: TOP }, (_, i) => (
              <li key={i} className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-1 w-full" />
              </li>
            ))}
          </ul>
        ) : data.categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No expenses in this range.
          </p>
        ) : (
          <ul className="space-y-4">
            {data.categories.slice(0, TOP).map((category) => {
              // Absent when the file is missing or the category is unbudgeted —
              // both fall back to the share bar.
              const budget = showBudgets
                ? data.budgets?.find((b) => b.category === category.category)
                : undefined;
              const state = budget ? budgetState(budget.ratio) : null;

              return (
                <li key={category.category} className="space-y-1.5">
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span>{category.category}</span>
                    {budget && state ? (
                      <span className="tabular shrink-0 text-muted-foreground">
                        {state === "over" && (
                          <TriangleAlert
                            aria-label="Over budget"
                            className="mr-1 inline size-3.5 -translate-y-px text-expense"
                          />
                        )}
                        <span className="font-medium text-foreground">
                          {formatEUR(budget.actual)}
                        </span>{" "}
                        / {formatEUR(budget.budget)}{" "}
                        {Math.round(budget.ratio * 100)}%
                      </span>
                    ) : (
                      <span className="tabular shrink-0 text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {formatEUR(category.total)}
                        </span>{" "}
                        {Math.round(category.share * 100)}%
                      </span>
                    )}
                  </div>
                  <div className="h-1 rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${
                        state ? BAR_COLOR[state] : "bg-expense"
                      }`}
                      style={{
                        width: budget
                          ? // Over budget fills the bar; the number keeps the truth.
                            `${Math.max(Math.min(budget.ratio, 1) * 100, 1)}%`
                          : `${Math.max(category.share * 100, 1)}%`,
                      }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
