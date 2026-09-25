# Slice 4 — Dashboard (F1)

**Goal.** The entry point answers “How much money do we have?”

## Files

```
src/app/providers.tsx                    QueryClientProvider
src/app/page.tsx                         composes the cards
src/features/dashboard/balance-hero.tsx
src/features/dashboard/range-tabs.tsx
src/features/dashboard/cashflow-chart.tsx
src/features/dashboard/summary-tiles.tsx
src/features/dashboard/category-list.tsx
src/features/dashboard/recent-activity.tsx
```

## Behaviour

- One piece of state on the page: `range` (`week | month | 3m`), lifted into
  `page.tsx` and passed down. No context, no store.
- One query for the whole screen:
  `useQuery({ queryKey: ['summary', range], queryFn: ... })`,
  `staleTime: Infinity` — the data never changes, so switching ranges is instant
  after the first fetch.
- **Balance hero**: current balance, large; below it “free to spend” = balance
  minus fixed costs still due this month, plus “as of 25 Sep 2026”.
- **Range tabs** drive chart, tiles and category list together.
- **Cashflow chart** (Recharts): income/expense bars + balance line.
  Daily buckets for week and month, weekly for 3m.
- **Summary tiles**: in / out / net, net coloured teal or coral.
- **Category list**: top 6 categories with amount, share and a thin bar.
- **Recent activity**: last 8 bookings, linking to `/transactions`.

Every card gets a `<Skeleton>` while loading. No custom loading abstraction —
`if (isLoading) return <Skeleton .../>` in each component.

## Verification

Open `/`, click through all three ranges.

**Done when:** the balance matches `check-data.mjs`, August shows a negative
net, and no layout jumps when switching ranges.

## Not in this slice
No transactions table, no filters.
