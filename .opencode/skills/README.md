# Skills

One skill per SDLC step. Run it with `/<skill-name> ST-XXX`, or refer to it in
your prompt.

| Skill                           | Output                                  |
| ------------------------------- | --------------------------------------- |
| `/refine-ticket ST-XXX`         | `sdlc/backlog/refined/ST-XXX.md`        |
| `/plan-ticket ST-XXX`           | `sdlc/backlog/plans/ST-XXX_plan.md`     |
| `/implement-ticket ST-XXX`      | code and tests                          |
| `/review-implementation ST-XXX` | `sdlc/backlog/reviews/ST-XXX_review.md` |

Optional frontmatter, not every tool evaluates it:

- `disable-model-invocation: true`: only a human can start the step.
- `context: fork` (in `review-implementation`): the review runs in a fresh
  context.
