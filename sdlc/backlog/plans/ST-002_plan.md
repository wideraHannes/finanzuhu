# ST-002 — Implementation plan: Multi language

**Story:** [`refined/ST-002.md`](../refined/ST-002.md)
**Standards:** [`architecture.md`](../../standards/architecture.md) ·
[`definition_of_done.md`](../../standards/definition_of_done.md)

## Current state

| Place | What is there today |
| --- | --- |
| `src/app/layout.tsx` | Root layout, `<html lang="en">` hard-coded, metadata literal |
| `src/app/page.tsx`, `src/app/transactions/page.tsx` | The two routes, both at the root |
| `src/lib/format.ts` | Three `Intl` formatters, all pinned to `"de-DE"` at module scope |
| `src/components/layout/*` | Header, sidebar (`NAV` labels), theme toggle, brand |
| `src/features/**` | ~8 components, roughly 750 lines, every label a literal |
| `src/lib/transactions.ts` | Parses `data/transactions.csv` positionally via `split(",")` |
| `src/app/api/transactions/route.ts` | Filters on `description`/`counterparty`, returns the category list |
| `data/transactions.csv` | 9 columns, English texts |

No i18n infrastructure exists. `next-intl` is not in `package.json`.

## Sequencing — read this first

The story keeps AC 11 (translated booking texts) in scope against the
refinement's recommendation. That criterion is a **data-model change**: a new
column or file, a change to the `Transaction` type in `src/lib/finance.ts`, to
the CSV parser, and to the transactions API's search. It shares no code with the
UI-string work.

The plan therefore delivers in two phases against one story. **Phase A is
shippable on its own**; if the iteration runs out, Phase B is what gets cut.

- **Phase A** — infrastructure, routing, UI strings, formats, category names
  (AC 1–10, 12–14)
- **Phase B** — booking texts (AC 11)

---

## Phase A

### A1. Dependency and config

- `npm i next-intl`
- `src/i18n/routing.ts` — `defineRouting({ locales: ["de", "en"], defaultLocale: "de", localePrefix: "always" })` (AC 1, 2)
- `src/i18n/request.ts` — loads `messages/${locale}.json`, calls `notFound()` for an unknown locale (AC 5)
- `src/middleware.ts` — the `next-intl` middleware; its matcher must exclude
  `/api`, `/_next` and the static icons, otherwise `GET /api/summary` gets
  redirected to `/de/api/summary` (**the single most likely bug in this story**)
- `next.config.ts` — wrap with the `next-intl` plugin

