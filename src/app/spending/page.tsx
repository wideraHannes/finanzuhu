"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SpendingChart } from "@/features/spending/spending-chart";
import {
  fetchSpendingOverview,
  type SpendingSummary,
} from "@/features/spending/spending";

export default function SpendingPage() {
  const [summary, setSummary] = useState<SpendingSummary>("category");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const requestedRangeIsInvalid = Boolean(from && to && from > to);

  const { data, isError, refetch } = useQuery({
    queryKey: ["spending", from, to],
    queryFn: () => fetchSpendingOverview(from || undefined, to || undefined),
    enabled: !requestedRangeIsInvalid,
  });

  const selectedFrom = from || data?.from || "";
  const selectedTo = to || data?.to || "";
  const rangeIsInvalid = requestedRangeIsInvalid;
  const chartData = summary === "category" ? data?.categories : data?.months;

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Historical spending
        </h1>
        <p className="text-sm text-muted-foreground">
          Compare your expenses by category or month.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <Tabs
          value={summary}
          onValueChange={(value) => setSummary(value as SpendingSummary)}
        >
          <TabsList aria-label="Spending summary">
            <TabsTrigger value="category">Categories</TabsTrigger>
            <TabsTrigger value="month">Months</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-2 gap-2 sm:w-80">
          <label className="grid gap-1 text-sm font-medium">
            Start
            <Input
              type="date"
              value={selectedFrom}
              max={selectedTo || undefined}
              onChange={(event) => setFrom(event.target.value)}
            />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            End
            <Input
              type="date"
              value={selectedTo}
              min={selectedFrom || undefined}
              onChange={(event) => setTo(event.target.value)}
            />
          </label>
        </div>
      </div>

      {rangeIsInvalid && (
        <p className="text-sm text-destructive">
          The start date must not be after the end date.
        </p>
      )}
      {isError ? (
        <div className="space-y-3 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            Historical spending could not be loaded.
          </p>
          <Button variant="outline" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      ) : data ? (
        <SpendingChart
          data={chartData}
          summary={summary}
          from={selectedFrom}
          to={selectedTo}
        />
      ) : null}
    </div>
  );
}
