---
name: grill-me
description: >-
  Relentless interview to sharpen a plan before any implementation. Use when
  the user wants a feature, fix, bugfix, adjustment, refactor, or other code
  change. Do not use when the user only asks a question, wants an explanation,
  a read-only look at code, or an opinion with no file changes implied. A
  question that still means "make this change" is implementation work — grill
  first.
---

Run a grilling session **before any feature, fix, or adjustment**. Interview the user relentlessly until you reach a shared understanding. Do **not** start implementing in the same turn as grilling.

**Skip this skill** only when the user wants an explanation, a read-only look at code, or an opinion — no file changes implied. Intent matters, not punctuation.

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
