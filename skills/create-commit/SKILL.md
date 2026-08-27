---
name: create-commit
description: >-
  Create one or more conventional commits from the working tree. Use when the
  user asks to commit changes, create a git commit, or mentions "/create-commit"
  or "/commit". Default: split unrelated work into multiple logical commits —
  never pack everything into one bloated commit. Groups changes by agent session
  history when available, otherwise by diff semantics. Supports per-hunk staging
  with git add -p for mixed files.
license: MIT
allowed-tools: Bash
---

# Git Commit with Conventional Commits

## Overview

Create standardized, semantic git commits using the Conventional Commits specification. **Default to multiple commits** — one logical change per commit. Only create a single commit when all changes clearly belong together or the user explicitly asks for one commit.

## Conventional Commit Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

## Commit Types

| Type       | Purpose                        |
| ---------- | ------------------------------ |
| `feat`     | New feature                    |
| `fix`      | Bug fix                        |
| `docs`     | Documentation only             |
| `style`    | Formatting/style (no logic)    |
| `refactor` | Code refactor (no feature/fix) |
| `perf`     | Performance improvement        |
| `test`     | Add/update tests               |
| `build`    | Build system/dependencies      |
| `ci`       | CI/config changes              |
| `chore`    | Maintenance/misc               |
| `revert`   | Revert commit                  |

## Hard Rules

- **Never `git add .` or `git add -A`** — stage only the files or hunks planned for the current commit
- **Never commit secrets** (.env, credentials.json, private keys)
- **Never pack unrelated changes** into one commit to save time
- **Propose a commit plan before executing** when there is more than one logical group
- If a file has hunks from different groups, use **`git add -p`** (or `git add -N` then `git add -p`) — do not commit the whole file

## Workflow

### 1. Inventory changes

```bash
git status --porcelain
git diff          # unstaged
git diff --staged # already staged
git log -5 --oneline  # match repo style
```

Collect every changed, added, or deleted path relative to the repo root.

### 2. Discover logical groups

Use **both** signals below. Agent history is the primary source when available.

#### A. Agent session history (preferred)

When the user worked across multiple agent chats or sessions, each session usually maps to one commit.

**Cursor** transcripts live under:

```
~/.cursor/projects/<workspace-slug>/agent-transcripts/<session-id>/<session-id>.jsonl
```

`<workspace-slug>` is the workspace path with `/` replaced by `-` (leading slash dropped). Example: `/home/user/my-app` → `home-user-my-app`.

For each `.jsonl` file (newest sessions first):

1. Read the first `user_query` — that is the session intent
2. Scan all lines for edit tools: `Write`, `StrReplace`, `EditNotebook`, `Delete`
3. Collect `path` (or `target_notebook`) from each tool call
4. Normalize paths to repo-relative (strip workspace prefix)
5. Keep only paths that appear in the current git inventory

Build a map: **session → { intent, files[] }**

**Rules:**

- One session with a clear intent → one commit candidate
- Same file touched in multiple sessions → assign to the **most recent** session that edited it, or split hunks with `git add -p` if the diff shows unrelated edits
- Session with no files in the current diff → ignore
- Files in the diff but not in any transcript → group by fallback (below)

Also use **current and recent chat history** in this conversation: if the user describes parallel work ("here I removed comments, here I added an index"), treat each described task as its own group even when transcripts are missing.

#### B. Diff semantics (fallback)

When agent history is unavailable or leaves files unassigned, group by:

| Signal | Group as |
| --- | --- |
| `*.prisma` migrations / schema | `feat` or `fix` with schema scope — often first in commit order |
| `**/migrations/**` | Own commit, before app code that depends on it |
| `**/*.{test,spec}.*` | `test` |
| `**/*.md`, docs folders | `docs` |
| `.github/**`, CI configs | `ci` |
| `package.json`, lockfiles, build configs | `build` |
| Comment-only or whitespace-only hunks | `style` or `chore` |
| Same directory + same concern | Single commit (e.g. all changes under `bin/`) |
| Same file, mixed concerns | Split with `git add -p` |

Merge session-based groups and fallback groups. **Do not over-split** — if two sessions both edited the same feature and the diffs are tightly coupled, one commit is fine.

### 3. Propose the commit plan

Before committing, present a numbered plan:

```
Commit 1: feat(cli): add clear installed skills option
  Files: bin/cli.js, README.md
  Source: agent session "add option to clear skills…"

Commit 2: refactor(grill-me): tighten invocation rules
  Files: skills/grill-me/SKILL.md
  Source: agent session "review validations and migrate to zod…"

Commit 3: chore(schema): add index on user email
  Files: prisma/schema.prisma
  Source: diff semantics (unmapped)
```

Ask for approval when grouping is ambiguous or when there are 3+ commits. Proceed without asking when groups are obvious and the user said "commit" plainly.

**Commit order:** schema/migrations → core logic → tests → docs/style/chore. Dependencies first.

### 4. Execute commits (one group at a time)

For each approved group, in order:

```bash
# Reset staging so each commit starts clean
git reset HEAD

# Stage only this group's files
git add path/to/file1 path/to/file2

# Mixed file? Stage selected hunks only
git add -p path/to/mixed-file.js

# Verify the staged diff matches the plan — nothing extra
git diff --staged

# Commit
git commit -m "$(cat <<'EOF'
<type>[scope]: <description>

<optional body>
EOF
)"
```

If a pre-commit hook fails, fix the issue and create a **new** commit for that group — do not amend unless the user explicitly requested amend and the prior commit was yours and unpushed.

After all groups:

```bash
git status
git log -n <number-of-commits> --oneline
```

Report what was committed and anything still unstaged.

### 5. Single-commit exception

Create only **one** commit when:

- The user explicitly asks for a single commit
- All changes serve one intent (one session, one feature, one fix)
- Only trivial follow-ups remain (e.g. lint fix on files you just committed)

## Message guidelines

- Present tense, imperative: "add index" not "added index"
- Description under 72 characters
- Reference issues when known: `Closes #123`, `Refs #456`
- Derive type/scope from the group's diff and session intent, not from the full working tree

## Git Safety Protocol

- NEVER update git config
- NEVER run destructive commands (--force, hard reset) without explicit request
- NEVER skip hooks (--no-verify) unless user asks
- NEVER force push to main/master
- NEVER use interactive git commands that need TTY (`git add -i`, `git rebase -i`) — use `git add -p` non-interactively by answering hunks in the command, or stage whole files when hunks are uniform
- If commit fails due to hooks, fix and create NEW commit (don't amend)
