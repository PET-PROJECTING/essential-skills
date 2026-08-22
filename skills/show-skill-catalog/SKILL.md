---
name: show-skill-catalog
description: Explain what this essential-skills pack provides. Use when the user asks what skills they installed, what this library/pack can do, which skill to use, or invokes /show-skill-catalog. Do not use for discovering skills outside this pack — that is find-skills.
---

# Show Skill Catalog

List the skills from **this pack** and, if the user says what they are trying to do, point them at the matching skill. Do not search skills.sh.

## Catalog

| Skill | What it does |
| --- | --- |
| `/show-skill-catalog` | Lists this pack and routes you to the right skill |
| `/find-skills` | Search and install skills from the open ecosystem (skills.sh) |
| `/grill-me` | Relentless interview to sharpen a plan or design |
| `/create-commit` | Conventional commit from the diff, with intelligent staging |
| `/apply-best-practices` | React and Next.js performance rules from Vercel |
| `/apply-prettier` | Format files with the project's Prettier |
| `/fix-lint` | Fix Biome or ESLint issues |
| `/apply-style-guide` | Apply a repo style guide, or Google's if none |
| `/write-e2e-tests` | Write e2e tests for user-provided files |
| `/write-unit-tests` | Write unit tests for named units |
| `/write-storybook` | Write Storybook stories for named components |
| `/write-handoff` | Compact this conversation so the next agent can continue |
| `/review-code` | Two-axis review (standards + spec) since a fixed point |
| `/develop-with-tdd` | Tests first, watch them fail, then write the code |
| `/feature-sliced-design` | Feature-Sliced Design (FSD) v2.1 frontend architecture |
| `/use-hybrid-folder-structure` | Hybrid frontend layout: responsibility first, feature second |

Present this as a readable list for a human (the table is the source of truth). One line per skill is enough unless they ask for more.

## Which should I use?

If the user describes a current task, recommend from this pack only:

- **What can I do / what did I install?** → `/show-skill-catalog` (this skill)
- **Sharpen a plan, design, or idea before building** → `/grill-me`
- **Implement a feature or bugfix** → `/develop-with-tdd`
- **Writing or refactoring React / Next.js for performance** → `/apply-best-practices`
- **Format with Prettier** → `/apply-prettier`
- **Fix Biome or ESLint** → `/fix-lint`
- **Apply a style guide** → `/apply-style-guide`
- **Write e2e tests (paths required)** → `/write-e2e-tests`
- **Write unit tests** → `/write-unit-tests`
- **Write Storybook stories** → `/write-storybook`
- **Review a branch, PR, or work since a commit** → `/review-code`
- **Commit the current work** → `/create-commit`
- **Organize a frontend with FSD layers and slices** → `/feature-sliced-design`
- **Reorganize src/ by file kind and feature** → `/use-hybrid-folder-structure`
- **Hand this session to another agent** → `/write-handoff`
- **Need a skill that is not in this pack** → `/find-skills`

`/feature-sliced-design` and `/use-hybrid-folder-structure` are different frontend layouts. If the user names FSD, layers, or slices, use FSD. If they name hybrid, responsibility-first, or file-kind folders, use hybrid. If they only say "reorganize src/", ask which layout they want.

If more than one fits, list them in the order the human should run them (for example grill, then TDD, then commit).

If nothing in this pack fits, say so and suggest `/find-skills`.
