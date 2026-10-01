---
name: plan-ticket
description: Create an implementation plan for a refined ticket. Use when the user wants to plan a story (ST-XXX).
argument-hint: ST-XXX
---

# Plan a ticket

**Input:** `sdlc/backlog/refined/ST-XXX.md`
**Output:** `sdlc/backlog/plans/ST-XXX_plan.md`

## Preparation

- Inspect the current implementation and relevant tests.
- Keep the architecture: routes in `src/app/`, API routes in `src/app/api/`,
  feature UI in `src/features/`, shared UI in `src/components/`,
  pure domain logic in `src/lib/`, unit tests in `tests/unit/`.
- Data flows one way: `data/` → API / domain logic → features → UI.

## The plan covers

- Affected files, components, APIs, domain logic and tests
- The change in each place and why it is needed
- Data flow, validation and error handling
- Test cases mapped to each acceptance criterion
- Risks, assumptions and open questions

## Rules

- Do **not** change application code.
- Do **not** invent requirements; call out ambiguities instead.
