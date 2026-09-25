import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatEUR } from "@/lib/format";
import type { DashboardSummary } from "@/features/dashboard/summary";

const TOP = 6;

export function CategoryList({ data }: { data?: DashboardSummary }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top categories</CardTitle>
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
            {data.categories.slice(0, TOP).map((category) => (
              <li key={category.category} className="space-y-1.5">
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span>{category.category}</span>
                  <span className="tabular shrink-0 text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {formatEUR(category.total)}
                    </span>{" "}
                    {Math.round(category.share * 100)}%
                  </span>
                </div>
                <div className="h-1 rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-expense"
                    style={{ width: `${Math.max(category.share * 100, 1)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
