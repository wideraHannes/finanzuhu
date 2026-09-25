<div align="center">

<a href="https://www.codecentric.de/">
  <img src="assets/codecentric_PrimLogo_farbe_rgb.png" alt="codecentric" width="260">
</a>

# SDLC with AI Support

**A project template for walking through the complete Software Development
Lifecycle** — from the raw backlog entry to the updated documentation.

<img src="assets/SDLC_loop.png" alt="The DevOps loop with the AI touchpoints per phase" width="620">

</div>

---

## What this is about

AI does not only help with writing code, but at every station of the loop.
This template covers the section from **Plan to Release** and makes it
walkable: each step produces a Markdown file that the next one reads as input.

```
unrefined  →  refined  →  plan  →  implementation  →  review  →  docs
              ↑ DoR                      ↑ tests       ↑ DoD       ↺
```

These files steer the AI and make its work repeatable, reviewable and
shareable across the team. A ticket travels visibly through the folders
instead of disappearing into a tool.

## Getting started

| I want to… | |
| --- | --- |
| start a run | [Instructions in the concept](CONCEPT.md#getting-started) |
| understand how we work here | [`CONCEPT.md`](CONCEPT.md) |
| get the prompt for a step | [`sdlc/standards/prompts/`](sdlc/standards/prompts/README.md) |
| refresh the SDLC material | [`prerequisites/`](prerequisites/README.md) |

## Layout

```
sdlc/            process artifacts — stories, plans, reviews, standards, prompts
docs/            architecture documentation, diagrams, decisions
tests/           test code and test data
prerequisites/   background material for reading up
```

Every folder explains itself in its own `README.md`. The details on the
process flow are in [`sdlc/README.md`](sdlc/README.md).

## Status

This repository is a **template**: the process is in place, the project is
missing. Domain, tech stack and application code come with each run.

---

<div align="center">
  <sub>Created in the workshop <em>AI-Assisted Coding</em> ·
  <a href="https://www.codecentric.de/">codecentric AG</a></sub>
</div>
