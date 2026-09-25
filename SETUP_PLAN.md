# Finanzuhu — Technical Setup Plan (Dummy Project)

> **Scope of this document.** It describes the **pre-workshop setup**: the
> running dummy application that the workshop starts from. It is *not* an SDLC
> artifact — no story, no refinement, no DoR/DoD. The SDLC flow
> (`sdlc/backlog/…`) begins in the workshop **on top of** this codebase.

| | now (setup) | workshop |
|---|---|---|
| Who | one-off preparation | the participants |
| Process | none, straight build | full SDLC loop per story |
| Output | running app + dummy data | new features via `unrefined → refined → plan → implementation → review → docs` |
| Artifacts | code, CSV, this file | markdown per phase in `sdlc/`, docs in `docs/` |

---

## 1. Product

**Finanzuhu** — a personal finance overview (the *uhu* is an eagle owl; the
friendly Finanzguru relative). Single fictional household, one checking account,
three months of history.

**Entry point is one question: “How much money do we have?”** Everything on the
first screen answers it or qualifies it.

### Features built now

**F1 — Balance & Cashflow (the dashboard, `/`)**
- Hero: current balance, large and unambiguous.
- Secondary line: “free to spend” = balance minus known fixed costs still due this month.
- Three range tabs — **last week · last month · last 3 months** — driving one chart
  (income vs. expenses over time, cumulative balance line) plus in/out/net tiles.
- Category breakdown of the selected range (top categories, bar list with share).

**F2 — Transactions (`/transactions`)**
- Full ledger: sorting by date and amount, full-text search, category filter,
  income/expense toggle.
- Every row shows merchant, method, category and the signed amount.

Deliberately **not** built now — these are the workshop’s playground:
budgets per category, recurring-contract detection, forecast to end of month,
savings goals, CSV import via upload, multi-account, tagging/rules engine.

### Design direction
Professional, quiet, data-first. No marketing subtitles, no emoji,
no “Welcome back 👋”. Dark-first palette (ink/slate) with a warm amber owl
accent; income teal, expenses coral. Numbers are the loudest element on the
page — tabular figures, `de-DE` grouping, EUR. UI language: **English**.
Light and dark theme both ship.

---

## 2. Tech stack

| Concern | Choice | Why |
|---|---|---|
| Framework | **Next.js 15**, App Router, TypeScript strict | as requested |
| Styling | **Tailwind CSS v4** | tokens in CSS, no config sprawl |
| Components | **shadcn/ui** (Radix under the hood) | owned code in `src/components/ui`, fully restylable |
| Server state | **TanStack Query v5** | as requested; cache/loading/error handled once |
| Table | none — the shadcn `<table>` primitives | filtering is server-side, sorting is one `.sort()`; a table library would add a concept and break React Compiler memoisation |
| Charts | **Recharts** | good React fit, easy to theme |
| CSV parsing | none — 15 lines of `split` | the file is ours; a parser dependency would explain nothing |
| Tests | **Vitest** | two example tests on the money math, no suite |
| Lint/format | ESLint (next config) | one tool, zero configuration of our own |

Node 24, npm. Deployment is out of scope — `npm run dev` is the target.

**Deliberately absent:** validation library, date library, state manager, ORM,
API client generator, test pyramid. This is a demo codebase — someone who does
not write TypeScript daily has to feel at home in it.

---

## 3. Repository layout

The Next.js app lives at the **repo root**, alongside the untouched SDLC folders.

```
finanzuhu/
├── data/
│   └── transactions.csv        # the dummy ledger (source of truth)
├── src/
│   ├── app/
│   │   ├── layout.tsx          # fonts, theme, QueryProvider, shell
│   │   ├── page.tsx            # F1 dashboard
│   │   ├── transactions/page.tsx
│   │   └── api/
│   │       ├── transactions/route.ts
│   │       └── summary/route.ts
│   ├── components/
│   │   ├── ui/                 # shadcn primitives
│   │   └── layout/             # sidebar, header, theme toggle
│   ├── features/
│   │   ├── dashboard/          # BalanceHero, CashflowChart, RangeTabs, CategoryBreakdown
│   │   └── transactions/       # TransactionTable, fetch + filter types
│   └── lib/
│       ├── transactions.ts     # read + parse data/transactions.csv (cached)
│       ├── finance.ts          # pure aggregation: balance, summarize, byCategory, series
│       └── format.ts           # currency/date formatting (de-DE, EUR)
├── plan/                       # this plan, cut into buildable slices
├── tests/unit/                 # two example vitest specs
├── sdlc/  docs/  prerequisites/  assets/     # untouched
└── SETUP_PLAN.md
```

`sdlc/`, `docs/`, `tests/README.md` keep their meaning; app tests go into
`tests/unit/` so the existing `tests/` contract still holds.

---

## 4. Data model & dummy data

`data/transactions.csv`, one row per booking, newest last:

```csv
id,date,amount,description,counterparty,category,type,method,recurring
tx_0001,2026-07-01,-1180.00,Rent July,Hausverwaltung Meyer,Rent,expense,direct_debit,true
tx_0002,2026-07-28,3000.00,Salary July,Nordlicht Logistik GmbH,Salary,income,transfer,true
```

- `amount` signed: income positive, expenses negative. One column, no ambiguity.
- `type` is redundant to the sign on purpose — convenient for filters.
- Everything is EUR, so there is no currency column. No commas inside fields, so
  reading the file stays a `split(',')`.
