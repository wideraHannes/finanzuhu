# Repository Concept

## Purpose

Walking through the Software Development Lifecycle with AI support — with a
structure that makes the flow visible, and a running codebase to practise it on.

Two layers, deliberately kept apart:

- **The process** — the SDLC artifacts, standards and prompts in `sdlc/`. This
  is the subject.
- **The demo project** — **Finanzuhu**, a personal-finance app in `src/`. This
  is the material the process is applied to, nothing more. It runs, it has data,
  it has tests, so every story changes something real.

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

The process is in place and the codebase it works on exists. What is missing is
the part that cannot be prepared: the team's own standards.

1. **Derive the steering documents from the running code.**
   `sdlc/standards/architecture.md` and `code_style.md` ship empty on purpose —
   they are worked out together with the AI, against the Finanzuhu code, before
   the first implementation plan. The same goes for Definition of Ready and
   Definition of Done: the existing versions are illustrative material, not a
   result, and get overwritten.
2. **Put raw stories into `sdlc/backlog/unrefined/`** (`ST-001.md`, …).
   Deliberately unfinished: they are the input for the first step. The features
   Finanzuhu is missing on purpose are listed in the
   [README](README.md#the-demo-project-finanzuhu).
3. **Start** with [`sdlc/standards/prompts/01_plan.md`](sdlc/standards/prompts/01_plan.md)
   and take one story through the full loop.

Start slow — the first pass is about understanding each step, not about
throughput. The cadence picks up once the steering documents hold and the loop
is familiar. What stays fixed is the order of the steps and the artifact each
one leaves behind.
