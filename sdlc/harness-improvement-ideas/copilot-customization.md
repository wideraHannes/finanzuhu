# Copilot customization — making the harness more robust

Small, concrete additions based on the VS Code
[agent customization docs](https://code.visualstudio.com/docs/agent-customization/overview),
sorted into the Guides & Sensors grid from the main
[README](../../README.md#guides--sensors). Pick one, build it, then move it
into the README table and delete it here.

Already built: the four SDLC skills in [`.github/skills/`](../../.github/skills/README.md)
(`/refine-ticket`, `/plan-ticket`, `/implement-ticket`, `/review-implementation`).

|                   | Guides (steer)                                                  | Sensors (check)                                                            |
| ----------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------- |
| **Computational** | SessionStart hook (open tickets) · `new-ticket` script          | Stop hook (lint + test) · PostToolUse eslint · protect hook · `typecheck` · backlog check |
| **Inferential**   | scoped `*.instructions.md` · Planner agent                      | Reviewer agent · `close-ticket` DoD skill                                  |

---

## 1. Stop hook — quality gate (Sensor · Computational)

The most valuable one: before the agent may say "done", lint and tests must be
green. Otherwise it is sent back with the failing output. Runs every time, no
matter what the model decides.

```json
// .github/hooks/harness.json
{
  "hooks": {
    "Stop": [{ "type": "command", "command": "node scripts/hooks/quality-gate.mjs", "timeout": 120 }]
  }
}
```

```js
// scripts/hooks/quality-gate.mjs
import { execSync } from 'node:child_process';

const event = JSON.parse(await new Response(process.stdin).text());
if (event.stop_hook_active) process.exit(0); // already sent back once — don't loop

try {
  execSync('npm run lint --silent && npm test --silent', { stdio: 'pipe' });
} catch (error) {
  console.log(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'Stop',
      decision: 'block',
      reason: `Lint or tests fail — fix before finishing:\n${String(error.stdout).slice(-2000)}`,
    },
  }));
}
```

Optionally skip when `git status --porcelain` shows no changes under `src/` or
`tests/`, so Q&A sessions stay fast.

## 2. `close-ticket` skill — DoD gate (Sensor · Inferential)

The move to `done/` is the only "ticket closed" signal, and today it relies on
someone remembering to check the DoD first. A skill makes it a fixed procedure:

```markdown
---
name: close-ticket
description: Check a ticket against the Definition of Done and, only if every item passes, move all its files into the done/ subfolders.
argument-hint: ST-XXX
disable-model-invocation: true
---

1. Find every file of the ticket in `sdlc/backlog/*/`.
2. Walk every DoD item and output a table: item · pass/fail · evidence.
3. Run `npm run lint` and `npm test` yourself.
4. Any fail → stop and list what's missing.
   All pass → `git mv` each file into the `done/` subfolder of its stage folder.
```

## 3. SessionStart hook — open tickets (Guide · Computational)

Fills the empty cell in the grid. List every ticket file not in a `done/`
folder and return it as `hookSpecificOutput.additionalContext`:

```
Open tickets: ST-003 (unrefined), ST-004 (plans/ST-004_plan.md)
```

The agent knows where the process stands without anyone explaining it.

## 4. Scoped instructions (Guide · Inferential)

Only loaded when matching files are touched — cheap on context:

```markdown
<!-- .github/instructions/tests.instructions.md -->
---
applyTo: "tests/**"
---
- Vitest, one file per module: tests/unit/<module>.test.ts.
- Test the pure functions in src/lib/, not components.
- Show each new test failing once before calling it done.
```

```markdown
<!-- .github/instructions/api.instructions.md -->
---
applyTo: "src/app/api/**"
---
- Validate query params; return 400 with a message on bad input.
- Calculations belong in src/lib/ as pure functions; the route only wires them.
```

## 5. Planner / Reviewer agents (Guide + Sensor · Inferential)

Worth it only because they **restrict tools**, which a skill can't, and give
visible handoff buttons: Planner → _Implement plan_ → Reviewer → _Address findings_.

```markdown
<!-- .github/agents/reviewer.agent.md -->
---
description: Reviews an implementation in a fresh context. Never edits code.
tools: ['search', 'read', 'execute', 'edit']
handoffs:
  - label: Address findings
    agent: agent
    prompt: Address the findings in the review report above.
---
You are a reviewer, not an implementer. Never change files under src/ or tests/.
Write only the review report to sdlc/backlog/reviews/.
```

Check the exact tool names in the tools picker — they differ between VS Code versions.

## 6. More hooks (Computational)

Same `.github/hooks/harness.json`. The VS Code local harness **ignores
`matcher`**, so each script filters on `tool_name` / `tool_input` itself.

- **PostToolUse → eslint on the edited file** — run `npx eslint <file>` for
  edited `.ts/.tsx` files, return problems as `additionalContext`. _(Sensor)_
- **PreToolUse → protect** — `permissionDecision: "ask"` for edits to
  `data/**`, `.env*`, `package-lock.json` and anything in a `done/` folder.
  "ask", not "deny": a story may need it, but a human should see it. _(Sensor)_

## 7. Small scripts (Computational)

- **`"typecheck": "tsc --noEmit"`** — neither lint nor tests type-check today. _(Sensor)_
- **`"check": "npm run lint && npm run typecheck && npm test"`** — one command
  for humans, hooks and skills. _(Sensor)_
- **`scripts/check-backlog.mjs`** — file names follow the convention, no
  ticket is half in `done/` and half not. _(Sensor)_
- **`scripts/new-ticket.mjs`** — creates the next free `ST-XXX.md` in
  `unrefined/`, so IDs never collide. _(Guide)_
- **Git pre-commit** (`.githooks/pre-commit` + `git config core.hooksPath .githooks`)
  running `npm run check`. _(Sensor)_

---

## Suggested order

| # | What                                   | Effort | Why                                          |
| - | -------------------------------------- | ------ | -------------------------------------------- |
| 1 | Stop hook + `check` script (§1, §7)    | 20 min | "Done" can't be green-washed                 |
| 2 | `close-ticket` skill (§2)              | 15 min | Turns the DoD into an enforced gate          |
| 3 | SessionStart hook (§3)                 | 15 min | First computational Guide                    |
| 4 | Scoped instructions (§4)               | 15 min | Cheap, targeted context                      |
| 5 | Planner / Reviewer agents (§5)         | 20 min | Tool restriction + visible handoffs          |
| 6 | PostToolUse / PreToolUse hooks (§6)    | 20 min | Nice to have once the gate is in place       |

## Caveats

- Hook payloads and event names differ between Copilot, VS Code and Claude
  Code — test each hook in the harness the workshop actually uses.
- Prompt files (`*.prompt.md`) are deprecated for Agent Host sessions — use
  skills instead.
- A Stop hook running the full suite costs time on every turn. Vitest is fast
  here today; revisit if that changes.
