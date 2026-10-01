# ST-004 — Implementation plan: Historical spending overview

**Story:** [`refined/ST-004.md`](../refined/ST-004.md)  
**Standards:** [`architecture.md`](../../standards/architecture.md) ·
[`definition_of_done.md`](../../standards/definition_of_done.md)

## Approach

Add a separate `/spending` screen, exposed through the existing sidebar. It
keeps the historical overview separate from the dashboard and therefore leaves
the existing dashboard cashflow graph and its `/api/summary` contract intact.

The screen owns the selected summary (`"category"` or `"month"`) and its
inclusive `from`/`to` ISO-day range. TanStack Query requests a dedicated API
endpoint whenever any of those values changes. The endpoint loads the fixed
ledger, calls a pure aggregation function in `src/lib/finance.ts`, and returns
the prepared chart data. The chart receives props only.

```
data/transactions.csv
        │
        ▼
getTransactions() ──▶ spendingOverview(transactions, from, to)
                              │
                              ▼
                    GET /api/spending?from=&to=
                              │
                              ▼
             fetchSpendingOverview() ──▶ /spending page ──▶ chart
```

### Planning assumptions requiring confirmation

The refined story leaves essential product choices open. This plan uses the
following narrow assumptions so implementation can be estimated; confirm them
before code is written.

| Decision                   | Plan assumption                                                                                                                                                                                                  |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Placement of the new tab   | A new sidebar destination, `/spending`, labelled **Spending**. The app has no page-level tab convention, and a route most clearly keeps the graph separate from the dashboard.                                   |
| Initially selected summary | **Categories**.                                                                                                                                                                                                  |
| Initial date range         | The whole available ledger: earliest transaction date through `referenceDate()`. This makes the default deterministic and fits a historical overview.                                                            |
| Spending definition        | Every booking with `amount < 0`, matching the existing `byCategory`, `budgetStatus`, and cashflow behaviour. This currently includes negative savings transfers; positive reimbursements do not offset spending. |
| No-data behaviour          | Return empty category/month arrays; the UI displays a clear empty state instead of an empty Recharts canvas. Months without negative bookings are not synthesized.                                               |
| Visualisation              | A single responsive bar chart for either selection. It is the smallest reuse of the established Recharts pattern and does not add a chart library.                                                               |
| Date control               | Two labelled native `type="date"` inputs, Start and End. No date-picker dependency exists; together they form the required date-range control.                                                                   |

If product decisions differ—particularly on transfers, zero-filled months, or a
calendar-style date-range picker—the API contract, domain output, and tests
must change accordingly.

## Changes per file

### 1. `src/lib/finance.ts` — extend with pure spending aggregation

Add types that form the API/UI contract:

```ts
export type SpendingBucket = {
  label: string; // category name or YYYY-MM
  total: number; // positive expense magnitude
};

export type SpendingOverview = {
  categories: SpendingBucket[];
  months: SpendingBucket[];
};

export function spendingOverview(
  transactions: Transaction[],
  from: string,
  to: string,
): SpendingOverview;
```

- Filter to `amount < 0` and inclusive ISO boundaries (`from <= date <= to`).
  Convert each signed amount to its positive magnitude before aggregation.
- Group the filtered bookings by `category` for `categories` and by existing
  `monthKey(date)` for `months`.
- Sort category data by descending total, with `label.localeCompare` as the
  deterministic tie-breaker. Sort monthly data chronologically by its ISO
  `YYYY-MM` key.
- Return empty arrays when there is no spending in range. Do not read files,
  the system clock, or Next.js APIs.

**Why:** filtering and money calculations remain reusable, deterministic domain
logic and can receive direct Vitest coverage. An explicit range is necessary;
the dashboard's `Range` presets and `byCategory()` do not model user-selected
start/end days.

### 2. `src/app/api/spending/route.ts` — new dedicated API route

Implement `GET /api/spending?from=YYYY-MM-DD&to=YYYY-MM-DD`.

- Load the ledger with `getTransactions()` and use `referenceDate()` only for
  defaults. Derive the default `from` from the first ledger transaction and the
  default `to` from `referenceDate()` when the corresponding query parameter is
  omitted.
