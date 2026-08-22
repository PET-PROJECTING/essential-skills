---
name: write-e2e-tests
description: Write end-to-end tests for user-provided files. Use when the user asks for e2e/Playwright/Cypress tests or invokes /write-e2e-tests. Requires target file paths.
disable-model-invocation: true
---

# Write E2E Tests

Write end-to-end tests for **files the user provides**. Do not pick targets yourself.

## Required input

The user must name the file(s) to cover (pages, flows, existing specs, or routes). If they did not, **stop** and ask for paths. Do not infer from the git diff.

## Detect the runner

Match the repo: Playwright, Cypress, Nightwatch, etc. Use existing `e2e/`, `tests/e2e`, `playwright.config.*`, `cypress.config.*`, and neighboring specs as the template (selectors, fixtures, auth). Do not add a new e2e stack unless they asked.

## Write

1. Cover the user-visible flow those files implement — not unit-level internals.
2. Prefer the project's locators (`getByRole`, page objects, data-testid — whatever specs already use).
3. No flake: wait on UI/network the way this repo does; no arbitrary `sleep`.
4. Put new specs next to existing e2e files, with the same naming.
5. Do not change production code unless a test cannot run without a test id and the project already uses that pattern — then ask or add the smallest hook.

## After

Say which spec files were added/updated and how to run them (the project's script). Run the new tests if that is cheap and already configured.
