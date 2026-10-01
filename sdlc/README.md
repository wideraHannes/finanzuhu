# sdlc

The flow and everything it produces.

```
unrefined  →  refined  →  plan  →  implementation  →  review
              ↑ DoR                      ↑ tests       ↑ DoD
```

Run each step with its [skill](../.opencode/skills/README.md) or its
[standard prompt](standards/prompts/README.md).

## Folders

```
backlog/
  unrefined/    raw ideas, deliberately sparse
  refined/      stories sharpened against the Definition of Ready
  plans/        implementation plans
  reviews/      review reports
standards/
  definition_of_ready.md
  definition_of_done.md
  architecture.md
  prompts/      one standard prompt per step
  examples/     an applied story example
prerequisites/  background: SDLC refresher and slides
```

## Naming

A ticket keeps its ID in every folder:

```
unrefined/ST-001.md → refined/ST-001.md → plans/ST-001_plan.md → reviews/ST-001_review.md
```

A reworked plan becomes `ST-001_plan_v2.md`.

## Closing a ticket

Each backlog folder has a `done/` subfolder. Once a ticket meets every item of
the [Definition of Done](standards/definition_of_done.md), `git mv` each of its
files into the `done/` subfolder of the folder it is in (for example
`refined/ST-001.md` → `refined/done/ST-001.md`). That move closes it.
