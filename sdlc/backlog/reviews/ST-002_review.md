# ST-002 — Implementation review

**Story:** [`refined/ST-002.md`](../refined/ST-002.md)
**Plan:** [`plans/ST-002_plan.md`](../plans/ST-002_plan.md)
**Standards:** [`architecture.md`](../../standards/architecture.md) ·
[`definition_of_done.md`](../../standards/definition_of_done.md)
**Reviewed:** 2026-09-30, working tree on branch `session_3` (uncommitted)

## Verdict

The implementation follows the plan closely and meets the acceptance criteria.
No blocking findings. The main gap is the **chat persistence** reported during
manual testing: the chat is lost not only on reload (intended, AC 3) but on
every navigation away from `/assistant` — that should be decided and fixed
before closing. The remaining findings are minor robustness and UX items.

## Findings

### Medium

**M-1 — Chat is lost when navigating away from `/assistant`**

- _Area:_ `src/app/assistant/page.tsx:46` (`useState<ChatMessage[]>`)
- _Evidence:_ The history lives in component state of the page. Switching to
  "Overview" or "Transactions" via the sidebar unmounts the page, so returning
  to "Assistant" shows an empty chat. A request still in flight is also
  dropped (its `onSuccess` updates an unmounted component).
- _Context:_ The story explicitly puts persistence **out of scope** ("Persisting
  chats (server or `localStorage`) … not part of this story") and AC 3 requires
  an empty chat after a reload. So "no persistence across reloads" is correct
  per spec. Losing the chat on in-app navigation, however, is not something the
  story asked for and is what makes the feature feel like "persistence doesn't
  work at all".
- _Recommendation:_ Decide with the PO:
  1. _Within the story (small):_ keep the history for the browser session
     across navigation, e.g. lift it into a tiny React context in
     `src/app/providers.tsx` (or the TanStack `QueryClient` cache). Reload still
     clears it, so AC 3 stays fulfilled.
  2. _Real persistence (reload-proof, `localStorage`/server, multiple chats):_
     write a new ticket — it contradicts the current scope and AC 3.
- _Resolution (2026-09-30):_ Option 1 implemented. The history and the
  mutation live in `ChatProvider` (`src/features/assistant/chat-context.tsx`),
  mounted in `src/app/providers.tsx`. The chat and a request in flight survive
  in-app navigation; a reload still clears it (AC 3).

## Definition of Done

| Item                                    | Status                                                                                                                                                     |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Acceptance criteria                     | ✅ (M-1 to decide)                                                                                                                                         |
| Tests cover new behaviour, seen failing | ✅ covered · ⚠️ "seen failing" not verifiable from the review                                                                                              |
| Test suite green                        | ✅ `npm test`: 3 files, 19 tests passed                                                                                                                    |
| Architecture / code style               | ✅ route in `app/api`, pure logic in `lib`, fetcher in `features`, UI in `app` · `code_style.md` referenced by the DoD does not exist in `sdlc/standards/` |
| Readability                             | ✅ clear names, no dead code                                                                                                                               |
| Error handling                          | ✅ deliberate, minor gaps L-1, L-4                                                                                                                         |
| Security                                | ✅ no secrets in code, body validated, role allow-list blocks `system`/`tool` injection, key server-only                                                   |
| Documentation                           | ⚠️ README updated; I-1 left                                                                                                                                |
| Review in a fresh session               | ✅ this review                                                                                                                                             |

## Checks run

- `npm test` — green (19/19)
- `npx tsc --noEmit` — no errors
- `npm run lint` — no findings
- Against the running dev server (`localhost:3000`, real `.env`):
  - `POST /api/assistant` with `{}`, a `system` message and a non-JSON body → `400`
  - Ledger question, relative-date question and general-knowledge question → `200`, totals cross-checked against `data/transactions.csv`
