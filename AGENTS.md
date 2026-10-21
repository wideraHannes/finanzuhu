# AGENTS.md

Base repository for an AI-assisted SDLC. The flow lives in `sdlc/`, and the
Finanzuhu apps live under `apps/`. The TypeScript app is in `apps/typescript/`
(Next.js, Tailwind v4, TanStack Query, Vitest). Shared sample data lives in
`data/`.

- `npm --prefix apps/typescript run dev` · `npm --prefix apps/typescript test` ·
  `npm --prefix apps/typescript run lint`

## Tickets

Follow [`sdlc/README.md`](sdlc/README.md) for folders, naming and closing a
ticket. Only move a ticket to `done/` after checking it against the Definition
of Done, not just because code was written.

When asked to write an unrefined ticket, keep it really sparse (just the idea),
so the difference is visible once it gets refined.

The SDLC workflow, tickets, and standards are repository-wide. Put application
code in the language-specific app selected for the task; do not duplicate
workflow materials or shared sample data inside an app.

## Keep it simple

This is a demo project. Don't overengineer: keep implementations
straightforward and narrow in scope.
