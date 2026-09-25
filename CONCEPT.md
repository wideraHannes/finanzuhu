# Repository Concept

## Purpose

A **demo project** for walking through the Software Development Lifecycle with
AI support — with examples and a structure that makes the flow visible.

The basis is the [SDLC Workshop Refresher](prerequisites/sdlc_refresher.md) from
the *AI-Assisted Coding* workshop by
[codecentric AG](https://www.codecentric.de/).

## Guiding idea

Every SDLC step produces a **Markdown file** that the next step reads as input.
These files steer the AI and make its work repeatable, reviewable and shareable
across the team.

```
unrefined  →  refined  →  plan  →  implementation  →  review  →  docs
              ↑ DoR                      ↑ tests       ↑ DoD       ↺
```

The folder structure mirrors this flow — a ticket travels visibly through the
phases instead of disappearing into a tool. What lives where is described in
[`sdlc/README.md`](sdlc/README.md).

Every step comes with a [standard prompt](sdlc/standards/prompts/README.md) and
examples to look up. Definition of Ready and Definition of Done are ready in the
repository — as illustrative material, not as the final word: both are worked
out again together with the AI and overwritten.

## Way of working

- **Every session ends with a committed result.** No state stays only inside an
  AI session.
- **If a prompt repeats, it becomes a skill** and can be called with
  `/skill-name` from then on.

## Principles

- **Context beats commands.** Treat the AI like a senior developer who was woken
  up at 3 am and put in front of an unknown project: skilled, but without any
  context.
- **Dialogue instead of one-liners.** Not "create a Definition of Done", but
  "help us create a DoD — what belongs in it? Ask one question at a time."
- **Reviews in a fresh session.** Whoever wrote the code is biased toward their
  own decisions — the AI just as much as a human.
- **Keep steering documents short.** Everything in `architecture.md` and
  `code_style.md` costs context in *every* session.
- **Check manually, by priority.** Steering documents first, then
  stories/plans/reviews, then tests, then business logic, then the rest.
- **Tests you have not seen fail are worthless.**

## Getting started

This repository is a **template**: the process is in place, the project is
missing. Every run starts with a fresh copy.

1. **Decide on domain and tech stack.** Small enough that one story can be
   implemented in a single session.
2. **Put raw stories into `sdlc/backlog/unrefined/`** (`ST-001.md`, …).
   Deliberately unfinished: they are the input for the first step.
3. **Start** with [`sdlc/standards/prompts/01_plan.md`](sdlc/standards/prompts/01_plan.md).

`architecture.md` and `code_style.md` are *not* filled in up front. They emerge
during the run itself — together with the AI, before the first implementation
plan. The same goes for Definition of Ready and Done: the existing versions are
illustrative material, not a result.
