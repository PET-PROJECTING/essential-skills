---
name: specify-context
description: >-
  Bootstrap a project's AI context using the Six-File Context System from
  JavaScript Mastery AI builders playbook. Use when the user wants to set up
  project context for AI-driven development, initialize the context/ folder,
  or invokes /specify-context. Creates the six core context files, ensures
  context/features/ exists, handles root AGENTS.md, then grills to fill each
  context file.
---

Bootstrap a project's AI context by setting up the **Six-File Context System**. This skill copies blank markdown templates into `context/`, ensures `context/features/` exists, handles the root `AGENTS.md` entry point, then grills the user to fill each context file.

## When to invoke

Use this skill when:

- The user wants to set up project context for AI-driven development
- The user mentions the Six-File Context System or /specify-context
- Starting a new project and need to establish AI context conventions
- Migrating an existing project to use structured AI context

## What this skill does

1. **Copy templates** — Installs the six blank context file templates into `context/`:
   - `project-overview.md`
   - `architecture.md`
   - `code-standards.md`
   - `ai-workflow-rules.md`
   - `ui-context.md`
   - `progress-tracker.md`

2. **Create features folder** — Ensures `context/features/` exists (empty is fine).

3. **Handle root AGENTS.md**:
   - If missing → create it from the entry-point template.
   - If already exists → **do not silently overwrite**. Ask the user what to do:
     - Keep as-is
     - Merge pointer to context/
     - Replace with template
   - Wait for their answer before proceeding.

4. **Grill and fill** — For each of the six context files, conduct a grilling session to gather information and fill out the template. **Work one file at a time**; confirm each before moving to the next.

## Grilling style (REQUIRED)

Follow the **same grilling approach** as `/grill-me`:

- **Design-tree frontier rounds** — Work the decision tree in rounds. The frontier is every decision whose prerequisites are already settled.
- **Concrete suggestions** — Every question must include 2–4 concrete options, labeled **A) / B) / C) / …** (never bullets, never 1/2/3).
- **Exactly one recommended** — Mark one option as recommended and explain why it's better than the others (trade-offs, not slogans).
- **Wait for answers** — After each round, wait for the user's answers before asking the next round.
- **Do not invent behavior** — Never assume or invent product features. Ask when details are missing.
- **Find facts yourself** — Use tools or dispatch sub-agents to discover facts from the environment. Do not ask the user for information you can look up.

### Format example

```
❓ **Q1** - **<question title>**: <question body>

A)
<option>

B)
<option> (recommended)

C)
<option>

➡️ **Recommended: B.** <why B is better than A and C>

---

❓ **Q2** - **<question title>**: <question body>

A)
<option> (recommended)

B)
<option>

C)
<option>

➡️ **Recommended: A.** <why A is better than B and C>
```

## File-by-file grilling order

The order does not matter — pick a sensible next file or let the user choose. Confirm each file before moving on. Work **one file at a time**:

1. **project-overview.md** — Project name, goals, core user flow, features, scope, success criteria.
2. **architecture.md** — Stack, system boundaries, storage model, auth model, invariants.
3. **code-standards.md** — General principles, TypeScript rules, framework conventions, styling, API routes, data storage, file organization.
4. **ai-workflow-rules.md** — Development approach, scoping rules, when to split work, handling missing requirements, protected files, keeping docs in sync.
5. **ui-context.md** — Theme, colors (CSS custom properties), typography, border radius, component library, layout patterns, icons.
6. **progress-tracker.md** — Current phase, goal, completed work, in-progress items, next up, open questions, architecture decisions, session notes.

After each file is confirmed, write the filled markdown into `context/<name>.md`.

## Constraints

- **Do not start implementing application code** — This skill only creates and fills context docs.
- **Do not overwrite AGENTS.md silently** — Always ask if it already exists.
- **Do not skip grilling** — Every context file must be filled through grilling, not guessed.
- **One file at a time** — Confirm each before moving to the next.

## Done when

- All six context files are in `context/` and filled out.
- `context/features/` exists.
- Root `AGENTS.md` is created or handled per user choice.
- No application code was implemented.
