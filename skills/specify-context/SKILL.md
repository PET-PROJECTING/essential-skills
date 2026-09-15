---
name: specify-context
description: >-
  Bootstrap spec-driven project context: confirm a docs folder, copy six
  context templates plus a build planner, merge an AGENTS.md/CLAUDE.md read
  block, then grill and fill one unfilled file per invocation. Use when the
  user wants project context docs, a six-file context system, AGENTS.md
  application context, /specify-context, or to set up docs before feature
  specs. Companion of create-feature-spec (install together).
---

# Specify Context

Set up living project context so coding agents stop guessing. **Do not implement application code.** **Do not fill more than one context file per invocation.**

This skill is bundled with `/create-feature-spec`. After the build planner is filled, point the user there.

## Grill protocol

Search the project and home skill dirs for `grill-me/SKILL.md` (`.cursor/skills`, `.claude/skills`, `.agents/skills`, `.windsurf/skills`, and the matching global folders). If found, **read it and follow those rules in this conversation** — do not spawn a subagent.

**Number every question** in each round: `❓ **Q1** - **<title>**: <body>`, then Q2, Q3, … Restart numbering at Q1 each round.

If it is missing, use this format:

- Design tree in **rounds**. Ask the whole frontier each round; wait for answers.
- Number every question **Q1**, **Q2**, … as above. Never omit the number.
- Every question needs **2–4 options labeled A) / B) / C)** (letter on its own line, option text on the next). Mark **exactly one** recommended. After the list, explain why.
- Finding facts is your job (repo, package.json, existing docs). Do not ask what you can look up.
- Do not write the context file until that file's frontier is empty. Then write it. Do not start the next file.

## File order

A file is **unfilled** if it contains the HTML comment `<!-- specify-context: unfilled -->`. Remove that comment when you write real content.

1. `project-overview.md`
2. `architecture.md`
3. `ui-context.md`
4. `code-standards.md`
5. `ai-workflow-rules.md`
6. `progress-tracker.md`
7. `{{SPECS_DIR}}/build-planner.md`

Templates live in this skill's `templates/` folder (next to this `SKILL.md`).

## Phase 1 — Resolve folders (first run only)

Skip this phase if an `## Application Building Context` section already exists in `AGENTS.md` or `CLAUDE.md` and the listed context files are on disk.

Otherwise grill these two questions (same round):

❓ **Q1** - **Context root**: Where should the six context files live? Never recommend `context/` (collides with React context).

A)
`docs/` (recommended)

B)
`handbook/`

C)
Another name the user types (not `context/`, not `src/`)

❓ **Q2** - **Feature-spec folder**: Nested directory under that root for unit specs. Never recommend `features/` (collides with Feature-Sliced Design).

A)
`feature-specs/` (recommended)

B)
`specs/`

C)
Another name the user types (not `features/`)

Then:

1. Create `{{CONTEXT_ROOT}}/` and `{{CONTEXT_ROOT}}/{{SPECS_DIR}}/`.
2. Copy **only** these templates into `{{CONTEXT_ROOT}}/`, and **only if the destination is missing**: `project-overview.md`, `architecture.md`, `ui-context.md`, `code-standards.md`, `ai-workflow-rules.md`, `progress-tracker.md`. Never overwrite a file that is already filled (no unfilled marker).
3. Copy `templates/build-planner.md` to `{{CONTEXT_ROOT}}/{{SPECS_DIR}}/build-planner.md` if missing.
4. Do **not** copy `entry-section.md` into the project; it is only merged into `AGENTS.md` / `CLAUDE.md`.
5. Merge the entry section (Phase 2).
6. Continue to Phase 3.

If some files already exist from a previous run, do not recopy them; go to Phase 3.

## Phase 2 — Merge AGENTS.md / CLAUDE.md

Read `templates/entry-section.md`. Replace `{{CONTEXT_ROOT}}` and `{{SPECS_DIR}}` with the chosen names (no trailing slashes in the placeholders).

Write **`AGENTS.md`** at the project root:

- If the file is missing, create it with that section.
- If it exists and already has a heading `## Application Building Context`, replace **that section only** (from the heading through the next `## ` heading or EOF). Leave the rest of the file alone.
- If it exists with no such heading, **append** the section.

Also write or merge **`CLAUDE.md`** the same way **only when** `.claude/` exists in the project root.

## Phase 3 — One file

If every file in **File order** is filled, go to Phase 4.

Otherwise pick the **first unfilled file** in that order. Read the template (or the unfilled copy on disk). Explore the repo for facts that belong in this file. Grill until the frontier for **this file only** is empty.

Cover the template's sections. For `ui-context.md`, if the project has no product UI, still fill the file: one short "no product UI" paragraph and mark tables not applicable — do not skip the file.

Then write the file: real content, no unfilled marker, no leftover `[placeholder]` instructions.

Tell the user the next unfilled file (or that bootstrap is done) and to run `/specify-context` again to continue. **Stop. Do not grill the next file in this invocation.**

### Per-file focus

| File | Grill toward |
| --- | --- |
| `project-overview.md` | One-sentence product, users, core flow, in/out of scope, verifiable success |
| `architecture.md` | Stack + why, folder boundaries, storage, auth, at least four invariants |
| `ui-context.md` | Theme, tokens, type, radius, component library, layout, icons — or explicit no-UI |
| `code-standards.md` | Language/framework conventions, styling, API, storage, file layout |
| `ai-workflow-rules.md` | Imperative agent rules: scope, split, missing requirements, protected files, verify |
| `progress-tracker.md` | Current phase/goal; seed Next Up from what you already know; leave Completed empty unless work already shipped |
| `build-planner.md` | Overall schema: ordered units, one visible result each, dependencies, security before features, backend before UI wiring. Spec column stays `missing` until `/create-feature-spec` |

## Phase 4 — All filled

Ask which file to **revise** (including the build planner), or offer to stop and run `/create-feature-spec`.

❓ **Q1** - **Next step**: Which file should we revise, or are we done with context?

A)
Revise a named context file (grill + rewrite that file only)

B)
Nothing — go write a feature spec with `/create-feature-spec` (recommended)

C)
Revise `build-planner.md`

If they revise, grill that file only, rewrite it, stop.

## Routing

| After this skill | When |
| --- | --- |
| `/specify-context` again | Next unfilled context file or a revision |
| `/create-feature-spec` | Build plan exists (filled or not) and they want a unit spec |
| `/grill-me` | They want to implement application code next |
