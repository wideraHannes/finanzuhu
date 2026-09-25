"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatShortDate, formatSignedEUR } from "@/lib/format";
import type { Transaction } from "@/lib/finance";

/** Only date and amount sort — the other three columns have no useful order. */
type SortColumn = "date" | "amount";
type Sort = { column: SortColumn; descending: boolean };

/** On a phone only date, description and amount fit. */
const NARROW = "hidden md:table-cell";

/** "direct_debit" -> "Direct debit" */
function labelMethod(method: string): string {
  const words = method.replace(/_/g, " ");
  return words[0].toUpperCase() + words.slice(1);
}

function SortButton({
  column,
  label,
  sort,
  onSortChange,
}: {
  column: SortColumn;
  label: string;
  sort: Sort;
  onSortChange: (sort: Sort) => void;
}) {
  const active = sort.column === column;
  const Icon = !active ? ChevronsUpDown : sort.descending ? ArrowDown : ArrowUp;

  return (
    <button
      type="button"
      onClick={() =>
        onSortChange({ column, descending: active ? !sort.descending : true })
      }
      className={cn(
        "inline-flex items-center gap-1 rounded-sm outline-offset-4 hover:text-foreground",
        active ? "text-foreground" : "text-muted-foreground",
      )}
    >
      {label}
      <Icon className="size-3.5" aria-hidden />
    </button>
  );
}

function ariaSort(column: SortColumn, sort: Sort) {
  if (sort.column !== column) return undefined;
  return sort.descending ? "descending" : "ascending";
}

export function TransactionTable({
  transactions,
  empty,
}: {
  transactions?: Transaction[];
  empty: React.ReactNode;
}) {
  const [sort, setSort] = useState<Sort>({ column: "date", descending: true });

  const rows = useMemo(() => {
    if (!transactions) return undefined;
    const direction = sort.descending ? -1 : 1;
    return [...transactions].sort((a, b) =>
      sort.column === "amount"
        ? (a.amount - b.amount) * direction
        : a.date.localeCompare(b.date) * direction,
    );
  }, [transactions, sort]);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead aria-sort={ariaSort("date", sort)}>
            <SortButton
              column="date"
              label="Date"
              sort={sort}
              onSortChange={setSort}
            />
          </TableHead>
          <TableHead>Description</TableHead>
          <TableHead className={NARROW}>Category</TableHead>
          <TableHead className={NARROW}>Method</TableHead>
          <TableHead className="text-right" aria-sort={ariaSort("amount", sort)}>
            <SortButton
              column="amount"
              label="Amount"
              sort={sort}
              onSortChange={setSort}
            />
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {!rows ? (
          Array.from({ length: 10 }, (_, i) => (
            <TableRow key={i}>
              <TableCell colSpan={5}>
                <Skeleton className="h-8 w-full" />
              </TableCell>
            </TableRow>
          ))
        ) : rows.length === 0 ? (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={5} className="py-10 text-center">
              {empty}
            </TableCell>
          </TableRow>
        ) : (
          rows.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="tabular text-muted-foreground">
                {formatShortDate(transaction.date)}
              </TableCell>
              <TableCell className="max-w-[9rem] sm:max-w-[18rem]">
                <p className="truncate">{transaction.description}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {transaction.counterparty}
                </p>
              </TableCell>
              <TableCell className={NARROW}>
                <Badge variant="secondary">{transaction.category}</Badge>
              </TableCell>
              <TableCell className={cn(NARROW, "text-muted-foreground")}>
                {labelMethod(transaction.method)}
              </TableCell>
              <TableCell
                className={cn(
                  "tabular text-right font-medium",
                  transaction.amount >= 0 ? "text-income" : "text-expense",
                )}
              >
                {formatSignedEUR(transaction.amount)}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
