# Skills

One folder per SDLC step, each with a standalone `SKILL.md`.

| Skill                           | Step                    | Output                                  |
| ------------------------------- | ----------------------- | --------------------------------------- |
| `/refine-ticket ST-XXX`         | refine a raw ticket     | `sdlc/backlog/refined/ST-XXX.md`        |
| `/plan-ticket ST-XXX`           | create a plan           | `sdlc/backlog/plans/ST-XXX_plan.md`     |
| `/implement-ticket ST-XXX`      | implement plan          | code and tests                          |
| `/review-implementation ST-XXX` | review implementation   | `sdlc/backlog/reviews/ST-XXX_review.md` |

- `disable-model-invocation: true` — a step runs only when a human calls it.
- `review-implementation` uses `context: fork`, so the review runs in a fresh context.
