"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatDate, formatSignedEUR } from "@/lib/format";
import { fetchTransactions } from "@/features/dashboard/summary";

const RECENT = 8;

export function RecentActivity() {
  const { data } = useQuery({
    queryKey: ["transactions", {}],
    queryFn: fetchTransactions,
  });

  // The ledger is sorted ascending, so the newest bookings are at the end.
  const recent = data ? data.slice(-RECENT).reverse() : undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
        <CardAction>
          <Link
            href="/transactions"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            View all
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-border">
          {!recent
            ? Array.from({ length: RECENT }, (_, i) => (
                <li key={i} className="py-2.5">
                  <Skeleton className="h-8 w-full" />
                </li>
              ))
            : recent.map((transaction) => (
                <li
                  key={transaction.id}
                  className="flex items-center justify-between gap-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm">{transaction.description}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {transaction.counterparty} · {formatDate(transaction.date)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "tabular shrink-0 text-sm font-medium",
                      transaction.amount >= 0 ? "text-income" : "text-expense",
                    )}
                  >
                    {formatSignedEUR(transaction.amount)}
                  </span>
                </li>
              ))}
        </ul>
      </CardContent>
    </Card>
  );
}