- A sibling `data/account.json` carries `openingBalance` and `openingDate`, so
  the balance is *derived*, never hardcoded.

**Simulation: 2026-07-01 → 2026-09-25** (~3 months, ending today).

- Net salary **3.000,00 €** on the 28th of each month.
- Fixed costs (`recurring=true`): rent 1.180, electricity 78, internet 44,50,
  mobile 29,99, liability + household insurance 21,40, health top-up 32,
  public transport pass 58, gym 34,90, Netflix 13,99, Spotify 11,99,
  iCloud 2,99, savings standing order 300.
- Variable spending, plausibly clustered (groceries Fri/Sat, restaurants Fri/Sun,
  bars Sat, fuel every ~2 weeks, pharmacy/health sporadic):
  `Groceries · Restaurants & Cafés · Bars & Nightlife · Fuel · Mobility ·
   Shopping & Clothing · Household · Health & Pharmacy · Leisure & Culture ·
   Travel · Gifts & Donations · Education · Bank Fees · Cash Withdrawal`
- Income beyond salary: one tax refund, one freelance invoice, one
  friend-pays-back refund — so the income side is not a single bar.
- Realistic counterparties (REWE, ALDI SÜD, Rossmann, DB Vertrieb, Shell,
  Trattoria da Vinci, …) — merchants are what makes a demo feel real.
- Monthly net result lands slightly positive (~+150 to +350 €), with **one
  month deliberately negative** so the UI has to show a red month.
- ~120–150 rows total. Generated by a throwaway script, then **committed as a
  static CSV** — deterministic for every participant.

---

## 5. Architecture & data flow

```
data/transactions.csv
        │  read once per process, cached (node:fs, server-only)
        ▼
src/lib/transactions.ts ──► Transaction[]
        ▼
src/lib/finance.ts  (pure, no I/O — the two tests live here)
   balance(tx, opening) · summarize(tx, range) · byCategory(tx, range) · dailySeries(tx, range)
        ▼
Route handlers  GET /api/transactions · GET /api/summary
        ▼
TanStack Query (client)  ──►  feature components
```

**API contract**

| Endpoint | Query params | Returns |
|---|---|---|
| `GET /api/summary` | `range=week\|month\|3m` | `{ balance, income, expenses, net, freeToSpend, series[], categories[] }` |
| `GET /api/transactions` | `q, category, type` (all optional) | `{ items[] }` |

Both handlers are ~10 lines: read params → call `finance.ts` → `Response.json`.
Money travels as plain euro numbers and is rounded once, in `formatEUR`.

Query keys: `['summary', range]`, `['transactions', filters]`.
`staleTime: Infinity` — the data is static; this keeps range switching instant.

**Why the API layer at all** (it would work without): it gives the workshop a
real seam. “Replace CSV with a database”, “add pagination”, “add a POST to
create a transaction” become backend-only stories.

---

## 6. UI composition

```
┌ Sidebar ─┬ Header (account switcher stub · theme toggle) ────────────┐
│ Overview │  ┌───────────────────────────────────────────────────┐   │
│ Trans-   │  │  BALANCE            4.812,37 €                    │   │
│ actions  │  │  free to spend      1.204,10 €   ·  as of 25 Sep  │   │
│          │  └───────────────────────────────────────────────────┘   │
│          │  [ Week ] [ Month ] [ 3 Months ]                         │
│          │  ┌── Cashflow ───────────┐ ┌── In / Out / Net tiles ──┐  │
│          │  │  bars + balance line  │ │  ▲ 3.240  ▼ 2.918  +322  │  │
│          │  └───────────────────────┘ └──────────────────────────┘  │
│          │  ┌── Top categories ─────┐ ┌── Recent activity ───────┐  │
│          │  │  Rent      1.180  41% │ │  last 8 bookings         │  │
│          │  └───────────────────────┘ └──────────────────────────┘  │
└──────────┴──────────────────────────────────────────────────────────┘
```

Chart granularity follows the range: week → daily, month → daily,
3 months → weekly buckets. Skeleton states for every async block, empty states
written out, error boundary per feature card.

---

## 7. Build order

Cut into slices in [`plan/`](plan/README.md) — each one ends in a state you can
open and look at, and each builds on the previous:

1. [Dummy data](plan/01-dummy-data.md) — CSV + generator, verified by a check script
2. [Scaffold & shell](plan/02-scaffold-shell.md) — Next.js, tokens, sidebar, theme
3. [Domain & API](plan/03-domain-api.md) — parsing, money math, both endpoints, **the two example tests**
4. [Dashboard](plan/04-dashboard.md) — F1
5. [Transactions](plan/05-transactions.md) — F2
6. [Polish & handover](plan/06-polish.md) — states, responsive, README

Data first on purpose: every screen after it is built against real numbers
instead of placeholders that have to be torn out again.

Done when: `npm run dev` serves both screens from the committed CSV, `npm test`
is green, and the design holds up in light and dark.

## 8. Workshop handover

After the setup the repository offers, per story:
- a **UI seam** (new card, new page),
- an **API seam** (new endpoint or params),
- a **domain seam** (new pure function in `finance.ts`, testable in isolation).

`sdlc/standards/architecture.md` and `code_style.md` stay **empty of this plan
on purpose** — the workshop derives them from the running code, as `CONCEPT.md`
prescribes.
