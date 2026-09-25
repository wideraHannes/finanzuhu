# Slice 5 — Transactions (F2)

**Goal.** The full ledger, searchable and filterable.

## Files

```
src/app/transactions/page.tsx
src/features/transactions/transaction-table.tsx
src/features/transactions/columns.tsx
```

## Behaviour

- `useQuery({ queryKey: ['transactions', filters], ... })` against
  `/api/transactions`.
- TanStack Table with five columns: date · description (+ counterparty as a
  muted second line) · category (badge) · method · amount (right-aligned,
  teal/coral, tabular figures).
- Controls above the table: search input (debounced 200 ms), category select,
  and an All / Income / Expenses toggle.
- Sorting on date and amount, client-side. Default: newest first.
- All rows rendered — 130 rows need no virtualisation and no pagination.
- Empty state when filters match nothing: one line, one “clear filters” button.

## Verification

Open `/transactions`, search `REWE`, filter to Income, sort by amount.

**Done when:** filters combine correctly, the row count line
(“47 of 132 bookings”) is right, and the table is readable on a phone
(amount and date stay visible, description truncates).

## Not in this slice
No row detail modal, no editing, no export — good first workshop stories.
