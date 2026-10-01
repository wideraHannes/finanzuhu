# Step 03 — Implement removal and reset

## Goal

Add tested server-side operations for deleting one transaction and restoring the immutable default ledger.

## Depends on

[`01-ledger-foundation.md`](01-ledger-foundation.md)

## Files

- Modify `src/lib/transactions.ts`.
- Extend `tests/unit/transactions.test.ts`.

## Changes

1. Add `removeTransaction(id): Transaction[]` (or locally consistent equivalent).
   - Locate the exact ID before writing.
   - If absent, throw the known not-found domain error with no write and no cache change.
   - Otherwise serialize and atomically replace the active ledger, then replace cache and return the authoritative list.
2. Add `resetTransactions(): Transaction[]`.
   - Read and fully parse/validate `transactions.default.csv` before touching the active ledger.
   - Replace the active ledger with the complete validated backup atomically.
   - Replace cache only after success and return the restored list.
3. Preserve underlying read/write errors so the API layer can distinguish expected domain errors from generic persistence failures.

## Tests first

- Removing a known ID persists removal and is absent from a fresh read.
- Removing an unknown ID fails without changing active contents or cache.
- After create/removal activity, reset restores the active file exactly to backup contents.
- Failure to write during removal/reset leaves active contents and cache unchanged.

## Done when

- Every CSV mutation is atomic where the platform permits.
- Reset always uses the committed backup, never an in-memory snapshot.
