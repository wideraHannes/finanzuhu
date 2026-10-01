# Step 05 — Add client mutation helpers

## Goal

Centralize browser requests and readable failure extraction before connecting the page UI.

## Depends on

[`04-mutation-api.md`](04-mutation-api.md)

## Files

- Modify `src/features/transactions/transactions.ts`.

## Changes

1. Keep `fetchTransactions()` and existing read types intact.
2. Define a client-safe transaction-input request type, separate from server-only module imports if necessary.
3. Add request helpers aligned to the selected endpoints:
   - `createTransaction(input)`;
   - `removeTransaction(id)`;
   - `resetTransactions()`.
4. On a non-success response, extract `{ error }` when available and throw it; otherwise throw a safe fallback error message.
5. Return parsed authoritative server data on success.

## Checks

- No file-system or server-only code leaks into the client bundle.
- Helpers do not make optimistic cache changes.

## Done when

- The transactions page can invoke every mutation without constructing fetch requests itself.
