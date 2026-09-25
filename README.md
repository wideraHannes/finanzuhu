<div align="center">

<img src="public/finanzuhu-logo.png" alt="Finanzuhu" width="420">

# Finanzuhu — an SDLC with AI, end to end

**The workshop project for walking through the complete Software Development
Lifecycle with AI support** — from the raw backlog entry to the updated
documentation, on a codebase that actually runs.

<img src="assets/SDLC_loop.png" alt="The DevOps loop with the AI touchpoints per phase" width="620">

</div>

---

## What this is about

AI does not only help with writing code, but at every station of the loop.
This repository covers the section from **Plan to Release** and makes it
walkable: each step produces a Markdown file that the next one reads as input.

```
unrefined  →  refined  →  plan  →  implementation  →  review  →  docs
              ↑ DoR                      ↑ tests       ↑ DoD       ↺
```

These files steer the AI and make its work repeatable, reviewable and
shareable across the team. A ticket travels visibly through the folders
instead of disappearing into a tool.

**Finanzuhu** — the *uhu* is an eagle owl — is the app the process works on.
It is not a toy stub: it runs, it has data, it has tests, and every story in
the workshop changes it for real.

## Run the app

It needs nothing but Node:

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # the two example tests on the money math
```

Two screens. **Overview** (`/`) answers *how much money do we have*: balance,
free-to-spend, a cashflow chart over week / month / three months, in-out-net
tiles, the top categories and the last eight bookings. **Transactions**
(`/transactions`) is the full ledger — searchable, filterable by category and
direction, sortable by date and amount.

All numbers come from [`data/transactions.csv`](data/transactions.csv), 131
committed bookings for a fictional household, plus the opening balance in
[`data/account.json`](data/account.json). There is no database and no clock:
"today" is the last booking in the file, so the app shows the same numbers on
every machine on every day. `node scripts/check-data.mjs` re-checks the ledger.

## Brand

| asset | where it is used |
| --- | --- |
| [`assets/logo_finanzuhu.jpeg`](assets/logo_finanzuhu.jpeg) | the source artwork — everything below is cut from it |
| `public/finanzuhu-logo.png` | full lockup, trimmed — the app header (`src/components/layout/brand.tsx`), README, Open Graph |
| `src/app/favicon.ico`, `icon.png`, `apple-icon.png` | the owl alone — browser tab and home screen |

The two brand colours live in [`src/app/globals.css`](src/app/globals.css) as
`--owl` (the violet) and `--owl-accent` (the teal); charts, focus rings and
the active navigation item all derive from them, in both themes.

## Getting started

| I want to… | |
| --- | --- |
| start a run | [Instructions in the concept](CONCEPT.md#getting-started) |
| understand how we work here | [`CONCEPT.md`](CONCEPT.md) |
| get the prompt for a step | [`sdlc/standards/prompts/`](sdlc/standards/prompts/README.md) |
| know what was built before the workshop | [`SETUP_PLAN.md`](SETUP_PLAN.md) |
| refresh the SDLC material | [`prerequisites/`](prerequisites/README.md) |

## Layout

```
src/             the Finanzuhu app — app router, features, lib
public/          brand assets served by the app
data/            the committed ledger the app reads
plan/            how the app was cut into slices
sdlc/            process artifacts — stories, plans, reviews, standards, prompts
docs/            architecture documentation, diagrams, decisions
tests/           test code and test data
assets/          logo and workshop imagery
prerequisites/   background material for reading up
```

Every folder explains itself in its own `README.md`. The details on the
process flow are in [`sdlc/README.md`](sdlc/README.md).

## Status

The process is in place and the codebase it works on exists: Finanzuhu runs,
with two features and two tests. `sdlc/standards/architecture.md` and
`code_style.md` stay empty on purpose — they are derived from this running
code in the first workshop session.

---

<div align="center">
  <a href="https://www.codecentric.de/">
    <img src="assets/codecentric_PrimLogo_farbe_rgb.png" alt="codecentric" width="180">
  </a>
  <br>
  <sub>Created in the workshop <em>AI-Assisted Coding</em> ·
  <a href="https://www.codecentric.de/">codecentric AG</a></sub>
</div>
