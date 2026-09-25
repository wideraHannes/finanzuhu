import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatEUR, formatSignedEUR } from "@/lib/format";
import type { DashboardSummary } from "@/features/dashboard/summary";

function Tile({
  label,
  value,
  className,
  icon,
}: {
  label: string;
  value: string;
  className?: string;
  icon?: React.ReactNode;
}) {
  return (
    <Card size="sm">
      <CardContent className="space-y-1">
        <p className="flex items-center gap-1.5 text-xs tracking-widest text-muted-foreground uppercase">
          {icon}
          {label}
        </p>
        <p className={cn("tabular text-xl font-semibold", className)}>{value}</p>
      </CardContent>
    </Card>
  );
}

export function SummaryTiles({ data }: { data?: DashboardSummary }) {
  if (!data) {
    return (
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
        {[0, 1, 2].map((i) => (
          <Card key={i} size="sm">
            <CardContent className="space-y-2">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-6 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
      <Tile
        label="In"
        value={formatEUR(data.income)}
        className="text-income"
        icon={<ArrowUpRight className="size-3.5 text-income" aria-hidden />}
      />
      <Tile
        label="Out"
        value={formatEUR(data.expenses)}
        className="text-expense"
        icon={<ArrowDownLeft className="size-3.5 text-expense" aria-hidden />}
      />
      <Tile
        label="Net"
        value={formatSignedEUR(data.net)}
        className={data.net >= 0 ? "text-income" : "text-expense"}
      />
    </div>
  );
}
