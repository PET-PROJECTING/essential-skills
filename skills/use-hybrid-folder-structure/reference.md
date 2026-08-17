# Hybrid structure — stack mappings

Read this after the skill's workflow when choosing folder and file names.

## Map article terms to the repo

The articles are Vue-oriented. Translate; do not force Vue names onto another stack.

| Article (Vue) | React | Other / notes |
|---|---|---|
| `components/` | `components/` | same |
| `composables/` | `hooks/` | Svelte: `runes/` or `hooks/` if that is the repo convention |
| `store/` + `*.pinia.ts` | `store/` + `*.context.tsx` or `*.store.ts` | Redux/Zustand/Pinia: keep the library's file suffix |
| `services/` + `*.service.ts` | same | HTTP, `localStorage`, SDKs, websockets |
| `types/` + `*.types.ts` | same | |
| `pages/` or `views/` | `pages/` | Next/Nuxt: keep framework routing dirs (`app/`, `pages/`) and still nest by feature *inside* non-routing source |
| `*.vue` | PascalCase `*.tsx` / `*.jsx` | Svelte: `*.svelte` |
| `*.guard.ts` | router middleware / `*.guard.ts` | |

Prefer names the repo already uses when they match a row (`hooks` vs `composables`, `pages` vs `views`). Do not rename a working convention just to match Vue.

## Root responsibilities (typical)

Create only what the codebase needs:

- `components/` — UI
- `pages/` or `views/` — route screens
- `store/` — shared client state
- `services/` — external I/O + domain helpers
- `hooks/` or `composables/` — reusable reactive behavior
- `types/` — contracts
- `lib/` or `config/` — app-wide setup (dayjs, i18n, env)
- `assets/` — static files (unchanged)

Inside each: `<feature>/` for domain code. Cross-cutting extras under that responsibility: `ui/`, `layout/`, `shared/`.

## Component tree

```
components/
  ui/                 # inputs, dialogs, icons, design-system wrappers
  layout/             # shell, nav, app frame
  transitions/        # optional
  features/
    billing/
    packing/
    recaster/
```

`components/ui` is organized by *UI role* (dialog, input, icon), not by business domain.

Feature components may import that feature's store, services, and types. UI components must not.

## Suffixes

Search for a domain word should show kind + feature:

```
billing.service.ts
billing.types.ts
invoice.helper.ts
session.guard.ts
cart.pinia.ts          # Vue
cart.context.tsx       # React
CartSummary.vue
CartSummary.tsx
```

Do not suffix presentational components. Do suffix modules whose role is not obvious from the folder alone.

## Split rules for mixed files

When a file is types + helpers + persistence + UI:

1. Types → `types/<feature>.types.ts`
2. I/O → `services/<feature>/<feature>.service.ts`
3. Pure logic → `services/<feature>/<feature>.helper.ts`
4. Shared client state → `store/<feature>/`
5. UI → `components/features/<feature>/`

Keep types next to a tiny helper only when the file is a handful of lines and unused elsewhere.

## Anti-patterns

- Flat `components/modals/` mixing every feature's dialogs
- `containers/` vs `components/` as the primary split
- A catch-all `lib/` that holds domain types, HTTP, and helpers
- Feature folders at `src/<feature>/` that mix components, stores, and API clients (pure feature-first)
- Moving a domain card into `ui/` because two pages import it
- Adding barrels, README, or new abstractions as part of the move
- Creating empty `hooks/` / `transitions/` / `services/` layers
