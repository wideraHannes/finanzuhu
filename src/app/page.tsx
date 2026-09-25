"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { BalanceHero } from "@/features/dashboard/balance-hero";
import { CashflowChart } from "@/features/dashboard/cashflow-chart";
import { CategoryList } from "@/features/dashboard/category-list";
import { RangeTabs } from "@/features/dashboard/range-tabs";
import { RecentActivity } from "@/features/dashboard/recent-activity";
import { SummaryTiles } from "@/features/dashboard/summary-tiles";
import { fetchSummary } from "@/features/dashboard/summary";
import type { Range } from "@/lib/finance";

export default function DashboardPage() {
  // The only state on this screen; chart, tiles and categories all read it.
  const [range, setRange] = useState<Range>("month");

  const { data, isError } = useQuery({
    queryKey: ["summary", range],
    queryFn: () => fetchSummary(range),
  });

  if (isError) {
    return (
      <p className="text-sm text-expense">
        The summary could not be loaded. Reload the page to try again.
      </p>
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
        <CategoryList data={data} />
        <RecentActivity />
      </div>
    </div>
  );
}
