# Slice 2 — Scaffold & shell

**Goal.** A Next.js app at the repo root that looks like Finanzuhu, with no
data in it yet.

## Steps

1. `create-next-app` into the root (TypeScript, App Router, Tailwind v4,
   no `src/app` surprises — keep the existing `sdlc/`, `docs/`, `data/`,
   `assets/` untouched, merge `.gitignore`).
2. `shadcn init`, then add only what slice 2–5 need:
   `button card tabs table input select badge skeleton dropdown-menu`.
3. Design tokens in `src/app/globals.css`:
   - dark-first ink/slate neutrals, warm amber accent (`--owl`),
     teal `--income`, coral `--expense`, both themes defined.
   - Inter via `next/font`, `font-variant-numeric: tabular-nums` on all numbers.
4. Shell in `src/app/layout.tsx` + `src/components/layout/`:
   sidebar (Overview · Transactions), slim header with account name and theme
   toggle, content container.
5. `src/lib/format.ts` — `formatEUR(n)` and `formatDate(iso)` with `de-DE`,
   used everywhere from here on.

## Verification

```bash
npm run dev     # http://localhost:3000
```

**Done when:** the shell renders in both themes, the sidebar navigates between
`/` and `/transactions` (both still empty pages), nothing is misaligned at
380px width.

## Not in this slice
No charts, no data loading, no providers beyond the theme.
