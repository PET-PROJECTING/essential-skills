# essential-skills

Interactive CLI that installs a curated set of agent skills into Cursor, Claude Code, Codex, GitHub Copilot, Gemini CLI, OpenCode, Windsurf, and other agents that read skills from `.agents/skills`.

Requires Node.js 20.12 or later.

## Usage

```bash
npx essential-skills
```

The installer asks where to put skills (your home directory or the current project), which agents should receive them, and which skills to copy. If a skill with the same name is already installed, it asks whether to override the existing copy or cancel.

Global installs land in each agent's home-directory skills folder. Project installs go into the matching folder in the current repo (for example `.cursor/skills` or `.agents/skills`).

After installing, restart the agent session so it picks up the new skills.

## Included skills

| Skill | What it does |
| --- | --- |
| `apply-best-practices` | React and Next.js performance guidelines from Vercel Engineering |
| `apply-prettier` | Format named or changed files with the project's Prettier |
| `apply-style-guide` | Apply a repo style guide, or Google's language guide if none |
| `create-commit` | Conventional commit messages, staging, and `/commit` workflows |
| `develop-with-tdd` | Write the failing test first, then the implementation |
| `feature-sliced-design` | Feature-Sliced Design (FSD) v2.1 frontend architecture from [fsd.how](https://fsd.how) |
| `find-skills` | Discover and install skills from the open agent skills ecosystem |
| `fix-lint` | Fix Biome or ESLint issues on named or changed files |
| `grill-me` | Interview before any feature, fix, or adjustment; skip questions-only |
| `review-code` | Two-axis review of changes against repo standards and the originating spec |
| `show-skill-catalog` | List the skills in this pack and recommend which one to use |
| `use-hybrid-folder-structure` | Refactor a frontend onto a hybrid (responsibility + feature) folder layout |
| `write-e2e-tests` | Write e2e tests for files you name |
| `write-handoff` | Compact the current conversation for another agent to continue |
| `write-storybook` | Write Storybook stories for named components |
| `write-unit-tests` | Write unit tests for named units |

## License

MIT
