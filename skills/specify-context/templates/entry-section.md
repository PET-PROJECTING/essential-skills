## Application Building Context

Context files live in `{{CONTEXT_ROOT}}/`. Feature units live in `{{CONTEXT_ROOT}}/{{SPECS_DIR}}/`.

Read the following files in order before implementing or making any architectural decision:

1. `{{CONTEXT_ROOT}}/project-overview.md` — product definition, goals, features, and scope
2. `{{CONTEXT_ROOT}}/architecture.md` — system structure, boundaries, storage model, and invariants
3. `{{CONTEXT_ROOT}}/ui-context.md` — theme, colors, typography, and component conventions
4. `{{CONTEXT_ROOT}}/code-standards.md` — implementation rules and conventions
5. `{{CONTEXT_ROOT}}/ai-workflow-rules.md` — development workflow, scoping rules, and delivery approach
6. `{{CONTEXT_ROOT}}/progress-tracker.md` — current phase, completed work, open questions, and next steps

Start from `{{CONTEXT_ROOT}}/{{SPECS_DIR}}/00-build-plan.md`, then the unit spec for the current work.

Update `{{CONTEXT_ROOT}}/progress-tracker.md` after each meaningful implementation change.

If implementation changes the architecture, scope, or standards documented in the context files, update the relevant file before continuing.
