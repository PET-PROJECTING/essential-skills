---
name: use-hybrid-folder-structure
description: >-
  Refactors a frontend onto a hybrid folder structure: responsibility first at
  the root, feature second inside each folder. Use when reorganizing src/,
  applying hybrid architecture, splitting by file type vs domain, deciding
  where components/hooks/services/stores belong, or when the user invokes
  use-hybrid-folder-structure.
---

# Use Hybrid Folder Structure

Refactor (or shape) a frontend so every file has a clear owner. Do not change product behavior.

Source principles: [Part 1](https://dev.to/lazydoomslayer/how-i-build-vue-3-applications-part-1-why-i-use-a-hybrid-folder-structure-48c2) (folders), [Part 2](https://dev.to/lazydoomslayer/how-i-build-vue-3-applications-part-2-how-i-decide-where-every-component-belongs-26ac) (components), [Part 3](https://dev.to/lazydoomslayer/how-i-build-vue-3-applications-part-3-when-logic-belongs-in-a-composable-2bpe) (logic), [Part 4](https://dev.to/lazydoomslayer/how-i-build-vue-3-applications-part-4-where-api-logic-belongs-db9) (API).

Framework names and suffixes: [reference.md](reference.md).

## Principle

**Responsibility first. Feature second.**

1. Root folders answer: *what kind of file is this?*
2. Folders inside each responsibility answer: *which feature owns it?*

Do not organize the app as only `components/` / `hooks/` / `services/` with a flat dump of files. Do not organize as only `billing/` / `users/` with mixed file kinds inside. Combine both.

Shared, cross-cutting code (UI kit, layout, app config, date libs) stays outside feature folders.

## Target shape

Adapt names to the stack; keep this shape:

```
src/
  components/
    ui/                 # business-agnostic, reusable
    layout/             # app shell
    transitions/        # animation-only, if the app has them
    features/
      <feature>/        # owned by one domain
  pages/                # or views/ — route-level screens
  store/                # or stores/ — shared app state
    <feature>/
  services/
    <feature>/
  hooks/                # or composables/
    <feature>/          # plus a shared/ folder if truly generic
  types/
    <feature>.types.ts  # or types/<feature>/
  lib/ or config/       # third-party setup, env, i18n — not features
```

Skip empty layers. Do not invent `hooks/` or `transitions/` if nothing belongs there.

## Who owns this file?

Ask **who owns this?** before moving anything.

| Kind | Test | Destination |
|---|---|---|
| UI component | Could copy it to another product without changing behavior? Another feature can reuse it with no domain knowledge? | `components/ui/` |
| Feature component | Owned by one business feature; may use that feature's store/services/types | `components/features/<feature>/` |
| Layout | Still useful if every business feature were removed | `components/layout/` |
| Transition | Only animation; no business logic | `components/transitions/` |
| Page / view | Route screen | `pages/<feature>/` |
| Store | State shared by unrelated parts of the app | `store/<feature>/` |
| Service | Talks to an external system (HTTP, storage, third-party SDK) | `services/<feature>/` |
| Helper | Pure domain/util logic, no I/O | `services/<feature>/*.helper.ts` or `lib/` if cross-cutting |
| Types | TypeScript contracts | `types/` with a feature suffix or folder |
| Hook / composable | Owns one well-defined reactive behavior | `hooks/` or `composables/`, then feature or `shared/` |

**Do not promote a feature component to `ui` just because a second feature imports it.** Duplicate a small piece or keep it in the owning feature. Promote only after it is truly business-agnostic.

**Do not extract a hook because a component got long.** Extract only when the logic has its own responsibility. UI-coupled logic stays in the component.

**Do not fetch in components or hooks.** Hooks may coordinate loading/error/pagination; the request lives in a service. Services must not know about UI, hooks, or stores.

**Store vs hook:** one component/feature workflow → hook. Unrelated surfaces need the same state → store.

## File names

Names should say what the file does before it is opened. Use suffixes on non-component modules:

- `*.types.ts` — contracts
- `*.service.ts` — external I/O
- `*.helper.ts` — pure helpers
- `*.guard.ts` — route/auth guards
- store files — `*.pinia.ts`, `*.context.tsx`, `*.store.ts` (match the stack)
- components stay in the stack's component convention (`*.vue`, PascalCase `*.tsx`)

## Refactor workflow

Copy and track:

```
- [ ] Inventory src/; list features and current mixed folders
- [ ] Map stack names (Vue/React/other) from reference.md
- [ ] Classify every moved file (table above)
- [ ] Split mixed modules: types vs helper vs service vs store
- [ ] Move files (git mv when tracked)
- [ ] Update imports; switch relative asset imports to the project alias if one exists
- [ ] Remove empty leftover folders and dead barrels
- [ ] Typecheck / lint; fix only breakages from the move
```

Rules while moving:

1. **Preserve behavior.** No feature work, no drive-by cleanups, no new abstractions.
2. **Identify features from the product**, not from leftover dump folders (`modals/`, `containers/`, `lib/` catch-alls).
3. **Split a mixed module** when it owns more than one responsibility (e.g. types + HTTP + UI helpers in one file). Leave a tiny file whole if splitting adds noise.
4. **One feature folder per domain** inside each responsibility (`components/features/billing/`, `services/billing/`, `store/billing/`).
5. **Update all imports** in the same change. Do not leave compatibility re-exports unless the repo already relies on public barrels.
6. **Verify** with the project's typecheck and lint. Do not commit unless asked.

## Done when

- Root of `src/` is responsibilities, not a pile of features or a pile of ungrouped file types
- Feature code is grouped *inside* those responsibilities
- Shared UI, layout, and config are not stuffed into a random feature
- File names (or suffixes) make kind + domain obvious in search
- App still typechecks; behavior is unchanged
