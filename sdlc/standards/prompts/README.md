# Standard prompts

The recurring prompts of the SDLC — one per step, with the paths of this
repository. To copy, not to memorize.

| File | Step | Produces |
| --- | --- | --- |
| [`01_plan.md`](01_plan.md) | Story refinement | `backlog/refined/ST-XXX.md` |
| [`02_code.md`](02_code.md) | Implementation planning & execution | `backlog/plans/ST-XXX_plan.md`, code |
| [`03_test_release.md`](03_test_release.md) | Review & rework | `backlog/reviews/ST-XXX_review.md` |
| [`04_documentation.md`](04_documentation.md) | Documentation | `docs/` |

`ST-XXX` is to be replaced everywhere with the real identifier of the work
package.

## How to read these prompts

They are **starting points for a conversation**, not magic formulas. Where a
prompt triggers a follow-up question, that is a good sign: the AI is fetching
context it would otherwise have invented.

The language does not matter — whoever prefers to prompt in German does so. What
counts are the files handed along and what is expected as a result.

## Dos & don'ts

**Not like this:** "create a Definition of Done" — a bare command delivers
generic boilerplate.

**Not like this either:** "please …", "could you …" — politeness phrases
contribute nothing.

**But rather:** "Help us create a Definition of Done. What belongs in it?
[…] Ask one question at a time." That way the team's knowledge comes out instead
of the average of the training data.

## When a prompt is typed for the third time

Then it no longer belongs here but becomes a skill and can be called with
`/skill-name` from then on. Every heading in these files is a candidate for it.
