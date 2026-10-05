---
name: github-cli
description: "Use when working with GitHub through the GitHub CLI (`gh`): inspect or fetch issues, create or update issues, inspect pull requests, create pull-request comments, or merge pull requests."
argument-hint: "Describe the GitHub task"
---

# GitHub CLI (`gh`)

Use the installed GitHub CLI to work with the GitHub repository associated with
this workspace. Prefer standard `gh` commands over raw REST API calls.

## Safety and authentication

1. Work from the repository root and first confirm the target repository:
   ```sh
   gh repo view
   ```
2. If authentication is needed, tell the user to authenticate interactively with
   `gh auth login`. Never request, display, copy, or persist access tokens, and
   never run `gh auth token`.
3. Treat `gh api` as a fallback only when no dedicated `gh` command exists.
4. Do not alter remotes, authentication, repository settings, branch protection,
   secrets, or permissions unless the user explicitly requests it.

## Default workflow

- Read current GitHub state before proposing a change.
- State the repository and issue/PR number that will be affected.
- For mutations, show the exact planned title, body, labels, assignee, state, or
  merge method before executing the command.
- Apply mutations only after the user has explicitly asked for the change. If the
  user request already supplies exact values (for example, “close issue #42”),
  it counts as confirmation.
- Report the resulting URL and final state.

## Fetch and inspect issues

Use focused, read-only queries. Avoid broad output unless requested.

```sh
# List open issues assigned to the authenticated user.
gh issue list --assignee @me --state open

# Filter issues by labels, state, or a search query.
gh issue list --label bug --state open --search "sort:updated-desc"

# Read an issue, including comments.
gh issue view 123 --comments

# Search issues across GitHub when the repository is known.
gh search issues "repo:OWNER/REPO is:issue authentication"
```

Summarize issue number, title, status, relevant labels, assignee, and the parts
of the discussion that affect the requested work. Do not expose unrelated issue
content or private data in summaries.

## Create or update issues

Use explicit values; do not silently infer labels, people, milestones, or an
issue state.

```sh
# Create an issue only with a reviewed title and body.
gh issue create --title "..." --body "..." --label "..."

# Edit a precise set of issue fields.
gh issue edit 123 --title "..." --body "..." --add-label "..." --add-assignee "..."

# Manage state only when requested.
gh issue close 123 --comment "..."
gh issue reopen 123

# Add a comment after presenting its exact text.
gh issue comment 123 --body "..."
```

- Preserve existing issue text unless the user requests replacement.
- Use additive flags such as `--add-label` and `--add-assignee` unless replacing
  values is explicitly intended.
- Before closing an issue, confirm that the requested work is actually complete.

## Inspect and merge pull requests

In GitHub CLI, “merge requests” are **pull requests**.

```sh
# See PRs relevant to the current branch and the authenticated user.
gh pr status

# Inspect a PR, including review and check status.
gh pr view 123 --comments

gh pr checks 123

# Inspect the changed files and patch.
gh pr diff 123
```

Before merging, verify:

- The intended PR number, repository, base branch, and author.
- Required checks are successful (or the user explicitly accepts a known failure).
- Review state and unresolved feedback are understood.
- The appropriate merge method is known: `--merge`, `--squash`, or `--rebase`.

Only merge when the user explicitly says to merge the named PR. Use a clear,
non-interactive command and avoid automatic branch deletion unless asked:

```sh
gh pr merge 123 --squash --subject "..." --body "..."
```

If GitHub queues the PR for merge, report that it was queued rather than claiming
it has already merged. After a merge attempt, inspect the PR again and report
its actual state.

## Error handling

- Do not retry a mutation blindly: first inspect whether it may already have
  succeeded.
- If the CLI reports missing permissions, authentication, merge conflicts, or
  failed checks, explain the blocker and offer the least-privileged next step.
- Never bypass branch protections, required checks, or approvals without an
  explicit user instruction and a clear statement of the consequence.
