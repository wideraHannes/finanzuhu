# Repo Rebuild Plan: Finanzuhu-Starter

> **Für den ausführenden Agenten:** Alle Entscheidungen sind getroffen. Arbeite
> die Schritte der Reihe nach ab. Bei **⏸** stoppst du, zeigst, was passieren
> wird, und wartest auf ein ausdrückliches OK.
> Ab Schritt 2 liest du diese Datei mit
> `git show ai-enablement-1:REPO_REBUILD_PLAN.md`.

## Ziel

- **`ai-enablement-1`** = heutiger `main` + dieser Plan (Archiv des ersten
  Workshops).
- **`main`** = **ein einziger Commit** mit der App im Grundzustand (nur
  Overview und Transactions), `sdlc/`, den vier Skills in `.opencode/skills/`,
  zwei Demo-Tickets und einer klaren README.
- Alle anderen Branches werden gelöscht.

## Ausgangslage

- `main` = `origin/main` = `002fcac`.
- Baseline der App: `90d4078` (letzter Commit vor dem ersten Feature).
- `.env`, `node_modules/`, `.next/` sind ignoriert: nicht anfassen, nicht
  committen.

---

## Schritt 1: Archiv-Branch `ai-enablement-1`

```bash
git fetch origin
git rev-parse main origin/main            # beide 002fcac, sonst stoppen
git switch -c ai-enablement-1 main
git add REPO_REBUILD_PLAN.md
git commit -m "docs: add repo rebuild plan"
```

⏸ Dann: `git push -u origin ai-enablement-1`

## Schritt 2: Neuen `main`-Inhalt ohne Historie bauen

`git checkout --orphan` übernimmt den Dateistand von `main`, aber keine
Historie. Alles Folgende passiert auf diesem Branch und wird am Ende **einmal**
committet.

```bash
git checkout --orphan new-main main
```

### 2.1 App auf die Baseline zurücksetzen und Altlasten löschen

```bash
git rm -r -q src tests data plans sdlc/harness-improvement-ideas sdlc/backlog
git checkout 90d4078 -- src tests data package.json package-lock.json vitest.config.mts
```

### 2.2 Skills nach `.opencode/skills/`

```bash
mkdir -p .opencode
git mv .github/skills .opencode/skills
git rm -r -q .github
```

In `.opencode/skills/README.md`:
- Die Tabelle bleibt.
- Ergänzen: „In OpenCode per `/<skill-name> ST-XXX`, oder einfach auf den
  Skill verweisen.“
- Die Bullets zu `disable-model-invocation` und `context: fork` als optionale
  Felder beschreiben, die nicht jedes Tool auswertet.

Die vier `SKILL.md` bleiben unverändert.

### 2.3 Backlog mit zwei Demo-Tickets

Je eine leere `.gitkeep` anlegen in:
`sdlc/backlog/{unrefined,refined,plans,reviews}/done/` und
`sdlc/backlog/{refined,plans,reviews}/`.

`sdlc/backlog/unrefined/ST-001.md`:

```markdown
# ST-001: Budget planner for categories

**Status:** unrefined

## Idea

As a user I want to set a monthly budget per category so that I can see whether
I am still within my plan.
```

`sdlc/backlog/unrefined/ST-002.md`:

```markdown
# ST-002: Add and edit transactions

**Status:** unrefined

## Idea

As a user I want to add new transactions and edit existing ones so that my
transaction list stays up to date.
```

### 2.4 `AGENTS.md`

Nur den Einleitungsabschnitt (bis vor „## Backlog progression“) ersetzen, der
Rest bleibt:

```markdown
# AGENTS.md

Starter repo for practising an AI-assisted SDLC: the process lives in `sdlc/`,
the app it is practised on is **Finanzuhu** in `src/` (Next.js 15, Tailwind v4,
TanStack Query, Vitest). One skill per SDLC step lives in `.opencode/skills/`.

- `npm run dev` · `npm test`
```

### 2.5 `CONCEPT.md`

In „Getting started“, Punkt 1: Statt „`architecture.md` and `code_style.md`
ship empty on purpose“ steht neu: `code_style.md` ist bewusst leer,
`architecture.md` hat eine kurze Startversion; beide werden mit der AI anhand
des Codes geschärft, bevor der erste Plan entsteht. Sonst nichts ändern.

### 2.6 `README.md` (Englisch, bestehende Texte wiederverwenden)

- **Header:** bleibt, plus ein Satz: „Clean starter — fork it, or branch off
  `main` for a workshop.“
- **What this repository is:** `.github/` → `.opencode/`.
- **Quickstart (neu):** `npm install`, `npm run dev`, `npm test`; dann in
  OpenCode `/refine-ticket ST-001`.
- **How to use this repo (neu):** Workshop → Branch `ai-enablement-<n>` von
  `main`. Alleine → forken. `ai-enablement-1` zeigt den Endstand des ersten
  Workshops.
- **Using another tool (neu):** Claude Code → `.opencode/` in `.claude/`
  umbenennen; Copilot → in `.github/` umbenennen. `AGENTS.md` lesen alle drei.
- **Guides & Sensors:** Skills-Link → `.opencode/skills/README.md`;
  „(empty, to be derived)“ hinter `architecture.md` streichen; den Absatz zu
  `harness-improvement-ideas` / `.github/` ersetzen durch „The empty cell is
  yours to fill during the workshop.“
- **Intended use:** Satz „`architecture.md` is deliberately shipped empty“ an
  2.5 angleichen.
- **The demo project: Finanzuhu:** Text aus `90d4078` übernehmen
  (`git show 90d4078:README.md`): „Two screens“, ohne Spending, Assistant und
  `.env`.
- Alle Links auf gelöschte Ordner entfernen.

### 2.7 Prüfen und committen

```bash
rm -rf .next && npm ci && npm test && npm run lint && npm run build
git grep -niE "spending|openai|harness-improvement|plans/003|\.github/skills"
```

- Tests: 1 Datei, 2 Tests grün.
- Build-Routen: `/`, `/transactions`, `/api/summary`, `/api/transactions`
  (plus Icons, not-found).
- `git grep`: keine Treffer.

```bash
git add -A
git commit -m "Finanzuhu starter"
git log --oneline                         # genau 1 Commit
```

⏸ Ergebnis zeigen (`git show --stat HEAD`).

## Schritt 3: `main` ersetzen und aufräumen

Vorher den User fragen: Ist auf GitHub Branch Protection für `main` aus und
gibt es keine offenen PRs?

⏸ Dann:

```bash
git push --force-with-lease=main:002fcac origin new-main:main
git push origin --delete session_1 session_2 session_3 session_4 \
  session-4-visuals base_setup update_prompts add-skills

git switch main && git reset --hard origin/main
git branch -D new-main session_1 session_2 session_3 session_4 \
  session-4-visuals base_setup update_prompts add-skills
git fetch --prune
```

**Check:** `git log --oneline origin/main` zeigt genau einen Commit,
`git branch -r` zeigt nur `origin/main` und `origin/ai-enablement-1`.

**Notfall:** `git push --force origin 002fcac:main` stellt den alten `main`
wieder her (`002fcac` steckt in `ai-enablement-1`).

## Danach: neuer Workshop

```bash
git switch main && git pull
git switch -c ai-enablement-2 && git push -u origin ai-enablement-2
```
