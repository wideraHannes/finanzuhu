# Finanzuhu SDLC prompts

These fixed, copy-ready prompts support one ticket at a time. Replace every `ST-XXX` with the ticket ID, then submit the prompt unchanged. Each required artifact is referenced with `@`, so an agent can open the story, plan, review, and standards directly.

The prompts can also serve as a workflow reference when a step needs to be adapted. Keep the required `@` references and output locations when adapting them.

| Step | Prompt                                                                   | Input                                             | Output                                   |
| ---- | ------------------------------------------------------------------------ | ------------------------------------------------- | ---------------------------------------- |
| 1    | [`01_refine_story.md`](01_refine_story.md)                               | `@sdlc/backlog/unrefined/ST-XXX.md`               | `@sdlc/backlog/refined/ST-XXX.md`        |
| 2A   | [`02a_create_implementation_plan.md`](02a_create_implementation_plan.md) | refined ticket                                    | `@sdlc/backlog/plans/ST-XXX_plan.md`     |
| 2B   | [`02b_review_implementation_plan.md`](02b_review_implementation_plan.md) | refined ticket and initial plan                   | `@sdlc/backlog/plans/ST-XXX_plan_v2.md`  |
| 3    | [`03_implement_story.md`](03_implement_story.md)                         | refined ticket and reviewed plan                  | application code and tests               |
| 4A   | [`04a_review_implementation.md`](04a_review_implementation.md)           | refined ticket, reviewed plan, and implementation | `@sdlc/backlog/reviews/ST-XXX_review.md` |
| 4B   | [`04b_address_review_findings.md`](04b_address_review_findings.md)       | refined ticket and review report                  | resolved findings in the review report   |

The artifact naming convention is defined in [@sdlc/README.md](../../README.md).
