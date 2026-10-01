---
name: implement-ticket
description: Implement a refined ticket according to its plan, with tests. Use when the user wants to implement a story (ST-XXX).
argument-hint: ST-XXX
disable-model-invocation: true
---

# Implement a ticket

**Input:** `sdlc/backlog/refined/ST-XXX.md` and the latest plan in
`sdlc/backlog/plans/` (`ST-XXX_plan_v2.md` if present, else `ST-XXX_plan.md`)
**Output:** application code and tests

## Before you start

- Check that the plan still matches the codebase.
- Keep the architecture: pure domain logic in `src/lib/`, feature UI in
  `src/features/`, API routes in `src/app/api/`, one-way data flow
  `data/` → API / domain logic → features → UI.
- Build the smallest complete solution that fulfils every acceptance criterion.

## Quality gates

- Add or update tests in `tests/unit/` and see each new test fail once.
- Run `npm run lint` and `npm test`; fix every failure the change caused.

## Rules

- Do **not** broaden scope or invent requirements.
- Stop and report a blocker when a product decision is needed.
- Do **not** write a review report.

## Report

Summary, changed files, test evidence, remaining risks.
