"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatEUR } from "@/lib/format";
import type { SpendingBucket } from "@/lib/finance";
import type { SpendingSummary } from "@/features/spending/spending";

const axisNumber = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 });
const month = new Intl.DateTimeFormat("de-DE", {
  month: "short",
  year: "numeric",
});
const barColors = [
  "var(--color-expense)",
  "var(--color-owl)",
  "var(--color-income)",
  "var(--color-warning)",
  "var(--color-chart-5)",
];

function formatLabel(label: string, summary: SpendingSummary): string {
  return summary === "month"
    ? month.format(new Date(`${label}-01T00:00:00`))
    : label;
}

function ChartTooltip({
  active,
  payload,
  label,
  summary,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  summary: SpendingSummary;
}) {
  if (!active || !payload?.length || !label) return null;

  return (
    <div className="rounded-md bg-popover px-3 py-2 text-xs shadow-md ring-1 ring-foreground/10">
      <p className="font-medium text-popover-foreground">
        {formatLabel(label, summary)}
      </p>
      <p className="mt-1 text-muted-foreground">
        {formatEUR(payload[0].value)}
      </p>
    </div>
  );
}

export function SpendingChart({
  data,
  summary,
  from,
  to,
}: {
  data?: SpendingBucket[];
  summary: SpendingSummary;
  from?: string;
  to?: string;
}) {
  const title =
    summary === "category" ? "Spending by category" : "Spending by month";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-96">
          {!data ? (
            <Skeleton className="size-full" />
          ) : data.length === 0 ? (
            <div className="flex size-full items-center justify-center text-center text-sm text-muted-foreground">
              No spending was recorded from {from} to {to}.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 4, right: 12, bottom: 105, left: -12 }}
              >
                <CartesianGrid
                  vertical={false}
                  stroke="var(--color-border)"
                  strokeDasharray="3 3"
                />
                <XAxis
                  dataKey="label"
                  tickFormatter={(label) => formatLabel(label, summary)}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  tick={{
                    fill: "var(--color-muted-foreground)",
                    fontSize: 11,
                  }}
                />
                <YAxis
                  tickFormatter={(value) => axisNumber.format(value)}
                  tickLine={false}
                  axisLine={false}
                  width={52}
                  tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                />
                <Tooltip
                  content={<ChartTooltip summary={summary} />}
                  cursor={{ fill: "var(--color-muted)", opacity: 0.4 }}
                />
                <Bar
                  dataKey="total"
                  name="Spending"
                  radius={[2, 2, 0, 0]}
                  maxBarSize={36}
                  isAnimationActive={false}
                >
                  {data.map((bucket, index) => (
                    <Cell
                      key={bucket.label}
                      fill={
                        summary === "month"
                          ? "var(--color-expense)"
                          : barColors[index % barColors.length]
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
