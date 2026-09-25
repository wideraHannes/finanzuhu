# Slice 3 — Domain & API

**Goal.** The CSV becomes numbers the UI can ask for. This is where the two
example tests go.

## Files

```
src/lib/transactions.ts   read + parse data/transactions.csv (server only, cached in a module variable)
src/lib/finance.ts        the money math — pure functions, no imports from next/*
src/app/api/summary/route.ts
src/app/api/transactions/route.ts
tests/unit/finance.test.ts
```

## The math (`finance.ts`)

Four plain functions, each taking an array and returning plain objects:

```ts
rangeStart(range)                 // 'week' | 'month' | '3m' -> Date
summarize(transactions, range)    // { income, expenses, net }
balance(transactions, opening)    // opening + sum of all amounts
byCategory(transactions, range)   // [{ category, total, share }] sorted desc
dailySeries(transactions, range)  // [{ date, income, expenses, balance }]
```

Amounts stay plain euro numbers; rounding happens once, in `formatEUR`.

## The API

| Endpoint | Params | Returns |
|---|---|---|
| `GET /api/summary` | `range=week\|month\|3m` | `{ balance, income, expenses, net, series, categories }` |
| `GET /api/transactions` | `q, category, type` (all optional) | `{ items }` |

Each handler is ~10 lines: read params, call `finance.ts`, `Response.json(...)`.
No pagination, no validation library — unknown params are ignored.

## The two tests

`tests/unit/finance.test.ts` — Vitest, run with `npm test`:

1. **`balance` adds opening balance and all bookings**
   — three hand-written rows, one expected number.
2. **`summarize` splits income and expenses for a range**
   — rows inside and outside the range, asserts the one outside is not counted.

They are written with literal little arrays in the test file, not fixtures.
That is the whole test suite; more tests are a workshop decision.

## Verification

```bash
npm test
curl 'http://localhost:3000/api/summary?range=3m' | jq
```

**Done when:** both tests pass and the API numbers match what
`node scripts/check-data.mjs` printed in slice 1.

## Not in this slice
No React, no TanStack Query.
