"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { BalanceHero } from "@/features/dashboard/balance-hero";
import { BudgetList } from "@/features/dashboard/budget-list";
import { CashflowChart } from "@/features/dashboard/cashflow-chart";
import { RangeTabs } from "@/features/dashboard/range-tabs";
import { RecentActivity } from "@/features/dashboard/recent-activity";
import { SummaryTiles } from "@/features/dashboard/summary-tiles";
import { fetchSummary } from "@/features/dashboard/summary";
import type { Range } from "@/lib/finance";

export default function DashboardPage() {
  // The only state on this screen; the chart and the tiles read it. The budget
  // card is always the current calendar month.
  const [range, setRange] = useState<Range>("month");

  const { data, isError, refetch } = useQuery({
    queryKey: ["summary", range],
    queryFn: () => fetchSummary(range),
  });

  if (isError) {
    return (
      <div className="space-y-3 py-10 text-center">
        <p className="text-sm text-muted-foreground">
          The summary could not be loaded.
        </p>
        <Button variant="outline" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BalanceHero data={data} />

      <div className="flex justify-end">
        <RangeTabs range={range} onRangeChange={setRange} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <CashflowChart data={data} />
        <SummaryTiles data={data} />
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <BudgetList data={data} />
        <RecentActivity />
      </div>
    </div>
  );
}
