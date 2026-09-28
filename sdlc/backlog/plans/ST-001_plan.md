# ST-001 — Implementation plan: Budget planner for categories

**Story:** [`refined/ST-001.md`](../refined/ST-001.md)
**Standards:** [`architecture.md`](../../standards/architecture.md) ·
[`definition_of_done.md`](../../standards/definition_of_done.md)

## Current state

| Place | What is there today |
| --- | --- |
| `data/account.json` | Reference data as JSON, imported statically by `src/lib/account.ts` |
| `src/lib/finance.ts` | Pure money math. `byCategory(transactions, range, reference)` returns `{ category, total, share }[]`, expenses only, sorted descending |
| `src/app/api/summary/route.ts` | Assembles the dashboard payload; reads `getTransactions()` and `referenceDate()` |
| `src/features/dashboard/summary.ts` | `DashboardSummary` — the contract between route and cards |
| `src/features/dashboard/category-list.tsx` | Server-safe presentational component, top 6 categories, share bar `bg-expense` |
| `src/app/page.tsx` | Holds the only state, `range`, and passes `data` down |
| `tests/unit/finance.test.ts` | Vitest against `src/lib/finance.ts` with a local `tx()` factory |

The data flow to preserve: `data/` → `src/lib/` (pure) → API route → feature
type → UI. `category-list.tsx` receives props only and stays free of fetching.

## Design decision

The budget comparison is computed **in the API route, not in the component**.
`byCategory` already returns the month's expenses when the range is `month`, but
its range is a rolling 30-day window (`rangeStart` subtracts a month from the
reference date), while AC 3 demands the **calendar month**. The two differ, so
the budget figures need their own pure function rather than a reuse of
`byCategory`'s output.

Consequence: the dashboard shows a rolling-window share list and a
calendar-month budget list side by side in the same card. That is the reason the
budget bars are bound to the "month" tab only (see open question OQ-1).

## Changes per file

### 1. `data/budgets.json` — new

```json
{ "Groceries": 450, "Restaurants & Cafés": 150, "Mobility": 80, "Shopping & Clothing": 120, "Leisure & Culture": 100, "Subscriptions": 60 }
```

A flat object, category name → positive monthly euro amount. Categories are the
raw strings from `data/transactions.csv`. Concrete keys and amounts: OQ-2.
**Why:** mirrors `account.json` as committed reference data; no writing path.

### 2. `src/lib/budgets.ts` — new

```ts
import data from "../../data/budgets.json";
export type Budgets = Record<string, number>;
export const budgets: Budgets = data;
```

**Why:** exact counterpart to `src/lib/account.ts`. Static import, so a missing
or malformed file fails the build rather than a request (AC 9 addresses the
*empty* file, not a corrupt one — see risk R-2).

### 3. `src/lib/finance.ts` — extend

Add, without touching existing exports:

```ts
export type CategoryBudget = {
  category: string;
  budget: number;   // positive euros
  actual: number;   // positive magnitude of the month's expenses
  ratio: number;    // actual / budget; 0 when budget is 0
};

export function monthKey(iso: string): string;            // "2026-09-25" -> "2026-09"
export function budgetStatus(
  transactions: Transaction[],
  budgets: Record<string, number>,
  reference: string,
): CategoryBudget[];
```

`budgetStatus` filters `t.amount < 0 && monthKey(t.date) === monthKey(reference)`
(AC 3), sums per category, and emits **one entry per budget key** — including
keys with no bookings, which get `actual: 0` (AC 4). Categories that have
bookings but no budget are deliberately **not** in the result; the component
keeps rendering them from `data.categories` (AC 5). `ratio` is `0` when
`budget <= 0` (AC 9), so the UI never divides by zero.

Sort order: descending by `ratio`, so the category closest to overspending is
first. Ties break on `category` so the output is deterministic for tests.

**Why here:** AC 2 and AC 13 of the architecture rule — financial calculations
are pure functions in `src/lib/`, no I/O, no `next/*`.

### 4. `src/app/api/summary/route.ts` — extend

Add one field to the response:

```ts
budgets: budgetStatus(transactions, budgets, reference),
```

Computed unconditionally, independent of `range` — the value is always the
calendar month of `asOf`. **Why:** the component must not fetch; the route is
the single assembly point.

**Validation / error handling:** none added. The route takes no new input; the
`range` param is already sanitised against the `RANGES` allow-list. `budgets` is
build-time data, not user input, so there is nothing to validate at runtime.

### 5. `src/features/dashboard/summary.ts` — extend

```ts
import type { CategoryBudget } from "@/lib/finance";
// in DashboardSummary:
budgets: CategoryBudget[];
```

**Why:** the type is the contract; a field added to the route without the type
is invisible to the component.

### 6. `src/features/dashboard/category-list.tsx` — change

Signature gains one prop so the card can stay dumb:

```tsx
export function CategoryList({ data, showBudgets }: { data?: DashboardSummary; showBudgets?: boolean })
```

