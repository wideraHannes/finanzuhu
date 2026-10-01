# Concept

## Purpose

A starter project for bringing AI into software development. Use it however you
like: try out an AI-assisted SDLC, experiment with harness features (skills,
subagents, hooks, custom instructions, MCP servers, checks), or just build
something on Finanzuhu.

It ships a small running app and a few defaults to get going. Keep them, change
them or throw them away.

## The default flow

One way of working is already set up: every SDLC step leaves a Markdown file
that the next step reads as input, so the AI's work stays visible and
reviewable. It is described in [`sdlc/README.md`](sdlc/README.md).

It is a starting point, not a rule. Work ticket-free, merge steps, add new ones
or replace the flow entirely.

## The harness

The harness is everything around the model that steers or checks its work.
**Guides** steer before the AI acts, **sensors** check afterwards. Both are
either **computational** (deterministic) or **inferential** (run through an
LLM).

|                   | Guides                                                    | Sensors                    |
| ----------------- | --------------------------------------------------------- | -------------------------- |
| **Computational** | _none yet_                                                | `npm run lint`, `npm test` |
| **Inferential**   | skills, prompts, `AGENTS.md`, DoR, DoD, `architecture.md` | `/review-implementation`   |

The harness is deliberately thin, so there is room to grow it. Some ideas:

- turn a repeated prompt into a **skill**
- move a long or noisy step into a **subagent**
- enforce a rule with a **hook** instead of an instruction
- add a deterministic **check** for a recurring review finding

More on the idea:
[Harness engineering on martinfowler.com](https://martinfowler.com/articles/harness-engineering.html)

## Background

The default flow is based on the
[SDLC refresher](sdlc/prerequisites/sdlc_refresher.md)
([slides](sdlc/prerequisites/ai_assisted_coding_slides.pdf)) from the
_AI-Assisted Coding_ workshop by [codecentric AG](https://www.codecentric.de/).
