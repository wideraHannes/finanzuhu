# Scoped instructions

Empty for now. Once `code_style.md` (see
[`sdlc/standards/`](../../sdlc/standards/)) is filled in from the running
code, split out anything file- or folder-specific here as an
`*.instructions.md` file with an `applyTo` glob:

```markdown
---
applyTo: "src/**/*.ts"
---

Prefer ...
```

Keep [`copilot-instructions.md`](../copilot-instructions.md) for what applies
everywhere; move anything narrower here instead of growing that file.