Locale resolution (AC 3) is the middleware's default behaviour — URL, then the
`NEXT_LOCALE` cookie, then `Accept-Language`, then the default. A cookie rather
than `localStorage`, because the middleware resolves before any client code runs
(closes the refined story's open question).

### A2. Route move

```
src/app/layout.tsx                 → src/app/[locale]/layout.tsx
src/app/page.tsx                   → src/app/[locale]/page.tsx
src/app/transactions/page.tsx      → src/app/[locale]/transactions/page.tsx
src/app/globals.css, providers.tsx, api/, icons  stay put
```

A thin root `src/app/layout.tsx` remains for `<html>`; the locale layout awaits
`params`, calls `setRequestLocale`, and sets `<html lang={locale}>` (AC 2).
`generateStaticParams` over the two locales keeps the pages static.

`src/app/api/**` deliberately stays **outside** `[locale]`: the API serves data,
not text. All translation happens in the view layer — this is what keeps AC 13
(identical totals in both locales) true by construction.

### A3. Messages

`messages/de.json` and `messages/en.json`, namespaced by feature:

```
nav.overview · nav.transactions
dashboard.balance · dashboard.freeToSpend · dashboard.range.week|month|3m
dashboard.categories.title · dashboard.categories.empty
transactions.title · transactions.filter.* · transactions.table.* · transactions.empty
common.error.summary · common.error.transactions · common.retry
categories.<Category Key>          ← AC 10
```

`de` is the source of truth. Roughly 40–50 keys across the ~750 lines listed
above.

### A4. String sweep

Every file under `src/features/**` and `src/components/layout/**` plus both
pages: literal → `useTranslations("<ns>")` in client components,
`getTranslations` in server components. `src/components/ui/**` is shadcn
primitives and carries no copy — leave untouched.

`sidebar.tsx` needs care: its `NAV` hrefs become locale-aware `Link`s from
`next-intl/navigation`, and `pathname === href` no longer matches once the path
carries `/de` — the active state breaks silently otherwise.

### A5. Formatters — `src/lib/format.ts`

The three module-scope formatters are replaced by locale-taking functions:

```ts
export function formatEUR(amount: number, locale: string): string;
export function formatSignedEUR(amount: number, locale: string): string;
export function formatDate(iso: string, locale: string): string;
export function formatShortDate(iso: string, locale: string): string;
```

Currency stays `EUR` in both locales (story: "the euro stays the currency").
Keep a module-level `Map<string, Intl.NumberFormat>` cache — constructing `Intl`
formatters per render is measurably slow in a table of 100+ rows.

The functions stay pure and dependency-free (AC 9), so they remain testable in
`tests/unit/`. Callers get the locale from `useLocale()`.

### A6. Category names (AC 10, 12)

The raw category string from the CSV stays the key everywhere — in
`byCategory`, in the API's category list, in the transactions filter value, and
in ST-001's `budgets.json`. Only the rendered label is translated, through a
single helper:

```ts
// src/features/categories.ts
export function categoryLabel(t: Translator, key: string): string
```

returning `t.has(`categories.${key}`) ? t(...) : `[${key}]`` — the visible
fallback of AC 12.

**Why a helper and not inline `t()`:** the category label is rendered in at
least four places (dashboard list, transactions table, filter select, ST-001's
budget rows). One helper is one place to fix the fallback.

The filter `<select>` in `src/app/transactions/page.tsx` shows translated labels
with untranslated `value`s — the API contract is unchanged (AC 13).

### A7. Metadata

`generateMetadata` per locale instead of the static `metadata` export; title
template and description move into the message files.

---

## Phase B — booking texts (AC 11)

**Shape to decide (OQ-1).** Two options:

| | Extra CSV columns | Per-booking message keys |
| --- | --- | --- |
| Data | `description_de`, `counterparty_de` next to the existing pair | `tx.tx_0001.description` in `messages/*.json` |
| Parser | Two more positional fields in `transactions.ts` | unchanged |
| Type | `Transaction` gains locale-keyed texts | unchanged |
| API search | Must search the active locale's text → the route needs the locale | unchanged if search stays on the raw text |
| Translator's view | Text sits next to the data | Texts live with all other copy |

The plan assumes **extra CSV columns**: it keeps the booking text with the
booking, and `data/transactions.csv` is the file a workshop participant edits.

Then:
- `data/transactions.csv` — header and 100+ rows gain two columns
- `src/lib/finance.ts` — `Transaction.description` / `.counterparty` become
  `Record<"de"|"en", string>`, **or** the row keeps flat fields and a new
  `texts` sub-object is added. The flat-field rename touches `freeToSpend`,
  which builds its contract key from `counterparty` — that key must stay
  locale-independent or standing orders start double-counting (**R-1**)
- `src/lib/transactions.ts` — two more destructured fields
- `src/app/api/transactions/route.ts` — `q` search across the active locale;
  the route gains a `locale` param
- `src/features/transactions/transaction-table.tsx`,
  `src/features/dashboard/recent-activity.tsx` — pick the locale's text

**`counterparty` is the open problem (OQ-2):** "Hamburger Sparkasse",
"HVV Hamburg" and "Zahnarztpraxis Dr. Krüger" are proper nouns with no English
form. Translating them produces either identical columns or invented company
names. Recommendation: translate `description` only, leave `counterparty` as is.

---

## Test cases per acceptance criterion

| AC | Test | Where |
| --- | --- | --- |
| 1, 7 | `de.json` and `en.json` have an identical, recursively flattened key set | `tests/unit/messages.test.ts` |
| 7 | Neither file has an empty-string value | same |
| 8, 9 | `formatEUR(1234.56, "de")` → `1.234,56 €`; `"en"` → `€1,234.56`; currency `EUR` in both | `tests/unit/format.test.ts` (new) |
| 8, 9 | `formatDate("2026-09-25", …)` per locale; `formatShortDate` likewise | same |
| 9 | Negative and zero amounts, `formatSignedEUR` sign handling per locale | same |
| 10 | Every distinct category in `data/transactions.csv` has a `categories.*` key in both files | `tests/unit/messages.test.ts` |
| 12 | `categoryLabel` with an unknown key → `[Unknown]`, never empty | `tests/unit/categories.test.ts` |
| 13 | `byCategory` over a fixed ledger returns identical output regardless of locale — locale never reaches `src/lib/finance.ts` | `tests/unit/finance.test.ts` |
| 11 (B) | Parser reads the locale texts; the search matches the active locale | `tests/unit/transactions.test.ts` |
| 2, 3, 4, 5, 6 | Routing, switch, persistence, 404, no leftover literals | **not automatable here** — see R-2 |

AC 6 is best enforced by lint, not by a test: an ESLint rule against string
literals in JSX (`react/jsx-no-literals`, scoped to `src/features` and
`src/components/layout`) catches regressions that a reviewer would miss. That is
a proposal, not a story requirement.

Per the DoD, every test is to be **seen failing** first.

## Risks and assumptions

- **R-1 — `freeToSpend` keys on `counterparty`.** It builds
  `${counterparty}|${category}` to deduplicate standing orders. If either part
  becomes locale-dependent in Phase B, the same contract counts twice and the
  headline "free to spend" figure silently goes wrong. The key must be pinned to
  a locale-independent field before Phase B touches the type.
- **R-2 — no component or E2E setup.** `vitest.config.mts` runs
  `tests/unit/**/*.test.ts` only: no jsdom, no Playwright. Five acceptance
  criteria are therefore manual. Adding a browser-test stack is its own story.
- **R-3 — the middleware matcher.** A matcher that catches `/api` breaks every
  fetch in the app with a redirect. Verify `GET /api/summary?range=month` first
  thing after A1.
- **R-4 — blast radius.** Phase A touches essentially every file under `src/`,
  which collides with anything else in flight — ST-001 above all. Land ST-001
  first, as both stories state.
- **R-5 — the story is large.** Phase A alone is a full iteration for this
  codebase. Phase B adds a data migration on top. The refinement flagged this;
  the plan structures around it rather than resolving it.
- **A-1 — assumption:** the locale lives in a cookie, not `localStorage`
  (middleware needs it server-side).
- **A-2 — assumption:** `data/` filenames, the API shapes and the category keys
  stay English. Only rendered text is translated.

## Open questions before implementation

- **OQ-1** — Phase B shape: extra CSV columns, or per-booking message keys?
- **OQ-2** — Is `counterparty` translated at all? Recommendation: no.
- **OQ-3** — Is Phase B in this iteration, or does it become ST-003?
- **OQ-4** — Language switch: next to the theme toggle in the header, as
  assumed?
- **OQ-5** — English copy: who writes it, and is `de` really the source of truth
  given the existing UI and data are English?
