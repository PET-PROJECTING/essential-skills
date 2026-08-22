---
name: write-unit-tests
description: Write unit tests for the given units using the project's test runner. Use when the user asks for unit tests or invokes /write-unit-tests.
disable-model-invocation: true
---

# Write Unit Tests

Add unit tests for the named units. This is **not** TDD for new features (`/develop-with-tdd`) and **not** e2e (`/write-e2e-tests`).

## Scope

Paths the user named. If none, units they changed this session. If still unclear, stop and ask.

## Detect the runner

Use the repo's runner (Vitest, Jest, node:test, pytest, etc.) and the neighboring `*.test.*` / `*.spec.*` layout, naming, and assertion style. Do not add a new framework.

## Write

1. Test observable behavior at the unit boundary: return values, thrown errors, calls into injected deps.
2. Derive expected values independently (literals / fixtures). Do not assert by re-running the code under test.
3. Mock only slow or external deps (network, clock, FS). Prefer real collaborators when they are in-process and fast.
4. One behavior per test; names say the break they catch.
5. Do not snapshot large trees unless the project already does for that kind of unit.
6. Do not change production code except a trivial test-export the project already patterns.

Load [develop-with-tdd `writing-good-tests.md`](../develop-with-tdd/writing-good-tests.md) if that file is present in this pack.

## After

List new tests and the command to run them. Run the new files if that is cheap and already configured.
