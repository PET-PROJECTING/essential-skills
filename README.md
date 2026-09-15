# essential-skills

**[Homepage](https://essential-skills.vercel.app/)** · [npm](https://www.npmjs.com/package/essential-skills)

Interactive CLI that installs a curated set of agent skills into Cursor, Claude Code, Codex, GitHub Copilot, Gemini CLI, OpenCode, Windsurf, and other agents that read skills from `.agents/skills`.

Browse skills, compare the Quick and Full packs, and see how install works on the [homepage](https://essential-skills.vercel.app/).

Requires Node.js 20.12 or later.

## Usage

```bash
npx essential-skills
```

The CLI walks you through:

1. **Install** or **clear** skills
2. **Global** (home directory) or **project** (current repo)
3. Which **agents** to target
4. Which **skills** to copy — via preset or manual selection

At any later step, press **←** to go back. **Esc** cancels without changes.

Global installs land in each agent's home-directory skills folder. Project installs go into the matching folder in the current repo (for example `.cursor/skills` or `.agents/skills`).

On install, if a skill with the same name is already present, the CLI asks whether to override it or cancel. After a successful install it prints a short catalog of what was copied. **Clear** only removes skills from this pack — other skills in the same folders are left alone.

After installing, restart your agent session. Run `/show-skill-catalog` anytime to see the same list.

## Presets

Pick a preset during install, or choose skills manually.

| Preset | Best for | Skills |
| --- | --- | --- |
| **Quick** | Pet projects, prototypes, fast iteration | 13 skills — planning and hygiene, **no TDD or test overhead** |
| **Full** | Production apps where quality and tests matter | All 21 skills |
| **Manual** | Mix and match | Pick each skill; high-overhead ones are labeled `slow` or `moderate` in the picker. **Spec-driven context** is one row and always copies `/specify-context` and `/create-feature-spec` together. |

### Quick preset (13 skills)

`grill-me`, `specify-context`, `create-feature-spec`, `show-skill-catalog`, `find-skills`, `fix-tech-debt`, `request-refactor-plan`, `apply-solid-principles`, `create-commit`, `fix-lint`, `apply-prettier`, `apply-style-guide`, `write-handoff`

Keeps alignment before building (`grill-me`, spec-driven context) and a SOLID pass on demand, but skips TDD, test-writing, review, Storybook, and architecture skills so tasks resolve faster.

### Full preset (21 skills)

Everything in Quick, plus:

`review-code`, `develop-with-tdd`, `write-unit-tests`, `write-e2e-tests`, `write-storybook`, `apply-best-practices`, `feature-sliced-design`, `use-hybrid-folder-structure`

Use Full when testing, review, and architecture guidance are non-negotiable.

## Task overhead

Installing every skill makes the agent heavier on implementation work. These add the most time:

| Skill | Overhead | Why |
| --- | --- | --- |
| `grill-me` | Medium | Interview rounds and plan confirmation before coding |
| `review-code` | High | Two parallel sub-agents over the full diff |
| `specify-context` | Medium | Interview rounds to fill project context files, one file per invocation |
| `create-feature-spec` | Medium | Interview rounds to write a unit spec and update the progress tracker |
| `develop-with-tdd` | High | Failing test first; run the suite before and after each change |
| `write-unit-tests` | High | Writes and runs unit tests |
| `write-e2e-tests` | High | E2E specs are slow to author and run |
| `fix-tech-debt` | Medium | Scan debt docs, domain inventory, selection, then grilling before fixes |
| `request-refactor-plan` | Medium | Interview rounds, then a GitHub issue with a tiny-commit plan |
| `apply-solid-principles` | Medium | Can split modules and invert dependencies across several files |
| `apply-best-practices` | Medium | 70 React/Next.js rules; can trigger broad refactors |
| `feature-sliced-design` | Medium | Architecture migrations and layer boundaries |
| `use-hybrid-folder-structure` | Medium | Multi-file folder refactors |

Everything else is on-demand (commit, lint, format, handoff, catalog) and stays out of the way until invoked.

## Included skills

| Skill | What it does | Preset |
| --- | --- | --- |
| `grill-me` | Interview before implementation; skip only pure Q&A or read-only review with no follow-up | Quick, Full |
| `review-code` | Two-axis review of changes against repo standards and the spec | Full |
| `specify-context` | Bootstrap docs context files, merge AGENTS.md/CLAUDE.md, grill one unfilled file per run | Quick, Full |
| `create-feature-spec` | Grill a unit spec under feature-specs and update the progress tracker (installs with specify-context) | Quick, Full |
| `show-skill-catalog` | List this pack and route you to the right skill | Quick, Full |
| `find-skills` | Discover and install skills from the open ecosystem | Quick, Full |
| `fix-tech-debt` | Discover README/TODO/FIX debt, group by domain, pick items, grill an implementation plan | Quick, Full |
| `request-refactor-plan` | Interview, then file a GitHub issue with a tiny-commit refactor plan | Quick, Full |
| `apply-solid-principles` | Apply SRP, OCP, LSP, ISP, and DIP to named or changed modules | Quick, Full |
| `create-commit` | Split work into logical conventional commits; uses agent session history when available | Quick, Full |
| `fix-lint` | Fix Biome or ESLint issues on named or changed files | Quick, Full |
| `apply-prettier` | Format named or changed files with the project's Prettier | Quick, Full |
| `apply-style-guide` | Apply a repo style guide, or Google's language guide if none | Quick, Full |
| `write-handoff` | Compact the current conversation for another agent to continue | Quick, Full |
| `develop-with-tdd` | Write the failing test first, then the implementation | Full |
| `write-unit-tests` | Write unit tests for named units | Full |
| `write-e2e-tests` | Write e2e tests for files you name | Full |
| `write-storybook` | Write Storybook stories for named components | Full |
| `apply-best-practices` | React and Next.js performance guidelines from Vercel Engineering | Full |
| `feature-sliced-design` | Feature-Sliced Design (FSD) v2.1 from [fsd.how](https://fsd.how) | Full |
| `use-hybrid-folder-structure` | Hybrid frontend layout: responsibility first, feature second | Full |

## License

MIT
