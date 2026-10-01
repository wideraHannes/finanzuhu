import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatEUR } from "@/lib/format";
import type { DashboardSummary } from "@/features/dashboard/summary";

export function BalanceHero({ data }: { data?: DashboardSummary }) {
  if (!data) {
    return (
      <Card>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-11 w-64" />
          <Skeleton className="h-4 w-72" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-1">
        <p className="text-xs tracking-widest text-muted-foreground uppercase">
          Balance
        </p>
        <p className="tabular text-4xl font-semibold md:text-5xl">
          {formatEUR(data.balance)}
        </p>
        <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm text-muted-foreground">
          <span>
            Free to spend{" "}
            <span className="tabular font-medium text-foreground">
              {formatEUR(data.freeToSpend)}
            </span>
          </span>
          <span aria-hidden>·</span>
          <span>as of {formatDate(data.asOf)}</span>
        </p>
      </CardContent>
    </Card>
  );
}
