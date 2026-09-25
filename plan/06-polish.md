# Slice 6 — Polish & handover

**Goal.** The repository a workshop participant clones on day one.

## Steps

1. **States** — every card has loading and error handling; the error case is one
   sentence plus a retry button, not a stack trace.
2. **Responsive** — both pages down to 380px: sidebar collapses to a top bar,
   chart keeps its aspect ratio, tiles stack.
3. **Themes** — check both; no hardcoded colour outside the token file.
4. **A11y basics** — focus rings visible, the range tabs reachable by keyboard,
   amounts not colour-only (the sign carries the meaning too).
5. **README** — a short “Run the dummy app” section in the repo README:
   `npm install`, `npm run dev`, `npm test`, plus where the data lives and what
   the two features are. Three paragraphs, no architecture essay.
6. **Final pass for weight** — delete unused shadcn components, unused
   dependencies, and any helper with exactly one caller that reads worse than
   inlining it.

## Verification

```bash
rm -rf node_modules && npm install && npm run build && npm test && npm run dev
```

**Done when:** a clean clone runs both screens and the two tests, and nothing in
`src/` needs a comment to explain why it exists.

## Handover

The workshop starts here. `sdlc/standards/architecture.md` and `code_style.md`
stay empty — they are derived from this running code in the first session, as
`CONCEPT.md` prescribes.
