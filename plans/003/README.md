# ST-003 — Step-by-step implementation plan

This decomposes [`sdlc/backlog/plans/ST-003_plan.md`](../../sdlc/backlog/plans/ST-003_plan.md) into small, ordered implementation slices. It does not change the refined story or resolve its open product questions.

## Implementation order

| Step | File                                                             | Outcome                                                             | Depends on |
| ---- | ---------------------------------------------------------------- | ------------------------------------------------------------------- | ---------- |
| 00   | [`00-decisions.md`](00-decisions.md)                             | Confirm the three unresolved product rules.                         | —          |
| 01   | [`01-ledger-foundation.md`](01-ledger-foundation.md)             | Add the immutable default ledger and testable storage boundary.     | 00         |
| 02   | [`02-ledger-create.md`](02-ledger-create.md)                     | Add validated, persisted transaction creation.                      | 01         |
| 03   | [`03-ledger-remove-reset.md`](03-ledger-remove-reset.md)         | Add persisted removal and restore-from-default operations.          | 01         |
| 04   | [`04-mutation-api.md`](04-mutation-api.md)                       | Expose create, remove, and reset through API routes.                | 02, 03     |
| 05   | [`05-client-mutation-layer.md`](05-client-mutation-layer.md)     | Add client request helpers with safe error handling.                | 04         |
| 06   | [`06-transaction-page-ui.md`](06-transaction-page-ui.md)         | Add form, row removal, reset confirmation, and cache refresh.       | 05         |
| 07   | [`07-verification-and-review.md`](07-verification-and-review.md) | Verify all acceptance criteria and complete the Definition of Done. | 01–06      |

## Guardrails

- Keep the one-way flow: `data/` → domain/API → feature → UI.
- Keep all CSV reads and writes inside `src/lib/transactions.ts` (or a narrowly extracted server-only dependency of that module).
- Update the ledger cache only after a successful full-file replacement.
- Do not use the committed ledger as mutable test data.
- Keep this work narrow: no editing, importing, accounts, or concurrent-write support.