Per rendered category, look up `data.budgets.find(b => b.category === …)`. With
a hit **and** `showBudgets`:

- replace the share bar's width with `Math.min(ratio, 1) * 100` (AC 8) and its
  colour with the state token below;
- render `formatEUR(actual)` `/` `formatEUR(budget)` plus the rounded percentage
  instead of the plain share percentage;
- on `ratio > 1`, add a visible textual marker (`over budget`, or a
  `lucide-react` `TriangleAlert` with an accessible label) next to the amount —
  AC 7's colour-independence requirement.

Without a hit, or with `showBudgets` false, the existing share rendering is used
unchanged (AC 5, AC 9, OQ-1).

State thresholds (AC 7), as a small local helper so the test can reach it if it
moves to `finance.ts` later:

| Ratio | State | Class |
| --- | --- | --- |
| `< 0.8` | within | `bg-income` |
| `0.8 – 1.0` | close | `bg-chart-3` (or a new token, see R-3) |
| `> 1.0` | over | `bg-expense` + marker |

**Why `bg-income` for "within":** the file already uses the semantic
`--income`/`--expense` tokens from `globals.css`, which are defined for both
light and dark mode. A raw Tailwind colour would break dark mode.

The card title changes from "Top categories" to something that covers both
readings — wording is OQ-4.

### 7. `src/app/page.tsx` — change

Pass `showBudgets={range === "month"}` to `<CategoryList />`. One line; the
component stays presentational.

### 8. `tests/unit/budgets.test.ts` — new

Separate file rather than growing `finance.test.ts`, which is documented as the
example file the workshop reads. Reuse the `tx()` factory shape from there but
allow the category to be passed.

## Test cases per acceptance criterion

| AC | Test | Expectation |
| --- | --- | --- |
| 2 | `budgetStatus` with one budget and two bookings | `{ category, budget, actual, ratio }` with `actual` = sum of the two |
| 3 | Bookings on the 1st and the last day of the month, plus one on the last day of the previous month and one in the next | only the two inside count |
| 3 | An **income** booking in a budgeted category | ignored, `actual` unchanged |
| 4 | Budget for `Travel`, no `Travel` bookings | entry present with `actual: 0`, `ratio: 0` |
| 5 | Booking in `Fuel`, no `Fuel` budget | no `Fuel` entry in the result |
| 8 | `actual` 600 against `budget` 400 | `ratio: 1.5` — the function does **not** cap; the UI does |
| 9 | Budget of `0` | `ratio: 0`, no `Infinity`, no `NaN` |
| 9 | Empty budget object | returns `[]` |
| — | Two categories with different ratios | sorted descending by `ratio` |
| 1 | `data/budgets.json` parses and every key exists in `data/transactions.csv` | guards typos in the seed file |

AC 6 and 7 are rendering; there is no component test setup in this repository
(`vitest.config.mts` includes `tests/unit/**/*.test.ts` only, no jsdom, no
Testing Library). **Proposal: verify AC 6–7 manually** against the running app
rather than introducing a component-test stack inside this story — that decision
belongs in `code_style.md`, which does not exist yet. See R-1.

Per the DoD, each test is to be **seen failing** before the implementation is
written.

## Risks and assumptions

- **R-1 — no component test setup.** AC 6, 7 and 8 (the cap) are only covered by
  eye. Either accept manual verification, or add jsdom + Testing Library, which
  is infrastructure work beyond this story.
- **R-2 — a corrupt `budgets.json` is a build error, not a fallback.** AC 9 says
  a *missing* file must not break the dashboard; with a static import, a missing
  file breaks the build instead. Reading it through `readFileSync` in a
  `server-only` module (like `transactions.ts`) would make a runtime fallback
  possible but costs the static-import simplicity. **Assumption: the build error
  is the wanted behaviour** — the file is committed reference data. Confirm.
- **R-3 — the "close" colour.** There is no amber token in `globals.css`;
  `--chart-3` exists but is not semantic. Introducing `--warning` in both the
  light and dark block is the cleaner move and is assumed here.
- **R-4 — two different month definitions in one card.** The share percentages
  come from a rolling 30-day window, the budget figures from the calendar month.
  Their numbers will not add up if a reader compares them. OQ-1 is the mitigation.
- **R-5 — ST-002 touches the same component.** `category-list.tsx` is on both
  stories' path. Order ST-001 → ST-002 as agreed in the story.

## Open questions before implementation

- **OQ-1** — Budget bars on the "month" tab only, or on every tab with a fixed
  calendar-month reference? The plan assumes "month" only.
- **OQ-2** — Which categories and amounts go into the seed file?
- **OQ-3** — Does 80 % stand as the "close" threshold?
- **OQ-4** — New card title, given it now carries two readings.
- **OQ-5** — Does the top-6 cap stay? A budgeted category can fall outside the
  top 6 by spend and would then be invisible despite being over budget. The plan
  keeps `TOP = 6` unchanged; sorting budgeted categories first would be the
  alternative.
