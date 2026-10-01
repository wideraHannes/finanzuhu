# Scoped instructions

Empty for now. Once [`code_style.md`](../../sdlc/standards/code_style.md)
is filled in from the running code, split out anything file- or
folder-specific here as an `*.instructions.md` file with an `applyTo` glob:

```markdown
---
applyTo: "src/**/*.ts"
---

Prefer ...
```

Keep [`AGENTS.md`](../../AGENTS.md) for what applies everywhere; move
anything narrower here instead of growing that file.
