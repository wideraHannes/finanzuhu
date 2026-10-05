---
name: refine-ticket
description: Refine a raw ticket from sdlc/backlog/unrefined/ into an implementation-ready story. Use when the user wants to refine a story (ST-XXX).
argument-hint: ST-XXX
---

# Refine a ticket

**Input:** `sdlc/backlog/unrefined/ST-XXX.md`
**Output:** `sdlc/backlog/refined/ST-XXX.md`

## The refined story contains

- **Story sentence:** "As a [role], I want to [action], so that [benefit]."
- **Acceptance criteria** — concrete and testable
- **Not part of this story** — explicit out-of-scope items
- **Business context** — as far as needed to understand the story
- **Dependencies** — on other stories or systems
- **Open questions** — every gap that is still unanswered

## Rules

- Keep the story intent intact.
- Keep it small enough for one iteration.
- Do **not** invent requirements or make product decisions — ask focused questions instead.
- Do **not** modify the unrefined ticket.
