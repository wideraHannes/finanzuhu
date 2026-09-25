# Code — implementation planning & execution

Goal: do not let the agent "just code". Plan first, read the plan critically,
then implement.

---

## Writing the implementation plan

```
Create an implementation plan for the story
sdlc/backlog/refined/ST-XXX.md.

First take a look at the current implementation.

- Which *parts* of the application have to be changed, and why?
- Which *tests* should be written?

Follow @sdlc/standards/architecture.md and @sdlc/standards/code_style.md.

Save the plan as sdlc/backlog/plans/ST-XXX_plan.md
```

## Reviewing the plan

In a **fresh session**. The phrasing "another developer" is deliberate:
criticism of someone else's work is more honest than of one's own.

```
A senior developer has written a plan for sdlc/backlog/refined/ST-XXX.md:
sdlc/backlog/plans/ST-XXX_plan.md

Review this plan.

What are its *strengths*, what are its *weaknesses*?
What would you *change* — and why?

Write a revised version to
sdlc/backlog/plans/ST-XXX_plan_v2.md
```

After that: read the plan **yourself**. It is the document everything else
follows from — a mistake here propagates into every line of code.

## Executing the plan

```
Implement sdlc/backlog/refined/ST-XXX.md according to the plan in
sdlc/backlog/plans/ST-XXX_plan_v2.md.

Where it makes sense, use sub-agents for individual tasks in order to keep the
context of the main session small.

Follow @sdlc/standards/architecture.md and @sdlc/standards/code_style.md.
```
