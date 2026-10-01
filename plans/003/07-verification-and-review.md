# Step 07 — Verify, document, and review

## Goal

Prove the implementation meets ST-003 and the repository Definition of Done before progressing the ticket.

## Depends on

All prior steps.

## Automated verification

1. Confirm each new service test was first observed failing before its implementation.
2. Run the transaction service tests and then the full unit suite: `npm test`.
3. Run lint: `npm run lint`.
4. Run production build: `npm run build`.
5. Resolve newly introduced failures before review.

## Acceptance-criteria checklist

| AC  | Evidence                                                                                |
| --- | --------------------------------------------------------------------------------------- |
| 1   | All eight add-form fields are labelled and usable.                                      |
| 2–3 | Creation unit test; browser persistence check across reload/restart.                    |
| 4   | Removal unit test; row-action check and reload verification.                            |
| 5–6 | Reset confirmation check; exact-backup restoration test.                                |
| 7   | Check dashboard, budgets, spending, API, and assistant after each mutation.             |
| 8   | Invalid-input tests and readable UI/API error checks.                                   |
| 9   | Simulated persistence failure test plus UI error/unchanged-data check.                  |
| 10  | `tests/unit/transactions.test.ts` covers create, reject, remove, unknown ID, and reset. |

## Documentation and review

1. Update documentation only where the mutation behavior changes an existing statement.
2. Run a fresh-session implementation review and assess all findings.
3. Check every item in `sdlc/standards/definition_of_done.md`.
4. Only after every DoD item is fulfilled, move the ticket artifacts to the applicable `done/` stage folder following `AGENTS.md`.

## Done when

- Automated checks are green.
- Manual acceptance checks are recorded.
- A fresh review has been assessed.
- Ticket progression follows the Definition of Done, not merely code completion.
