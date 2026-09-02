---
name: apply-solid-principles
description: >-
  Apply SOLID to named modules, classes, or the current change: Single
  Responsibility, Open/Closed, Liskov Substitution, Interface Segregation,
  Dependency Inversion. Use when the user asks to apply SOLID, fix SRP/OCP/LSP/ISP/DIP
  violations, split a god class, replace inheritance with composition, or
  invert a concrete dependency. Skip for formatting, one-liners, or pure Q&A.
disable-model-invocation: true
---

# Apply SOLID Principles

Rewrite the requested code so each module has one reason to change, extensions don't require edits to closed code, subtypes are substitutable, clients don't depend on unused surface, and high-level policy depends on abstractions.

Do **not** lecture SOLID. Diagnose, then make the smallest change that removes a real violation.

## Scope

1. Paths the user named. If none, files they changed this session.
2. Do not SOLID-wash the whole repo unless they asked.
3. Do not fight an existing layout skill (`feature-sliced-design`, `use-hybrid-folder-structure`). Apply SOLID *inside* the current folders and public APIs.
4. Prefer edits over new layers. A new interface, package, or folder needs a second caller or a test boundary — not a hypothetical one.

## Process

1. **Read** the scoped files and their callers. Note existing tests.
2. **Diagnose** with the checklist below. Only flag violations that hurt change, tests, or reuse *now*.
3. **Plan** the smallest refactor per violation (extract, invert, split). If several principles apply, fix SRP first — the others often collapse.
4. **Apply**. Keep behavior identical. Keep tests green. If coverage of the area is thin, say so before large moves.
5. **Report** a short list: violation → principle → what changed. Skip principles that were already fine.

If the user wants a plan and a GitHub issue rather than edits, stop after step 3 and use `/request-refactor-plan`.

## Checklist (only act on hits)

### S — Single Responsibility

**Smell:** one type owns orchestration *and* I/O *and* policy; a change to logging, persistence, or a business rule all edit the same file.

**Do:** extract one reason to change per type. Callers keep a thin facade if the public API must stay.

**Don't:** split by noun ("UserValidator", "UserLogger") when those pieces always change together.

### O — Open/Closed

**Smell:** every new variant is another `if`/`switch` inside a closed module that already has several of them.

**Do:** add a new type or strategy behind an existing extension point. Close the module that keeps changing.

**Don't:** introduce a strategy hierarchy for two cases that will never grow. A `switch` on a closed set (HTTP method, enum with three values) is fine.

### L — Liskov Substitution

**Smell:** a subtype throws `NotImplemented`, narrows preconditions, or makes callers `instanceof`-branch to stay correct.

**Do:** make the subtype honor the parent's contract, or drop the inheritance and use composition / a narrower type.

**Don't:** keep a fake "is-a" so the type checker is quiet.

### I — Interface Segregation

**Smell:** a client is forced to depend on methods it never calls; implementors stub half the surface.

**Do:** split the role into the smallest interface each client actually uses.

**Don't:** one-interface-per-method. Segregate by *client need*, not by method count.

### D — Dependency Inversion

**Smell:** high-level policy imports a concrete database, HTTP client, or framework helper; tests can't substitute it without mocking internals.

**Do:** depend on an abstraction owned by the policy side (port). Put the adapter next to the concrete I/O.

**Don't:** invert stable stdlib or value objects. Don't add a repository interface used by one class in one file.

## Guardrails

- **YAGNI beats ceremony.** An unused abstraction is a SOLID miss, not a hit.
- **Behavior stays put.** Rename and move only as needed to make the new boundary honest.
- **Tests test the boundary**, not the private helpers you just extracted.
- **Language-native:** classes, modules, functions, and closures are all valid "types". Don't introduce classes in a functional codebase just to look SOLID.
- After structural edits, leave formatting to `/apply-prettier` or `/fix-lint` if those skills are in play.

## Done when

Every scoped violation you flagged is gone or explicitly deferred (with why). Callers compile. Existing tests still express the same external behavior.
