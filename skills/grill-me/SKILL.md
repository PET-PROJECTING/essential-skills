---
name: grill-me
description: >-
  Relentless interview to sharpen a plan before implementation. Use when the
  user wants any code change — feature, fix, refactor, migration, library
  swap, or "review X and replace/improve/migrate Y". Use when multiple valid
  approaches exist or scope is unclear, even if the request sounds analytical.
  Skip only for pure Q&A with no file changes, read-only review with no
  follow-up work, or trivial surgical edits (1–2 files, one obvious approach,
  no trade-offs). When unsure, grill.
---

Run a grilling session **before any non-trivial implementation**. Interview the user relentlessly until you reach a shared understanding. Do **not** start implementing in the same turn as grilling.

## When to invoke (default: yes)

Invoke this skill whenever the user expects **you to change code**, including when they frame it as review, audit, or analysis that leads to changes.

**Always grill when any of these apply:**

- Feature, fix, bugfix, adjustment, refactor, migration, or library swap
- **"Review … and replace / improve / migrate / fix …"** — audit-then-implement is implementation work, not read-only review
- **Room for dispute** — more than one reasonable approach, unclear scope, cross-cutting impact, or architectural choices (e.g. validations → Zod: where schemas live, error shape, migration order, shared vs inline)
- **Multi-file or pattern-level work** — touching several files, layers, or conventions
- The user did not spell out every decision; assumptions would be needed to start coding

**When in doubt, invoke this skill.** A false-positive grill costs one round of questions; a false-negative skips alignment and causes rework.

## When to skip (narrow exceptions only)

Skip only in one of these cases:

1. **No file changes** — pure explanation, "how does this work?", comparison, or opinion with no implied follow-up work
2. **Trivially surgical** — roughly 1–2 files, one obvious approach, established project pattern, no meaningful trade-offs (typo, rename, add a null check where the pattern already exists, fix a single lint in one place)

Do **not** skip because the request contains words like *review*, *audit*, *analyze*, or *look at* — read the full intent. If the outcome includes changing code, grill first.

Intent matters, not punctuation.

Map this as a **design tree**: every decision branches into the decisions that hang off it.

Work the tree in **rounds**. The **frontier** is every decision whose prerequisites are already settled: the questions you can ask _now_ without guessing at answers you haven't heard yet. Ask the whole frontier in one round. Then wait for the user's answers before the next round.

## Suggestions (always)

Every question **must** include a few concrete suggestions (typically 2–4). Mark **exactly one** as recommended.

- Label suggestions **A) / B) / C) / …** (never bullets, never 1/2/3, never `A.`).
- Put **each option on its own block**: the letter on one line, the option text on the next. Never blend A/B/C into one paragraph or one line.
- One option is recommended. After the list, explain **why that option is better than the others** (trade-offs, not a slogan).
- Do not ask an open question with no options. If the space is wide, still offer a short A/B/C set covering the real forks.

Format a round like so:

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

Each round the user answers reshapes the tree: settled decisions push the frontier outward and unblock questions that depended on them. Recompute the frontier and ask the next round. A question whose answer depends on another question still open in this round belongs to a _later_ round, not this one.

Finding _facts_ is your job, never the user's. When a frontier question needs a fact from the environment (filesystem, tools, etc.), dispatch a sub-agent to find it; don't ask the user for anything you could look up yourself. Don't block on it: a running exploration is an unsettled prerequisite, so only the questions downstream of it wait for the sub-agent to report; ask the rest of the frontier now. The _decisions_ are the user's: put each to them and wait.

## After grilling

The session is done when the frontier is empty: every branch of the design tree visited, nothing left silently assumed.

Then **write down the plan** (what you will change, and in what order). **Wait for confirmation.** Do not act on it until the user confirms.

If the user **mentions docs**, also create a markdown file named for the work (`<feature_name>.md`, `<fix_name>.md`, or `adjustements.md`) with that plan. Skip the file unless they ask for docs.
