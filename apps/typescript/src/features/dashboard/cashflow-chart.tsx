"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatEUR } from "@/lib/format";
import type { DashboardSummary } from "@/features/dashboard/summary";

/** "2026-09-25" -> "25.09." — short enough for a tick, unambiguous enough to read. */
function tickDate(iso: string): string {
  const [, month, day] = iso.split("-");
  return `${day}.${month}.`;
}

const axisNumber = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 });

function tickEUR(value: number): string {
  return axisNumber.format(value);
}

type TooltipPayload = { name: string; value: number; color: string }[];

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayload;
  label?: string;
}) {
  if (!active || !payload?.length || !label) return null;

  return (
    <div className="rounded-md bg-popover px-3 py-2 text-xs shadow-md ring-1 ring-foreground/10">
      <p className="mb-1 font-medium text-popover-foreground">{formatDate(label)}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">{entry.name}</span>
          <span className="tabular" style={{ color: entry.color }}>
            {formatEUR(entry.value)}
          </span>
        </p>
      ))}
    </div>
  );
}

export function CashflowChart({ data }: { data?: DashboardSummary }) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Cashflow</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          {!data ? (
            <Skeleton className="size-full" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={data.series}
                margin={{ top: 4, right: 0, bottom: 0, left: -12 }}
              >
                <CartesianGrid
                  vertical={false}
                  stroke="var(--color-border)"
                  strokeDasharray="3 3"
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={tickDate}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={24}
                  tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                />
                {/* Two scales on purpose: the balance is an order of magnitude
                    larger than a single day's bookings and would flatten the
                    bars into a line at the bottom of a shared axis. */}
                <YAxis
                  yAxisId="flow"
                  tickFormatter={tickEUR}
                  tickLine={false}
                  axisLine={false}
                  width={52}
                  tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                />
                <YAxis
                  yAxisId="balance"
                  orientation="right"
                  domain={[
                    (min: number) => Math.floor((min - 100) / 500) * 500,
                    (max: number) => Math.ceil((max + 100) / 500) * 500,
                  ]}
                  tickFormatter={tickEUR}
                  tickLine={false}
                  axisLine={false}
                  width={52}
                  tick={{ fill: "var(--color-owl)", fontSize: 11 }}
                />
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{ fill: "var(--color-muted)", opacity: 0.4 }}
                />
                <Bar
                  yAxisId="flow"
                  dataKey="income"
                  name="In"
                  fill="var(--color-income)"
                  radius={[2, 2, 0, 0]}
                  maxBarSize={18}
                  isAnimationActive={false}
                />
                <Bar
                  yAxisId="flow"
                  dataKey="expenses"
                  name="Out"
                  fill="var(--color-expense)"
                  radius={[2, 2, 0, 0]}
                  maxBarSize={18}
                  isAnimationActive={false}
                />
                <Line
                  yAxisId="balance"
                  dataKey="balance"
                  name="Balance"
                  stroke="var(--color-owl)"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
