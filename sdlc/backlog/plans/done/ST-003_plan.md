# ST-003 — Implementation plan: Manage transactions

**Story:** [`refined/ST-003.md`](../../refined/done/ST-003.md)  
**Standards:** [`architecture.md`](../../../standards/architecture.md) ·
[`definition_of_done.md`](../../../standards/definition_of_done.md)

## Current state and constraints

- `data/transactions.csv` is the only transaction ledger. `getTransactions()`
  parses it once into a module cache, and every reader (`/api/transactions`,
  dashboard summary, spending overview, budgets, and assistant) uses that
  function.
- `src/lib/transactions.ts` currently reads only; it has no validation,
  serialization, mutation, cache invalidation, or default-backup file.
- The transactions page uses TanStack Query, and `TransactionTable` currently
  presents five columns with no row action.
- `referenceDate()` returns the last array entry. An added transaction whose
  date is later than the current final entry must therefore either be persisted
  in deterministic date order or require `referenceDate()` to derive the latest
  date, so dashboard ranges do not become stale.
- The project has unit tests for pure finance and assistant functions, but no
  API/component test harness. The mutation and validation logic should remain
  independently testable in `tests/unit/`.

## Data flow

```
data/transactions.default.csv ──┐
                               ├── transaction ledger service ──▶ data/transactions.csv
client add/remove/reset ───────┘              │
                                              ▼
                              GET /api/transactions and all existing readers
                                              │
                                              ▼
                              TanStack Query cache invalidation → transaction UI
```

The ledger service is the single writer and updates its in-process cache only
after a successful filesystem write. Existing readers then automatically see
fresh data through `getTransactions()`, rather than maintaining independent
copies of the ledger.

## Planned changes

### 1. `data/transactions.default.csv` — add the committed reset source

Copy the current committed `data/transactions.csv` into a new committed default
ledger file before mutation functionality is introduced.

- This file is the sole reset source; it is never written by the application.
- Its header and row layout must match `transactions.csv` exactly.

**Why:** reset must restore a known original ledger even after additions and
removals have changed the active file.

### 2. `src/lib/transactions.ts` — add validated ledger mutation operations

Retain `getTransactions()` as the shared reader and extend this server-only
module with the mutation boundary. Extract the CSV parse/serialize mechanics so
the same representation is used for reads, writes, and reset.

Add a narrow input contract containing the user-editable fields:

```ts
export type TransactionInput = Omit<Transaction, "id">;
```

Add operations along these lines:

```ts
export function createTransaction(input: TransactionInput): Transaction;
export function removeTransaction(id: string): Transaction[];
export function resetTransactions(): Transaction[];
```

The exact exported names can follow local conventions, but their responsibilities
should remain separate:

- **Validate before writing.** Require non-empty string fields for date,
  description, counterparty, category, and method; validate date as a real
  `YYYY-MM-DD` calendar day; require a finite, safely serializable amount;
  and restrict `type` to `income` or `expense`.
- The refined ticket says the client supplies a signed amount and explicitly
  selects a type, but does not settle whether their signs must agree. The
  service must not silently change the amount or type. The unresolved
  consistency rule needs confirmation before implementation.
- Reject CSV-unsafe text values rather than introducing a CSV parser: at a
  minimum values containing commas or line breaks cannot be represented by the
  existing `split(",")` parser. Apply the exact same safety rule on the server
  even if the UI performs pre-validation.
- Generate a new unique ID server-side. Generate it independently of the
  client input and check it against existing IDs before writing. The concrete
  ID format is not specified; it only needs to be unique and persistable.
- Serialize every row with the current nine CSV columns and header. Choose a
  deterministic ordering that retains a correct last transaction for
  `referenceDate()`; date ascending with a stable tie-breaker is sufficient.
  Alternatively, update `referenceDate()` to compute the latest date. Do not
  leave the current implicit ordering behavior ambiguous.
- For deletion, reject an unknown ID without writing or changing the cache.
  Return an identifiable domain error so the route can produce a readable 404.
- For reset, read the backup and fully validate/parse it before replacing the
  active ledger. Then write the complete backup to `transactions.csv`.
- Write the full next ledger atomically where practical (temporary sibling file
  followed by rename) so a failed write does not leave a truncated CSV. Update
  `cache` only after the active-file replacement succeeds.
- Preserve filesystem errors for the API route to convert into a user-safe
  error; do not replace the cached ledger on failure.

**Why:** the filesystem and cache are server concerns, while the operations are
kept in one directly testable module that all routes and downstream readers use.

