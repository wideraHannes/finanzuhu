# sdlc — process artifacts

Everything the Software Development Lifecycle produces in terms of documents
lives here. A work package travels visibly from top to bottom through the
folders.

```
backlog/
  unrefined/    raw stories as they come from the product side
  refined/      stories sharpened against the Definition of Ready
  plans/        implementation plans (ST-001_plan.md, ST-001_plan_v2.md)
  reviews/      review reports from the test/release phase

standards/
  definition_of_ready.md    when a story is ready to be implemented
  definition_of_done.md     when an implementation counts as finished
  architecture.md           how the system is built
  code_style.md             what code has to look like
  prompts/                  the standard prompts per SDLC step
  examples/                 applied examples to look up
```

The [standard prompts](standards/prompts/README.md) are the entry point into
every step: one file per phase, with the paths of this repository filled in.

In addition, outside this folder:

- [`docs/`](../docs/README.md) — architecture documentation, diagrams,
  decisions, test strategy
- [`tests/`](../tests/README.md) — test code and test data

## Naming convention

A work package keeps its identifier across all folders:

```
unrefined/ST-001.md  →  refined/ST-001.md  →  plans/ST-001_plan.md
                                           →  plans/ST-001_plan_v2.md
                                           →  reviews/ST-001_review.md
```

That way it is visible at a glance where a ticket stands and what it is still
missing.
