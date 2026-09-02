---
name: fix-tech-debt
description: >-
  Discover tech-debt markers (README, FIX, TODO, FIXME docs and lists), group
  them by domain, let the user pick what to tackle, then run a grilling session
  to produce an implementation plan. Use when the user mentions tech debt,
  deferred fixes, TODO/FIXME cleanup, or wants to triage and plan debt work.
disable-model-invocation: true
---

# Fix Tech Debt

Triage documented tech debt, let the user choose what to fix, then sharpen a plan through a grilling session. **Do not implement** in the same turn as discovery or grilling. **Do not write plan docs** unless the user asks — the plan lives in chat.

## Phase 1 — Discover

Scan the **current project** (not this skills pack) for documented debt. Run discovery yourself; never ask the user to paste file lists.

### Files to collect

Search for markdown and text files whose **name or path** suggests debt tracking:

| Pattern | Examples |
| --- | --- |
| Fix / debt docs | `FIX.md`, `FIXES.md`, `TECH-DEBT.md`, `TECHDEBT.md`, `DEBT.md`, `BACKLOG.md` |
| Todo docs | `TODO.md`, `TODOS.md`, `PENDING.md` |
| Readmes with debt sections | `README.md`, `README.*.md`, module-level `README.md` |
| Notes / hacks | `NOTES.md`, `HACKS.md`, `KNOWN-ISSUES.md`, `LIMITATIONS.md` |
| ADR / RFC gaps | `docs/**/*.md` containing unchecked items or explicit debt language |

Also grep markdown and common source comment styles for inline markers:

```
TODO|FIXME|HACK|XXX|TECH.?DEBT|DEPRECATED|WORKAROUND
```

Skip: `node_modules`, `.git`, `dist`, `build`, `.next`, `coverage`, vendor trees, and this skills pack if present in the repo.

### Extract items

For each hit, capture:

- **ID** — stable short slug (e.g. `auth-readme-jwt-rotation`)
- **Title** — one line
- **Source** — file path (+ line/section if inline)
- **Snippet** — the debt text (trimmed)
- **Domain** — inferred label (see below)
- **Severity hint** — `critical` / `moderate` / `minor` / `unknown` from wording (security, broken, hack, nice-to-have)

If the same issue appears in multiple places, merge into one item and note all sources.

## Phase 2 — Group and present

Group items by **domain**. Infer domain from (in order):

1. Explicit tag in text (`domain:`, `[auth]`, `#billing`)
2. Top-level folder or package name (`src/auth/` → **auth**)
3. README heading or module name
4. Fallback: **general** or **cross-cutting**

Present a readable inventory. Default view: **grouped by domain**, domains sorted by item count (largest first). Offer regrouping if domains look wrong:

```
❓ **Q0** - **How should items be grouped?**

A)
By domain (recommended)

B)
By severity

C)
By source file

D)
Flat list (no grouping)

➡️ **Recommended: A.** Domain grouping matches how teams usually prioritize and assign work.
```

### Inventory format

For each domain, list items like:

```
### auth (3 items)

1. **[auth-readme-jwt-rotation]** Rotate JWT signing keys — `src/auth/README.md`
   > TODO: document and automate key rotation before prod

2. ...
```

End with a summary line: total items, domain count, severity breakdown.

## Phase 3 — User selects

Let the user pick what to tackle **now**. Use `AskQuestion` with `allow_multiple: true` when available. Options = item IDs (or numbered indices with ID in the label).

Also ask scope for this session:

```
❓ **Scope** - **How much should we plan in this session?**

A)
Only what I selected (recommended)

B)
Selected items plus obvious dependencies you find in code

C)
Everything in one domain I name

➡️ **Recommended: A.** Keeps the grilling session focused and finishable.
```

If nothing is found, say so plainly and suggest the user may track debt in README/TODO files — do not invent items.

## Phase 4 — Grilling session

For **selected items only**, run a grilling session using the same rules as `/grill-me`:

- Work a **design tree** in **rounds**; ask the whole frontier each round
- Every question needs **2–4 labeled options (A/B/C)** with **exactly one recommended**
- **Finding facts is your job** — explore the codebase for each selected item before asking
- **Do not start implementing** during grilling

Grilling should cover, per item or batch when related:

- What "done" looks like vs current state
- Scope boundaries (what stays out)
- Approach forks (quick fix vs proper fix, migration order)
- Test / verification expectations
- Risk and rollback
- Order of work when items depend on each other

Cross-item questions belong in the same round when they share prerequisites.

## Phase 5 — Plan (chat only)

When the frontier is empty, write a **concise plan in chat**:

```markdown
## Tech debt plan — <date or session label>

### Selected items
- [id] title — one-line outcome

### Order of work
1. ...

### Decisions
- ...

### Out of scope
- ...

### Verification
- ...
```

**Wait for confirmation** before any implementation. If the user confirms, they can invoke `/grill-me`-backed implementation in a follow-up or proceed manually.

Do **not** create `*.md` plan files unless the user explicitly asks for docs.

## Routing

| After this skill | When |
| --- | --- |
| `/grill-me` | User wants deeper alignment on one item before coding |
| `/request-refactor-plan` | User wants a GitHub issue with tiny-commit steps |
| `/develop-with-tdd` | User confirms plan and wants test-first implementation |
| `/create-commit` | Work is done and needs conventional commits |

## Anti-patterns

- Do not implement during discovery, selection, or grilling
- Do not ask the user to hunt for TODO files
- Do not dump raw grep output — always normalize into the inventory format
- Do not skip selection and grill the entire repo unless the user explicitly asks for a full audit plan
