"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Range } from "@/lib/finance";

const RANGES: { value: Range; label: string }[] = [
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "3m", label: "3 Months" },
];

export function RangeTabs({
  range,
  onRangeChange,
}: {
  range: Range;
  onRangeChange: (range: Range) => void;
}) {
  return (
    <Tabs value={range} onValueChange={(value) => onRangeChange(value as Range)}>
      <TabsList aria-label="Time range" className="w-full sm:w-auto">
        {RANGES.map(({ value, label }) => (
          <TabsTrigger key={value} value={value} className="sm:px-4">
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
