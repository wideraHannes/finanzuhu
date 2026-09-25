# docs

The documentation of the system — what someone reads who wants to understand it,
not what an agent needs in every session.

This is where the following belongs:

- **Arc42 documentation** — context, building blocks, runtime view, deployment,
  decisions
- **Diagrams** as Mermaid or PlantUML, so they stay versioned and readable in the
  diff
- **Architecture decisions** (ADRs) — what was decided when and why
- **Test strategy** — what is tested at which level

Short and binding, by contrast, is `sdlc/standards/architecture.md`: the file the
agent reads on every implementation.

The standard prompt for this step:
[`../sdlc/standards/prompts/04_documentation.md`](../sdlc/standards/prompts/04_documentation.md)
