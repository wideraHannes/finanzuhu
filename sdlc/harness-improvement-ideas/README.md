# Harness Improvement Idea Collection

A parking lot for Guides and Sensors we don't have yet. Not a backlog, not
prioritized — just a flat list to pick from when the process needs another
guardrail. Move an idea out (delete it here) once it's actually built and
listed in the main [README](../../README.md#guides--sensors).

Add an idea as one bullet: what it is, which of the four cells it belongs in,
and why it would help.

- **Pre-commit hook running `npm run lint` + `npm test`** — Sensor,
  Computational. Catches a broken commit before it lands instead of at review
  time.
- **`refine-ticket` skill wrapping `01_refine_story.md`** — Guide,
  Inferential. Turns the copy-paste prompt into a Copilot skill so refining a
  story is one command instead of finding and filling in the template. Home:
  [`.github/skills/`](../../.github/skills/README.md).
- **Architecture-drift check** (script that diffs `architecture.md` claims
  against actual `src/` structure) — Sensor, Computational. Keeps the
  steering doc honest as the codebase grows past what one person can track.
- **Review-prompt checklist tied to `definition_of_done.md`** — Sensor,
  Inferential. Makes `04a_review_implementation.md` explicitly walk every DoD
  item instead of relying on the reviewer to remember them.
