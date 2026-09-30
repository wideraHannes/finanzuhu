# ST-002 — Implementation plan: LLM assistant for transactions and general questions

**Story:** [`refined/ST-002.md`](../../refined/done/ST-002.md)
**Standards:** [`architecture.md`](../../../standards/architecture.md) ·
[`definition_of_done.md`](../../../standards/definition_of_done.md)

## Approach

A chat page `/assistant` keeps the history in React state and posts it to
`POST /api/assistant`. The route calls the LLM through Requesty using the
official `openai` SDK (Requesty is OpenAI-compatible) and runs a small tool
loop: the model can call one tool, `search_transactions`, backed by a pure
function in `src/lib/`. Only the final answer text goes back to the browser.

```
page.tsx ──POST { messages }──▶ api/assistant/route.ts ──▶ lib/llm.ts ⇄ Requesty
                                                              └─▶ searchTransactions(getTransactions(), query)
         ◀── { reply } | { error } ──
```

## Changes per file

### 1. `package.json`

`npm install openai` (v7). Imported only in `src/lib/llm.ts`.

### 2. `src/lib/assistant-tools.ts` — new, pure

```ts
export type TransactionQuery = { from?: string; to?: string; category?: string; type?: "income" | "expense" };

export function searchTransactions(transactions: Transaction[], query: TransactionQuery):
  { count: number; total: number; transactions: Pick<Transaction, "date" | "amount" | "description" | "counterparty" | "category">[] };
```

- `from`/`to` are inclusive ISO days, compared as strings (as in `finance.ts`).
- `total` is the signed sum, rounded to cents. The code sums, not the model —
  that is what makes AC 7 reliable.
- Takes the ledger as a parameter because `getTransactions()` is `server-only`
  and can't be imported in Vitest; the caller passes `getTransactions()` (AC 5).

### 3. `src/lib/llm.ts` — new, `server-only`

`askAssistant(history: ChatMessage[]): Promise<string>`, throws
`AssistantError(message, status)` with a user-safe message.

1. Read `REQUESTY_API_KEY`, `REQUESTY_BASE_URL` and `REQUESTY_MODEL` on every call.
   The model defaults to `azure/gpt-6-luna@germanywestcentral`.
   Missing key/URL → `AssistantError("The assistant is not configured.", 503)`.
2. `new OpenAI({ apiKey, baseURL, timeout: 30_000, maxRetries: 1 })`.
3. Messages: system prompt + history. Tool `search_transactions` with the
   `TransactionQuery` fields as JSON schema; `category` is an `enum` of the
   ledger's categories.
4. Loop, max. 5 rounds, with `client.chat.completions.create()`:
   - `tool_calls` → append the assistant message, run `searchTransactions` per
     call, append `{ role: "tool", tool_call_id, content: JSON.stringify(result) }`.
     Bad arguments → tool result `{ error }` so the model can recover.
   - Otherwise return `message.content`.
   - Loop exhausted → `AssistantError(…, 502)`.
5. SDK errors → `AssistantError` with a readable message: `AuthenticationError`
   → 503, `APIConnectionError` → 502 ("unreachable"), other `APIError` → 502.
   Raw error details are only logged on the server.

**System prompt:** Finanzuhu assistant; today is the real current date, the ledger ends at
`referenceDate()` (AC 6); use
`search_transactions` for questions about bookings and report its `total`,
never invent figures (AC 7); answer general questions directly (AC 8); reply in
the language of the question; format amounts like `1.234,56 €`.

### 4. `src/app/api/assistant/route.ts` — new

- Validate the body: `messages` is a non-empty array (max. 50) of
  `{ role: "user" | "assistant", content: string }` (max. 4 000 chars), last one
  is a non-blank `user` message. Otherwise `400` (AC 10). The role allow-list
  stops clients from injecting `system`/`tool` messages.
- `askAssistant(messages)` → `200 { reply }`; `AssistantError` →
  `{ error }` with its status; anything else → `500`.

### 5. `src/features/assistant/assistant.ts` — new

`ChatMessage` type (shared with `llm.ts` and the route) and
`sendChat(messages): Promise<string>`, which throws the `error` from the
response body when the response isn't OK. Same pattern as
`features/transactions/transactions.ts`.

### 6. `src/app/assistant/page.tsx` — new, client

- `useState<ChatMessage[]>` for the history (lost on reload, AC 3) and the draft.
- `useMutation({ mutationFn: sendChat })`: on submit, append the user message,
  send the whole history, append the reply on success (AC 2, 3).
- Input and button disabled plus a "Thinking…" bubble while `isPending` (AC 9).
- `mutation.error` shown as a message in the list (AC 10).
- Plain-text messages (`whitespace-pre-wrap`), an empty-state hint with example
  questions, and a one-line disclaimer under the input.

### 7. `src/components/layout/sidebar.tsx`

Add `{ href: "/assistant", label: "Assistant", icon: MessageSquare }` to `NAV` (AC 1).

### 8. `README.md`

Note that the assistant needs a local `.env` with `REQUESTY_API_KEY`,
`REQUESTY_BASE_URL` and optionally `REQUESTY_MODEL` (default
`azure/gpt-6-luna@germanywestcentral`).

## Tests

**Unit** — `tests/unit/assistant-tools.test.ts` (AC 5, 11), each seen failing first:

- date range: bookings on 31 Jul, 1 Aug, 31 Aug and 1 Sep → only the two in August (inclusive bounds)
- category filter → only that category
- date range and category combined → the overlap only
- no match → `{ count: 0, total: 0, transactions: [] }`
- `total` is rounded to cents (e.g. `-0.1 + -0.2` → `-0.3`)

**Manual** (with a real `.env`):

| AC | Check |
| --- | --- |
| 1 | Sidebar entry opens `/assistant` |
| 2, 3 | Question and answer show up; the follow-up "and in September?" works; after a reload the chat is empty |
| 4 | No key in the browser: network tab and `grep -r REQUESTY .next/static` after `npm run build` |
| 6, 7 | "How much did I spend on Mobility in August?" matches the sum in the CSV |
| 8 | "What is a standing order?" is answered without a tool call |
| 9 | Loading state visible, button disabled |
| 10 | Missing key, wrong base URL or unknown model each give a readable chat error; `curl` with a bad body returns `400` |

## Risks

- **AC 7 reference:** the transactions page has no date filter and shows no sum,
  so we check totals against the CSV instead.
- **Model behaviour:** AC 7 and AC 8 depend on the model deciding whether to call
  the tool; the system prompt and the category enum lower the risk. Verify first
  that Requesty passes tool calls through for `azure/gpt-6-luna@germanywestcentral`.
- **Cost:** there is no rate limiting (out of scope); the message limits and the
  5-round cap are the only guards.

## Open questions

- **OQ-1** — Should the tool also have a free-text `q` (description or
  counterparty)? No AC needs it, so the plan leaves it out.
- **OQ-2** — Off-topic requests: should the assistant refuse them or answer them?
  The plan doesn't restrict them.