- Validate supplied dates strictly as calendar ISO days—not merely a string
  matching `YYYY-MM-DD`—and reject an invalid date or `from > to` with
  `400 { error: "…" }`. This avoids silently making an incorrect financial
  comparison.
- Call `spendingOverview(transactions, from, to)` and return:

```ts
{ from, to, categories: SpendingBucket[], months: SpendingBucket[] }
```

- No summary-mode parameter is required: both small aggregates use the same
  validated range, allowing an instant Categories/Months switch without a
  second network request. Do not extend `/api/summary`; its contract remains
  dashboard-specific.

**Why:** API routes are the server boundary for committed data, while financial
math stays in `src/lib`.

### 3. `src/features/spending/spending.ts` — new client contract and fetcher

Define:

```ts
export type SpendingSummary = "category" | "month";
export type SpendingOverviewResponse = {
  from: string;
  to: string;
  categories: SpendingBucket[];
  months: SpendingBucket[];
};
export function fetchSpendingOverview(
  from: string,
  to: string,
): Promise<SpendingOverviewResponse>;
```

- Build the URL with `URLSearchParams` and throw a user-safe error message for
  a non-OK response, following `features/dashboard/summary.ts` and
  `features/transactions/transactions.ts`.
- Keep request/response types and browser fetching out of the page component.

### 4. `src/features/spending/spending-chart.tsx` — new presentational chart

Create a responsive Recharts `BarChart` in the existing `Card` layout.

- Accept `summary` and the selected `SpendingBucket[]` as props; it does not
  fetch or own selection state.
- Render categories or months based solely on the supplied data. Use one
  expense-coloured bar series with positive totals, `formatEUR` in the tooltip,
  and the existing chart colour tokens so light/dark themes remain consistent.
- Format `YYYY-MM` labels locally or through a small reusable formatter in
  `src/lib/format.ts` if the same German month label is needed in ticks and the
  tooltip. Keep the raw key as chart data to preserve chronological order.
- Render the shared `Skeleton` while data is absent. Render a textual empty
  state when the selected data is an empty array, including the selected date
  range, rather than mounting a blank chart.

**Why:** it follows the current `CashflowChart` conventions while remaining a
new component, so `cashflow-chart.tsx` is not altered (AC 9).

### 5. `src/app/spending/page.tsx` — new client page

Build the historical overview screen.

- State: `summary`, `from`, and `to`. On first render, fetch without date
  parameters so the route supplies the deterministic full-ledger defaults;
  populate both controlled date inputs from the response. Alternatively, expose
  a small metadata/defaults endpoint only if a controlled-first-render is
  preferred—do not duplicate date discovery in the browser.
- Provide exactly two controlled Radix `Tabs` triggers, **Categories** and
  **Months**, using a `SpendingSummary` union. Switching tabs selects the
  already-fetched `categories` or `months` array and does not navigate or
  refetch.
- Provide labelled Start and End native date inputs using shared `Input`.
  Use each selected value as the other input's `min`/`max` where possible,
  prevent a request for an incomplete/reversed client-side range, and display
  a concise inline validation message. The server remains authoritative for
  malformed crafted URLs.
- Query `fetchSpendingOverview(from, to)` via TanStack Query. Include the two
  dates in the query key; show a retry action on request failure, matching the
  transactions page pattern.
- The page title and short description identify it as the historical spending
  view. Pass the selected aggregate to `SpendingChart`.

**Why:** this keeps interaction state at the route-level feature boundary and
uses the repository's existing TanStack Query pattern.

### 6. `src/components/layout/sidebar.tsx` — add navigation entry

Add a `ChartNoAxesCombined` (or equivalent existing Lucide chart icon) entry
to `NAV`:

```ts
{ href: "/spending", label: "Spending", icon: ChartNoAxesCombined }
```

Place it alongside Overview and Transactions. The existing pathname logic
automatically marks it active.

**Why:** it is the established primary navigation and provides the requested
separate app tab without changing the dashboard.

