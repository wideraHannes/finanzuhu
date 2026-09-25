# Plan — story refinement

Goal: turn a raw backlog entry into a story an agent can build from without
guessing.

---

## Working out the Definition of Ready

One-off — and deliberately as a dialogue, not as an order.

```
We need a "Definition of Ready" for our project, so that every ticket has a
defined quality.

It should include:
- story sentence ("As a … I want to … so that …")
- business context where needed
- acceptance criteria

What other aspects belong in a story, in your opinion?
Ask one question at a time.

Keep the result short and concise.
Save it as sdlc/standards/definition_of_ready.md
```

## Refining a story

```
Take a look at the story in sdlc/backlog/unrefined/ST-XXX.md.

Sharpen it against @sdlc/standards/definition_of_ready.md.

Where business context is missing, ask instead of inventing it.

Save the result as sdlc/backlog/refined/ST-XXX.md
```

An example of a story that fulfils the DoR:
[`../examples/story_example.md`](../examples/story_example.md)

## Checking a story against the DoR

For a second opinion — ideally in a fresh session.

```
Check sdlc/backlog/refined/ST-XXX.md against
@sdlc/standards/definition_of_ready.md.

Which criteria are fulfilled, which are not?
Where is the story still so vague that you would have to guess when
implementing it?
```
