# Test / Release — review & rework

Goal: check the result against a yardstick that was fixed beforehand — and
assess the findings before working through them.

**Review and rework always run in a separate session.** Whoever wrote the code is
biased toward their own decisions — an AI session just as much as a human.

---

## Working out the Definition of Done

One-off, again as a dialogue.

```
We need a "Definition of Done" for our project, so that every implementation has
a defined quality and follows the same rules.

It should include:
- readability
- maintainability
- test coverage
- compliance with architecture.md and code_style.md
- the acceptance criteria of the story

Which aspects belong in it as well, in your opinion?
Ask one question at a time.

Stay under 200 lines — the file is read in every review session.
Save it as sdlc/standards/definition_of_done.md
```

## Review

```
Review the changes that were made for sdlc/backlog/refined/ST-XXX.md according
to the plan in sdlc/backlog/plans/ST-XXX_plan_v2.md.

Is the implementation *consistent*, *secure*, *maintainable*?

Does it follow @sdlc/standards/architecture.md, @sdlc/standards/code_style.md
and @sdlc/standards/definition_of_done.md?

Save the report as sdlc/backlog/reviews/ST-XXX_review.md
```

Then: go through the findings **manually** and decide which ones are worth the
rework. Not every finding is one.

## Rework

```
Take a look at sdlc/backlog/reviews/ST-XXX_review.md.

Work through the following findings — one after the other:
[name the selected findings here]

Follow @sdlc/standards/architecture.md and @sdlc/standards/code_style.md.
```

Then review again. The loop runs until the result holds up.

## Tests

Two rules that know no shortcut:

- Tests are **always checked manually**. AI-written tests can be subtly wrong —
  for instance in a way that makes them always green.
- A test you have **not seen fail** is worthless.