### 3. `src/app/api/transactions/route.ts` — expose mutation endpoints

Keep the existing filtered `GET` response unchanged and add methods on the
same resource:

| Method                                                        | Request                        | Success response                   | Expected failure                                     |
| ------------------------------------------------------------- | ------------------------------ | ---------------------------------- | ---------------------------------------------------- |
| `POST /api/transactions`                                      | JSON transaction fields, no ID | newly created `Transaction`        | `400` validation/JSON error; `500` persistence error |
| `DELETE /api/transactions/:id` or equivalent ID-bearing route | no body                        | updated transaction response/list  | `404` unknown ID; `500` persistence error            |
| `POST /api/transactions/reset`                                | no body                        | restored transaction response/list | `500` backup/read/write error                        |

The current story does not dictate the exact URL shape for remove and reset.
Use a dedicated dynamic API route for one transaction and a dedicated reset
route if following Next.js resource conventions; document the selected contract
in the implementation. Avoid overloading the existing filtered `GET` query
parameters with mutation actions.

For every write endpoint:

- Safely parse JSON where relevant and send readable `{ error: string }`
  responses.
- Map known input and unknown-ID errors to `400`/`404` respectively.
- Log the underlying unexpected server failure and return a generic readable
  failure message without claiming that data changed.
- Return either the authoritative updated list or enough information for the
  browser to invalidate and reload `GET /api/transactions`; do not update
  browser state optimistically before the write succeeds.

**Why:** API routes remain the client/server boundary and expose the persisted
ledger without changing the read contract consumed elsewhere.

### 4. `src/features/transactions/transactions.ts` — add client mutation helpers

Keep existing read types and `fetchTransactions()` and add:

- a `TransactionInput` type for form state/request payload (or import the
  shared input type only if it does not pull server-only code into the client),
- `createTransaction(input)`,
- `removeTransaction(id)`, and
- `resetTransactions()`.

Each helper should use the chosen endpoint and throw the readable server error
from the response when present, otherwise a safe fallback message.

**Why:** request construction and response/error handling stay out of the page
component, matching the existing fetcher pattern.

### 5. `src/features/transactions/transaction-form.tsx` — add form UI

Create a client form component that renders all fields required by AC 1:

- date;
- signed amount;
- description;
- counterparty;
- category;
- type;
- payment method; and
- recurring boolean.

Use the existing `Input`, `Select`, `Button`, and form-native controls where
possible. The category/method open questions mean the plan must not choose
between free text and values restricted to the existing ledger without a product
decision. If free text is selected, validate it under the CSV safety rule; if
restricted selects are selected, source their options from the current ledger.

Perform basic client validation for missing fields, invalid dates, numeric
amounts, allowed type, and the chosen text-safety constraints. Render readable
field/form errors. The submit callback invokes the page mutation only after
valid client input; server validation remains authoritative.

**Why:** it keeps creation-specific state separate from filtering and table
presentation, while the page remains responsible for query cache coordination.

### 6. `src/features/transactions/transaction-table.tsx` — add remove control

Extend the table props with an `onRemove(transaction)` callback and disabled/
pending state as needed. Add an accessible remove button to each displayed row;
on activation it calls the callback immediately with no confirmation or undo.

- Add an action table header and adjust skeleton/empty `colSpan` values.
- Keep the current responsive behavior: determine whether the action should
  remain visible on narrow screens while avoiding an inaccessible hidden-only
  control.
- Disable the relevant remove action while its request is pending to prevent
  duplicate deletion submissions.

**Why:** the row already owns the displayed transaction identity, while the
page owns the persisted mutation and cache refresh.

### 7. `src/app/transactions/page.tsx` — coordinate writes and reset confirmation

Continue using the existing TanStack Query read query. Add `useMutation` flows
for create, remove, and reset.

- On a successful mutation, invalidate the `transactions` query so the list and
  category filter reload from the authoritative persisted ledger without a full
  page reload.
- Clear any client form state only after a successful add.
- Display readable mutation errors near the relevant action and retain form
  input/list state after failures.
- Place the add form and a clearly labelled reset action on the transaction
  page without disrupting filtering and sorting.
- Before reset, show a clear warning that all additions and removals will be
  lost and require explicit confirmation. A native confirmation dialog can meet
  the stated requirement without adding a dialog dependency; a custom dialog is
  also possible if project conventions require it.
- Only invalidate/refetch after the server confirms reset. Optionally show
  success feedback only if the open question is decided; it is not an
  acceptance criterion.

