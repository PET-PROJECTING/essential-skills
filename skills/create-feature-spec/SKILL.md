---
name: create-feature-spec
description: >-
  Create a unit feature specification under context/features/. Use when the
  user wants to write a feature spec, create a new feature/unit document,
  or invokes /create-feature-spec. Requires context/ to already exist — if
  missing, directs user to run /specify-context first.
---

Create a **unit feature specification** under `context/features/`. This skill guides you through grilling to define a feature's goal, design, implementation, dependencies, non-goals, and verification checklist, then writes the spec and updates the progress tracker.

## When to invoke

Use this skill when:

- The user wants to create a new feature specification
- The user mentions /create-feature-spec
- Starting work on a new feature and need to document its scope and design
- Creating a unit spec for a discrete piece of functionality

## Prerequisites

This skill requires the project to have a `context/` folder with the Six-File Context System already set up. If `context/` does not exist:

1. **Stop immediately**
2. Tell the user to run `/specify-context` first to bootstrap the project's AI context
3. Do not proceed until the context system is in place

## What this skill does

1. **Check for context/** — Verify `context/` exists. If missing, stop and instruct user to run `/specify-context`.

2. **Ask for the feature name** — Prompt for the feature's kebab-case name (e.g., `user-authentication`, `project-dashboard`). Grill if needed to settle on a clear, specific name.

3. **Auto-pick the sequence number** — Scan `context/features/` for existing specs (e.g., `01-*.md`, `02-*.md`). Pick the next available `NN` (zero-padded two digits: `01`, `02`, etc.).

4. **Grill to complete the spec** — Use the grill-me style (design-tree frontier rounds, A/B/C options with one recommended, wait for answers) to fill out the feature spec structure:
   - **Goal** — What this feature accomplishes and why it matters
   - **Design** — User-facing behavior, interaction flow, edge cases, constraints
   - **Implementation** — Sub-sections for data model, API routes, UI components, integration, etc.
   - **Dependencies** — What must exist or be completed first
   - **Non-goals** — What this feature explicitly does not do
   - **Verify when done** — Testable verification checklist

5. **Write the feature spec** — Once confirmed, write `context/features/NN-kebab-name.md`.

6. **Update progress tracker** — Update `context/progress-tracker.md` sections:
   - **In Progress** — Add this feature if work starts immediately
   - **Next Up** — Add this feature if it's queued
   - **Session Notes** — Record that the spec was created
   - **Current Goal** — Update if this feature becomes the active work

7. **Do not implement the feature** — This skill only creates the spec and updates the tracker. Implementation is a separate step.

## Grilling style (REQUIRED)

Follow the **same grilling approach** as `/grill-me`:

- **Design-tree frontier rounds** — Work the decision tree in rounds. Ask all questions whose prerequisites are settled in one round, then wait for answers.
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

## Feature spec structure

The spec should follow this structure (based on `templates/feature-spec.md`):

```markdown
# [Feature Name]

## Goal

[One or two sentences describing what this feature accomplishes and why it matters.]

## Design

[User-facing behavior and interaction flow. Include edge cases and constraints.]

## Implementation

### [Sub-section One — e.g. Data Model]
### [Sub-section Two — e.g. API Routes]
### [Sub-section Three — e.g. UI Components]
### [Sub-section Four — e.g. Integration]

## Dependencies

- [What must exist or be completed first]

## Non-goals

- [What this feature explicitly does not do]

## Verify when done

- [ ] [Specific, testable verification step]
- [ ] [Specific, testable verification step]
```

## Constraints

- **Do not implement the feature** — Only the spec and tracker update
- **Require context/ to exist** — Stop if missing; direct to /specify-context
- **Auto-number sequentially** — Scan existing specs; pick next NN
- **Grill before writing** — Do not guess or invent behavior

## Done when

- Feature spec exists at `context/features/NN-kebab-name.md`
- `context/progress-tracker.md` is updated
- No implementation code was written
