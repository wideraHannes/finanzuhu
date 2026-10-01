# Step 06 — Connect the transaction page UI

## Goal

Deliver the visible add, remove, and confirmed-reset user workflows with TanStack Query refreshes after successful persistence.

## Depends on

[`05-client-mutation-layer.md`](05-client-mutation-layer.md)

## Files

- Add `src/features/transactions/transaction-form.tsx`.
- Modify `src/features/transactions/transaction-table.tsx`.
- Modify `src/app/transactions/page.tsx`.

## Changes

### Add form

1. Render labelled controls for date, signed amount, description, counterparty, category, type, payment method, and recurring status.
2. Use existing `Input`, `Select`, and `Button` components where suitable.
3. Apply the Step 00 category/payment-method choice.
4. Add basic client checks for required values, real date format, numeric amount, allowed type, and CSV-safe text.
5. Show readable field/form errors. Server validation remains authoritative.

### Table removal action

1. Extend table props with `onRemove(transaction)` and pending/disabled information.
2. Add an accessible remove action to every visible row; call it immediately without confirmation or undo.
3. Add an action heading and update loading/empty-state column spans.
4. Disable the affected row action during its mutation to prevent duplicate submissions.

### Page mutations

1. Keep the current read query and add `useMutation` handlers for create, remove, and reset.
2. On each successful mutation, invalidate the `transactions` query. Let the authoritative API reload drive the list and category filter.
3. Clear form state only after a successful create; preserve it on errors.
4. Show readable errors next to the action that failed.
5. Add a clearly labelled reset action. Use a native confirmation or project-consistent dialog that explicitly states additions and removals will be lost. Only call reset after confirmation.
6. Only invalidate/refetch after reset confirmation and server success. Implement optional success feedback only if Step 00 chose it.

## Manual checks

- Add a valid entry and observe it without full reload; reload/restart and verify persistence.
- Remove an entry and verify immediate disappearance and persistent removal.
- Cancel reset and confirm no request/list change; confirm reset and verify default contents return.
- Submit invalid values and simulate a failed write; verify errors and unchanged UI data.
- Visit dashboard, budgets, spending, API, and assistant after each mutation to check fresh reads.

## Done when

- The page meets acceptance criteria 1–9 in the browser.
- No optimistic state claims a write completed before the API confirms it.
