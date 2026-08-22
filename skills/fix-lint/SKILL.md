---
name: fix-lint
description: Fix Biome or ESLint issues in the project. Use when the user asks to fix lint, Biome, or ESLint, or invokes /fix-lint.
disable-model-invocation: true
---

# Fix Biome / ESLint

Clear **this repo's** linter on the requested files. Prefer the tool the project already uses.

## Detect

Look at `package.json` scripts and config:

- **Biome** — `biome.json`, `biome.jsonc`, `@biomejs/biome`
- **ESLint** — `eslint.config.*`, `.eslintrc*`, `eslint`

If both exist, run both unless the user named one. If neither exists, stop.

## Scope

1. Paths the user named. If none, files they changed this session (or the git diff).
2. Do not lint the whole repo unless they asked.

## Fix

1. Run the project's command with `--write` / `--fix` when it exists, for example:
   - `npx biome check --write <paths>`
   - `npx eslint --fix <paths>`
2. Re-run without fix. For remaining errors, edit the source to satisfy the rule.
3. Keep behavior the same. Do not disable rules, add `eslint-disable` / `biome-ignore`, or change config unless the user asked or the rule is a false positive you cannot fix in code.
4. Do not run Prettier unless a lint rule requires formatting and the project uses that formatter.

## After

List remaining issues you could not fix, with file, rule, and why.
