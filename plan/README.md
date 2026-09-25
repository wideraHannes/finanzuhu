# Plan — Finanzuhu Setup in Slices

The [`SETUP_PLAN.md`](../SETUP_PLAN.md) says *what* we build. This folder says
*in which order*, cut into slices that each end in a state you can look at.

## Rules for every slice

- **It runs at the end.** No slice leaves the app broken or half-wired.
- **Keep it boring.** Plain functions, plain objects, no abstraction layers for
  a second use case that does not exist. If a dependency saves ten lines but
  costs a concept, skip it.
- **Readable without TypeScript knowledge.** Types where they help the editor,
  never type gymnastics. No generics in app code.
- **Two tests, not a pyramid.** Slice 3 adds exactly two example tests on the
  money math — the grounding for the workshop, not coverage.

## Order

| # | Slice | Ends with |
|---|---|---|
| 1 | [Dummy data](01-dummy-data.md) | `data/transactions.csv` committed and checked |
| 2 | [Scaffold & shell](02-scaffold-shell.md) | `npm run dev` shows the styled empty app |
| 3 | [Domain & API](03-domain-api.md) | `/api/summary` returns real numbers, 2 tests green |
| 4 | [Dashboard](04-dashboard.md) | F1 — “How much money do we have” |
| 5 | [Transactions](05-transactions.md) | F2 — the ledger table |
| 6 | [Polish & handover](06-polish.md) | states, responsive, README |

Data comes first on purpose: every screen afterwards is built against real
numbers instead of placeholders that have to be torn out later.
