# AGENTS.md

Workshop repo: the SDLC process lives in `sdlc/`, the app it is practised on is
**Finanzuhu** in `src/` (Next.js 15, Tailwind v4, TanStack Query, Vitest).

- `npm run dev` · `npm test`

## Backlog progression

A ticket moves through `sdlc/backlog/unrefined/` → `refined/` → `plans/` →
`reviews/`. Each of these four folders has its own `done/` subfolder
(e.g. `sdlc/backlog/refined/done/`). Once a ticket fulfils every item in
`sdlc/standards/definition_of_done.md`, move all of its files into the
`done/` subfolder of whichever stage folder they're currently in — that
move is what marks it closed. Don't move a ticket into a `done/` subfolder
just because code was written; check it against the Definition of Done
first.

## Writing an unrefined ticket

When asked to write an unrefined ticket, make it really sparse — just the
idea — so the difference is clearly visible once it gets refined.

## Keep it simple

This is a demo project. Don't overengineer — keep implementations
straightforward and narrow in scope.
