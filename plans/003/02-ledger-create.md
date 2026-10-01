# Step 02 — Implement transaction creation

## Goal

Add a validated domain operation that creates and persists one transaction atomically.

## Depends on

[`01-ledger-foundation.md`](01-ledger-foundation.md)

## Files

- Modify `src/lib/transactions.ts`.
- Extend `tests/unit/transactions.test.ts`.

## Changes

1. Add `createTransaction(input): Transaction` (or equivalent naming consistent with local code).
2. Validate before any write:
   - required non-empty string values for date, description, counterparty, category, and method;
   - a real `YYYY-MM-DD` calendar day;
   - a finite amount that can be safely serialized;
   - type strictly equal to `income` or `expense`;
   - the decision from Step 00 for amount/type consistency;
   - CSV-safe text values according to the existing `split(",")` format: reject commas and line breaks at minimum.
3. Create a server-generated unique, persistable ID; verify it does not collide with existing IDs.
4. Construct the full next ledger, serialize all nine existing CSV columns, and atomically replace the active ledger through a temporary sibling file plus rename where practical.
5. Refresh the in-process cache only after replacement succeeds, then return the authoritative created transaction.

## Tests first

- Valid complete input produces a unique ID, writes a row, and is visible on a fresh read.
- Missing fields, malformed/non-calendar dates, non-finite amounts, invalid types, and CSV-unsafe text fail without modifying the ledger.
- A simulated write failure preserves both the temporary active file and cached result.

## Done when

- Creation is entirely server-side and directly unit-tested.
- No UI or API has changed yet.
