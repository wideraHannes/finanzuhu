# Step 01 — Establish the ledger foundation

## Goal

Create a safe, testable server-side foundation for CSV-backed mutation without changing the transaction page.

## Files

- Add `data/transactions.default.csv`.
- Modify `src/lib/transactions.ts`.
- Add `tests/unit/transactions.test.ts`.

## Changes

1. Copy the current committed `data/transactions.csv` to `data/transactions.default.csv` exactly, including the header and column order.
2. In `src/lib/transactions.ts`, extract/reuse CSV parsing and serialization so reads, writes, and reset use one representation.
3. Introduce a testable storage boundary: inject ledger/default paths or expose a factory that binds the file operations and isolated cache.
4. Define domain errors that distinguish invalid inputs from an unknown transaction ID. Allow unexpected filesystem failures to propagate to routes.
5. Define a server-side `TransactionInput` contract containing all fields other than `id`.
6. Make post-write reads cache-aware: replace cache only after the active ledger has been fully and successfully replaced.
7. Resolve ordering/reference-date behavior: persist deterministically by date with a stable tie-breaker, or change `referenceDate()` to find the maximum date.

## Tests first

- A temporary ledger and backup can be read without touching `data/transactions.csv`.
- A ledger containing a date later than the final seed row still yields the correct reference date after the chosen strategy.

## Done when

- The default ledger is committed and never selected as a write target.
- Tests use temporary file paths and isolated cache state.
- Existing read behavior and current unit tests still pass.
