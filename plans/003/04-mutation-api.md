# Step 04 — Add mutation API routes

## Goal

Expose the completed ledger operations through explicit HTTP endpoints while preserving the existing filtered `GET /api/transactions` contract.

## Depends on

[`02-ledger-create.md`](02-ledger-create.md) and [`03-ledger-remove-reset.md`](03-ledger-remove-reset.md)

## Files

- Modify `src/app/api/transactions/route.ts`.
- Add a dynamic transaction route such as `src/app/api/transactions/[id]/route.ts`.
- Add `src/app/api/transactions/reset/route.ts`.

## Changes

1. Add `POST /api/transactions`:
   - safely parse JSON;
   - pass only transaction input to the ledger service;
   - return the created transaction on success.
2. Add `DELETE /api/transactions/:id` with the route parameter as the ID.
3. Add `POST /api/transactions/reset` with no request body.
4. Use consistent JSON responses:
   - `400` with `{ error: string }` for malformed JSON or validation errors;
   - `404` with `{ error: string }` for an unknown ID;
   - `500` with a generic readable `{ error: string }` for unexpected filesystem/backup failures, while logging the real error server-side.
5. Return authoritative results; do not imply a write succeeded if the ledger operation threw.

## Checks

- Existing `GET` filtering and response shape remain unchanged.
- Exercise valid and invalid API paths manually or with request-level tests if a suitable harness is present.

## Done when

- URL shape is documented in the implementation.
- All error responses are readable and never expose implementation details.
