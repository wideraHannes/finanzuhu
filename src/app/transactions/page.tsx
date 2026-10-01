"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionTable } from "@/features/transactions/transaction-table";
import { TransactionForm } from "@/features/transactions/transaction-form";
import {
  createTransaction,
  fetchTransactions,
  NO_FILTERS,
  removeTransaction,
  resetTransactions,
  type TransactionFilters,
} from "@/features/transactions/transactions";
import type { Transaction } from "@/lib/finance";

const ALL = "all"; // Radix needs a non-empty value; "" is our "no filter".

const TYPES: { value: TransactionFilters["type"]; label: string }[] = [
  { value: "", label: "All" },
  { value: "income", label: "Income" },
  { value: "expense", label: "Expenses" },
];

export default function TransactionsPage() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<TransactionFilters>(NO_FILTERS);
  const queryClient = useQueryClient();

  // The input stays instant; the query follows 200 ms later.
  useEffect(() => {
    const timer = setTimeout(
      () => setFilters((current) => ({ ...current, q: search })),
      200,
    );
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isError, refetch } = useQuery({
    queryKey: ["transactions", filters],
    queryFn: () => fetchTransactions(filters),
  });

  const filtered = Boolean(filters.q || filters.category || filters.type);

  function refreshLedger() {
    return Promise.all(
      ["transactions", "summary", "spending"].map((key) =>
        queryClient.invalidateQueries({ queryKey: [key] }),
      ),
    );
  }
  const createMutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: refreshLedger,
  });
  const removeMutation = useMutation({
    mutationFn: removeTransaction,
    onSuccess: refreshLedger,
  });
  const resetMutation = useMutation({
    mutationFn: resetTransactions,
    onSuccess: refreshLedger,
  });

  function remove(transaction: Transaction) {
    removeMutation.mutate(transaction.id);
  }
  function reset() {
    if (
      window.confirm(
        "Restore the default transactions? All additions and removals will be lost.",
      )
    )
      resetMutation.mutate();
  }

  function clearFilters() {
    setSearch("");
    setFilters(NO_FILTERS);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
        <p className="text-sm text-muted-foreground">
          {!data
            ? "Loading the ledger…"
            : filtered
              ? `${data.items.length} of ${data.total} bookings`
              : `${data.total} bookings`}
        </p>
      </div>

      <TransactionForm
        onCreate={(input) => createMutation.mutateAsync(input)}
        isPending={createMutation.isPending}
        error={createMutation.error?.message}
      />

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Restore the original demo ledger at any time.
        </p>
        <div className="text-right">
          <Button
            variant="outline"
            onClick={reset}
            disabled={resetMutation.isPending}
          >
            {resetMutation.isPending ? "Resetting…" : "Reset transactions"}
          </Button>
          {resetMutation.error && (
            <p className="mt-1 text-sm text-destructive" role="alert">
              {resetMutation.error.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search description or counterparty"
            aria-label="Search bookings"
            className="pl-9"
          />
        </div>

        <Select
          value={filters.category || ALL}
          onValueChange={(value) =>
            setFilters((current) => ({
              ...current,
              category: value === ALL ? "" : value,
            }))
          }
        >
          <SelectTrigger aria-label="Category" className="sm:w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All categories</SelectItem>
            {data?.categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Tabs
          value={filters.type || ALL}
          onValueChange={(value) =>
            setFilters((current) => ({
              ...current,
              type: (value === ALL ? "" : value) as TransactionFilters["type"],
            }))
          }
        >
          <TabsList aria-label="Direction">
            {TYPES.map(({ value, label }) => (
              <TabsTrigger key={label} value={value || ALL}>
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <Card>
        {/* Full bleed on a phone: the five columns need every pixel. */}
        <CardContent className="px-2 md:px-(--card-spacing)">
          {isError ? (
            <div className="space-y-3 py-10 text-center">
              <p className="text-sm text-muted-foreground">
                The bookings could not be loaded.
              </p>
              <Button variant="outline" onClick={() => refetch()}>
                Try again
              </Button>
            </div>
          ) : (
            <TransactionTable
              transactions={data?.items}
              onRemove={remove}
              removingId={
                removeMutation.isPending ? removeMutation.variables : undefined
              }
              empty={
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    No booking matches these filters.
                  </p>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear filters
                  </Button>
                </div>
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