### 7. `README.md` — update the screen description

Update the Finanzuhu screen list from three to four pages, naming the new
`/spending` historical overview and its category/month, date-range behaviour.

**Why:** the current README would otherwise be inaccurate after a user-visible
screen is added.

### 8. `tests/unit/spending-overview.test.ts` — new unit tests

Test `spendingOverview()` directly with full `Transaction` fixtures, following
the local factory style in `tests/unit/finance.test.ts` and
`tests/unit/assistant-tools.test.ts`. Keep API, Recharts, and component testing
out of scope: the project has no jsdom/browser test setup and the architecture
calls for unit tests on pure domain logic.

## Test cases mapped to acceptance criteria

Each new unit test must be written and **seen failing** before implementing the
corresponding domain behaviour.

| AC  | Automated coverage                                                                                                                                                    | Manual verification                                                                                                     |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 1   | —                                                                                                                                                                     | Sidebar **Spending** opens `/spending`; dashboard still opens at `/`.                                                   |
| 2   | `spendingOverview()` returns non-empty category and month aggregates for representative ledger fixtures.                                                              | Default page renders a bar chart using loaded data.                                                                     |
| 3   | —                                                                                                                                                                     | Only **Categories** and **Months** appear in the summary tabs.                                                          |
| 4   | Mixed category fixtures aggregate repeated negative bookings as positive totals; income is excluded; equal totals use deterministic label ordering.                   | Categories tab labels/bars match the API response.                                                                      |
| 5   | Bookings across several calendar months group under the correct `YYYY-MM` keys and are chronologically ordered.                                                       | Months tab shows the expected month labels and totals.                                                                  |
| 6   | —                                                                                                                                                                     | Start and End native date inputs are labelled, editable, and initialize from the API defaults.                          |
| 7   | Fixtures immediately before, on, and after both range endpoints prove inclusive bounds; a partial-month range proves only in-range bookings contribute.               | Change either date and confirm the displayed totals update; reversed dates show validation without a misleading chart.  |
| 8   | Both output arrays are returned for one range request.                                                                                                                | Switch tabs repeatedly: the chart changes in place without navigation or an extra request.                              |
| 9   | —                                                                                                                                                                     | Compare `/` before and after: its cashflow graph remains present and unchanged; `/spending` shows the additional graph. |
| —   | No negative booking in range returns `{ categories: [], months: [] }`; decimal expenses are summed as positive magnitudes with the project’s expected cent precision. | Empty-range state and API-error retry state are readable.                                                               |

Run `npm test`, `npm run lint`, and a production build after implementation.

## Risks and follow-up decisions

- **Transfers and refunds:** `amount < 0` is consistent with existing code but
  may not match the intended financial definition of spending. The data has
  negative savings transfers and no explicit refund classification. A different
  rule needs a refined acceptance criterion, not an ad hoc UI exclusion.
- **Default date range:** full ledger range must be confirmed. If a shorter
  rolling period is desired, define it relative to the fixed `referenceDate()`
  and update the initial API behaviour and manual checks.
- **Date picker wording:** two native controls are deliberately dependency-free
  and accessible. A single calendar popover is a visual/product expansion that
  would introduce a date-picker dependency and its interaction/testing work.
- **No-data month buckets:** omitting zero months makes the current data model
  simple. If comparisons need continuous monthly bars, `spendingOverview()`
  must synthesize month keys between `from` and `to`, including partial
  endpoints, and the tests must be expanded.
- **Long category labels:** the bar chart needs an implementation decision on
  axis rotation/truncation and tooltip visibility once rendered against the
  actual categories; retain complete labels in the tooltip.

## Open questions before implementation

1. Confirm the sidebar `/spending` destination rather than dashboard-local
   tabs.
2. Confirm the **Categories** default and full-ledger default date range.
3. Confirm that all negative bookings, including savings transfers, are
   spending; define any transfer/refund exclusions otherwise.
4. Confirm empty states and whether zero-spending calendar months must be shown.
5. Confirm that a bar chart and two native date controls meet the desired UI;
   otherwise provide chart/date-picker requirements.
