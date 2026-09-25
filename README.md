<div align="center">

<a href="https://www.codecentric.de/">
  <img src="assets/codecentric_PrimLogo_farbe_rgb.png" alt="codecentric" width="260">
</a>

# SDLC with AI Support

**A project template for walking through the complete Software Development
Lifecycle** — from the raw backlog entry to the updated documentation.

<img src="assets/SDLC_loop.png" alt="The DevOps loop with the AI touchpoints per phase" width="620">

</div>

---

## What this is about

AI does not only help with writing code, but at every station of the loop.
This template covers the section from **Plan to Release** and makes it
walkable: each step produces a Markdown file that the next one reads as input.

```
unrefined  →  refined  →  plan  →  implementation  →  review  →  docs
              ↑ DoR                      ↑ tests       ↑ DoD       ↺
```

These files steer the AI and make its work repeatable, reviewable and
shareable across the team. A ticket travels visibly through the folders
instead of disappearing into a tool.

## Run the dummy app

The repository ships with **Finanzuhu**, a small personal-finance app that the
workshop uses as its codebase. It needs nothing but Node:

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

## Getting started

| I want to… | |
| --- | --- |
| start a run | [Instructions in the concept](CONCEPT.md#getting-started) |
| understand how we work here | [`CONCEPT.md`](CONCEPT.md) |
| get the prompt for a step | [`sdlc/standards/prompts/`](sdlc/standards/prompts/README.md) |
| refresh the SDLC material | [`prerequisites/`](prerequisites/README.md) |

## Layout

```
src/             the Finanzuhu app — app router, features, lib
data/            the committed ledger the app reads
plan/            how the app was cut into slices
sdlc/            process artifacts — stories, plans, reviews, standards, prompts
docs/            architecture documentation, diagrams, decisions
tests/           test code and test data
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
  <sub>Created in the workshop <em>AI-Assisted Coding</em> ·
  <a href="https://www.codecentric.de/">codecentric AG</a></sub>
</div>
