# AGENTS.md

Base repository for an AI-assisted SDLC. The flow lives in `sdlc/`, and the
Finanzuhu apps live under `apps/`. The TypeScript app is in `apps/typescript/`
(Next.js, Tailwind v4, TanStack Query, Vitest). Shared sample data lives in
`data/`.

- `npm --prefix apps/typescript run dev` · `npm --prefix apps/typescript test` ·
  `npm --prefix apps/typescript run lint`
- Python app: `cd apps/python && uv sync --extra dev` ·
  `uv run flask --app finanzuhu run --debug` · `uv run pytest` ·
  `uv run ruff check .`
- Java app: `./apps/java/mvnw -f apps/java/pom.xml spring-boot:run` ·
  `./apps/java/mvnw -f apps/java/pom.xml verify` ·
  `./apps/java/mvnw -f apps/java/pom.xml -Pbrowser-tests verify`

## Tickets

Follow [`sdlc/README.md`](sdlc/README.md) for folders, naming and closing a
ticket. Only move a ticket to `done/` after checking it against the Definition
of Done, not just because code was written.

When asked to write an unrefined ticket, keep it really sparse (just the idea),
so the difference is visible once it gets refined.

The SDLC workflow, tickets, and standards are repository-wide. Put application
code in the language-specific app selected for the task; do not duplicate
workflow materials or shared sample data inside an app.

The Python implementation lives under `apps/python/`, reads shared sample data
from the repository-level `data/`, and keeps financial calculations pure in
`apps/python/src/finanzuhu/finance.py` with pytest coverage under
`apps/python/tests/`.

## Keep it simple

The Java implementation lives under `apps/java/` (Java 25, Spring Boot,
Thymeleaf). Keep financial calculations pure in
`apps/java/src/main/java/de/finanzuhu/domain/Finance.java`; use the shared root
`data/` and JUnit coverage under `apps/java/src/test/java/`.

This is a demo project. Don't overengineer: keep implementations
straightforward and narrow in scope.
