---
name: review-implementation
description: Review the implementation of a ticket against its story and plan, and write the review report. Use when the user wants to review a story (ST-XXX).
argument-hint: ST-XXX
disable-model-invocation: true
context: fork
---

# Review an implementation

**Input:** `sdlc/backlog/refined/ST-XXX.md`, the latest plan in
`sdlc/backlog/plans/` and the current code
**Output:** `sdlc/backlog/reviews/ST-XXX_review.md`

## Check

- [ ] All acceptance criteria are fulfilled
- [ ] Tests cover the new behavior
- [ ] `npm run lint` and `npm test` are green — run them yourself
- [ ] Architecture kept: domain logic pure in `src/lib/`, one-way data flow
- [ ] Readable: meaningful names, no dead code, no commented-out leftovers
- [ ] Error handling beyond the happy path
- [ ] Security: no secrets in code, inputs validated
- [ ] Documentation updated where the change made it outdated

Inspect the code and tests themselves — don't rely on the plan or earlier reports.

## Report

- Findings by severity, each with file, evidence, impact and a concrete fix
- What was verified successfully
- Checks that could not be run