**Why:** this preserves the existing one-way flow: UI event → API mutation →
persisted ledger → refetched API data → table.

### 8. Existing readers — verify cache-based freshness, modify only if needed

Do not create separate synchronization paths for dashboard, budgets, spending,
or assistant. Their next route/tool call already invokes `getTransactions()`.
The mutation service's successful cache replacement should make it serve the
new ledger.

Review `referenceDate()` as part of the transaction-service change because the
summary, spending default range, and assistant prompt use it. Ensure it remains
correct after records are added in any valid date order.

**Why:** AC 7 requires all consumers to use the same updated ledger, not client
notifications or duplicated state.

### 9. `tests/unit/transactions.test.ts` — cover service behavior using isolated files

Add a transaction-ledger unit test suite. Since production code resolves files
from `process.cwd()/data`, make the storage paths injectable or encapsulate the
file operations in a factory so tests can use a temporary ledger and backup.
Do not point mutation tests at the committed `data/transactions.csv`.

Test the service directly:

- creating a complete valid transaction assigns a unique ID, persists it, and
  makes a fresh read return the new shape;
- missing fields, malformed/non-calendar dates, invalid type, non-finite amount,
  and CSV-unsafe values are rejected without changing the active file;
- removing a known ID persists the removal;
- removing an unknown ID fails without changing the active file; and
- reset restores the active file exactly to the backup after a create/remove.

Add a small regression case confirming the post-mutation reference date behavior
for a transaction later than the seed ledger, if ordering or `referenceDate()`
is modified.

**Why:** these tests directly satisfy AC 10 and protect the dangerous
filesystem/cache boundaries. Existing finance, assistant, budget, and spending
tests continue exercising their pure read behavior.

## Acceptance-criteria coverage

| AC  | Automated coverage                                                                                    | Manual verification                                                                                     |
| --- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| 1   | Client form structure is not covered by the current unit-only harness.                                | All eight fields are visible, labelled, and usable.                                                     |
| 2   | Valid create persists and is returned by a fresh ledger read.                                         | Submit, observe the new row without reload, then reload/restart and verify it remains.                  |
| 3   | Create assigns a unique ID and returns a valid `Transaction`.                                         | Inspect returned/listed booking after add.                                                              |
| 4   | Known-ID removal persists; unknown ID is rejected unchanged.                                          | Use a row remove action; confirm it disappears immediately and remains absent after reload.             |
| 5   | —                                                                                                     | Trigger reset and verify a clear loss warning plus an explicit confirm/cancel choice.                   |
| 6   | Reset restores exact backup contents.                                                                 | Confirm reset and verify list updates without reloading.                                                |
| 7   | Service cache is replaced only after successful writes; reference-date regression test if applicable. | Refresh dashboard, budgets, spending, and ask the assistant after each mutation.                        |
| 8   | Invalid inputs do not write/change active ledger.                                                     | Submit invalid form values and crafted invalid API requests; verify readable errors and unchanged list. |
| 9   | Simulated write failure leaves the temporary ledger and cache unchanged.                              | With an unavailable/unwritable data location, verify an error and unchanged displayed data.             |
| 10  | New `transactions.test.ts` covers valid create, rejection, removal, unknown ID, and reset.            | —                                                                                                       |

Every new test must be run while failing before its corresponding implementation
is added. Run `npm run lint`, `npm test`, and `npm run build` after
implementation.

## Risks, assumptions, and decisions needed

1. **Category and payment-method choices:** the refined story leaves it open
   whether these inputs allow new text or only existing ledger values. This
   determines controls, validation, and whether added categories appear in
   budget/select UI.
2. **Amount/type consistency:** the story requires a signed amount and explicit
   type but does not say whether `income` must be positive and `expense` must
   be negative. Confirm the business rule before validation is implemented.
3. **CSV limitations:** the current CSV parser deliberately cannot represent
   commas, quotes, or line breaks. This plan assumes server validation rejects
   values that cannot be safely persisted; switching to full CSV quoting/parser
   support is a broader implementation decision.
4. **Runtime persistence:** writes work only where `data/` is writable and
   durable. The expected production behavior for read-only/ephemeral hosting is
   a readable write error, as described by the story.
5. **Concurrent writes:** excluded by scope. Atomic replacement protects a
   single write from truncation but does not establish multi-writer conflict
   handling.
6. **Reset feedback:** confirmation is required; a success toast/message is
   explicitly unresolved and should not be added as a requirement without a
   decision.
