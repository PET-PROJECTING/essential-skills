---
name: create-feature-spec
description: >-
  Write a feature unit spec under the spec-driven context folder (from
  specify-context), grill the unit, and update progress-tracker.md. Use when
  the user wants a feature spec, unit spec, implementation plan for a
  feature, /create-feature-spec, or to spec the next item in the build plan.
  Requires specify-context first; run that workflow if context files are
  missing. Do not implement the feature in this skill.
---

# Create Feature Spec

Turn one build-plan unit into a spec that a later session can implement. **Do not implement application code.** **Do not mark units Completed** in the progress tracker.

This skill is bundled with `/specify-context`.

## Grill protocol

Search the project and home skill dirs for `grill-me/SKILL.md` (`.cursor/skills`, `.claude/skills`, `.agents/skills`, `.windsurf/skills`, and the matching global folders). If found, **read it and follow those rules in this conversation** — do not spawn a subagent.

If it is missing, use this format:

- Design tree in **rounds**. Ask the whole frontier each round; wait for answers.
- Every question needs **2–4 options labeled A) / B) / C)** (letter on its own line, option text on the next). Mark **exactly one** recommended. After the list, explain why.
- Finding facts is your job. Read the context files and the repo before asking.
- Do not write the spec until the frontier is empty.

## Phase 1 — Resolve context

1. Read `AGENTS.md` and, if present, `CLAUDE.md`. Find the `## Application Building Context` section.
2. From that section, read the sentences that begin with "Context files live in" and "Feature units live in". Take the backtick-quoted paths as the context root and the spec folder.
3. If that section is missing, search the repo for `progress-tracker.md` (skip `node_modules`, `.git`, dist/build). If several match, ask which one. The spec folder is the sibling directory that contains `00-build-plan.md`, or `feature-specs/` under the same root.

If the six context files are missing, **bootstrap them now**: read `specify-context/SKILL.md` from the same skills directory if present, and run its Phase 1–2 (confirm folders, copy templates, merge entry files). Then:

- If `project-overview.md` is still unfilled, grill and write **only that file** (specify-context Phase 3), then **stop**. Tell the user to re-run `/specify-context` until the six files and build plan exist, then `/create-feature-spec` again.
- Do not fill multiple context files in this invocation, and do not write a unit spec until `project-overview.md` and `architecture.md` are filled.

Read, in order: project-overview, architecture, ui-context, code-standards, ai-workflow-rules, progress-tracker, and `00-build-plan.md` if it exists.

## Phase 2 — Choose the unit

If `00-build-plan.md` exists (even if still a template), grill in one round:

❓ **Which unit?**

A)
The next plan row whose Spec column is `missing` (or has no file) (recommended)

B)
A different unit already listed in the plan

C)
A new unit — append it to the plan (number, name, what it builds, depends on) then spec it

If the build plan is still unfilled, treat this as C after a short grill for the first unit, and write a real first row into `00-build-plan.md`. Do not invent a full multi-unit plan here — suggest `/specify-context` to fill the rest of the plan.

## Phase 3 — Grill the spec

Use `templates/unit-spec.md` in this skill. Grill until Goal, Design, Implementation, Dependencies, Verify, Out of scope, and Decisions are specific. Push back on vague goals ("build the dashboard") until the unit has one visible result and stays in one system boundary.

Filename: `{{NN}}-{{kebab-name}}.md` in the spec folder.

- `NN` is the plan number, zero-padded to two digits (`01`, `02`, …).
- Ad-hoc units take the next free number (max existing `NN` in the folder and plan, plus one).
- `kebab-name` from the unit title.

## Phase 4 — Write and track

1. Write the spec file. Replace `{{NN}}` and `{{FEATURE_NAME}}`. No unfilled marker.
2. Update `00-build-plan.md`: set that row's Spec column to the filename.
3. Update `progress-tracker.md`:
   - **Current Phase** — feature specs / the current phase name
   - **Current Goal** — this unit
   - **In Progress** — this spec filename and one-line goal
   - **Next Up** — remaining plan units with Spec `missing`
   - **Open Questions** — copy unresolved items from the spec
   - **Architecture Decisions** — add decisions from this grill that affect the system
   - **Session Notes** — enough to resume
   - **Do not** add this unit to **Completed**

Tell the user the spec path and that implementation is a separate step (`/grill-me` and, if installed, `/develop-with-tdd`). Stop.

## Routing

| After this skill | When |
| --- | --- |
| `/create-feature-spec` again | Next unit spec |
| `/specify-context` | Context or build plan needs a revision |
| `/grill-me` | Implement the spec |
| `/develop-with-tdd` | Implement the spec with tests first |
