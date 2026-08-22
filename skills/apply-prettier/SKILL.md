---
name: apply-prettier
description: Format files with the project's Prettier config. Use when the user asks to apply Prettier, format with Prettier, or invokes /apply-prettier.
disable-model-invocation: true
---

# Apply Prettier

Format the requested files with **this repo's** Prettier. Do not invent a config.

## Scope

1. Use paths the user named. If none, format only files they changed in this session (or `git diff` / staged files if that is the work).
2. Never format the whole repo unless they asked for that.
3. Skip generated, lockfiles, and ignored paths.

## Run

1. Confirm Prettier is a project dependency (`package.json`, config files such as `.prettierrc*`, `prettier.config.*`). If it is missing, stop and say so — do not add Prettier unless they asked to install it.
2. Format with the project's binary, for example:
   - `npx prettier --write <paths>`
   - or the repo script (`npm run format`, `pnpm prettier`, etc.) if it is equivalent.
3. Pass the same ignore/config the project already uses. Do not add CLI flags that override the config unless the user asked.
4. If Biome (or another tool) is the project's formatter and Prettier is not installed, stop and say to use that formatter instead.

## After

Show which paths were written. Do not mix in lint, refactors, or logic changes.
