"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TransactionInput } from "@/features/transactions/transactions";

const EMPTY: TransactionInput = {
  date: "",
  amount: 0,
  description: "",
  counterparty: "",
  category: "",
  type: "expense",
  method: "",
  recurring: false,
};

function isCalendarDate(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`);
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(date.valueOf()) &&
    date.toISOString().slice(0, 10) === value
  );
}

export function TransactionForm({
  onCreate,
  isPending,
  error,
}: {
  onCreate: (input: TransactionInput) => Promise<unknown>;
  isPending: boolean;
  error?: string;
}) {
  const [input, setInput] = useState(EMPTY);
  const [formError, setFormError] = useState("");
  const update = <K extends keyof TransactionInput>(
    key: K,
    value: TransactionInput[K],
  ) => setInput((current) => ({ ...current, [key]: value }));

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const texts = [
      input.description,
      input.counterparty,
      input.category,
      input.method,
    ];
    if (
      !isCalendarDate(input.date) ||
      !Number.isFinite(input.amount) ||
      texts.some((value) => !value.trim() || /[,\r\n]/.test(value))
    ) {
      setFormError(
        "Complete every field with a real date, finite amount, and text without commas or line breaks.",
      );
      return;
    }
    setFormError("");
    try {
      await onCreate(input);
      setInput(EMPTY);
    } catch {
      // The mutation's error state is displayed by the page.
    }
  }

  return (
    <form
      onSubmit={submit}
      className="grid gap-3 rounded-lg border p-4 md:grid-cols-4"
    >
      <h2 className="md:col-span-4 text-base font-medium">Add transaction</h2>
      <label className="grid gap-1 text-sm">
        Date
        <Input
          type="date"
          value={input.date}
          onChange={(event) => update("date", event.target.value)}
          required
        />
      </label>
      <label className="grid gap-1 text-sm">
        Signed amount
        <Input
          type="number"
          step="0.01"
          value={input.amount || ""}
          onChange={(event) => update("amount", Number(event.target.value))}
          required
        />
      </label>
      <label className="grid gap-1 text-sm">
        Description
        <Input
          value={input.description}
          onChange={(event) => update("description", event.target.value)}
          required
        />
      </label>
      <label className="grid gap-1 text-sm">
        Counterparty
        <Input
          value={input.counterparty}
          onChange={(event) => update("counterparty", event.target.value)}
          required
        />
      </label>
      <label className="grid gap-1 text-sm">
        Category
        <Input
          value={input.category}
          onChange={(event) => update("category", event.target.value)}
          required
        />
      </label>
      <label className="grid gap-1 text-sm">
        Payment method
        <Input
          value={input.method}
          onChange={(event) => update("method", event.target.value)}
          required
        />
      </label>
      <label className="grid gap-1 text-sm">
        Type
        <Select
          value={input.type}
          onValueChange={(value) =>
            update("type", value as TransactionInput["type"])
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="expense">Expense</SelectItem>
            <SelectItem value="income">Income</SelectItem>
          </SelectContent>
        </Select>
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={input.recurring}
          onChange={(event) => update("recurring", event.target.checked)}
        />
        Recurring
      </label>
      {(formError || error) && (
        <p className="md:col-span-4 text-sm text-destructive" role="alert">
          {formError || error}
        </p>
      )}
      <div className="md:col-span-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Adding…" : "Add transaction"}
        </Button>
      </div>
    </form>
  );
}
