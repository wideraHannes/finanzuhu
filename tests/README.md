# tests

Test code and test data.

The concrete layout — directories, naming, what gets mocked — is described in
[`../sdlc/standards/code_style.md`](../sdlc/standards/code_style.md) as soon as
the tech stack is settled.

Two rules apply regardless:

- Tests are **always checked manually**. AI-written tests can be subtly wrong —
  for instance in a way that makes them always green.
- A test you have **not seen fail** is worthless.
