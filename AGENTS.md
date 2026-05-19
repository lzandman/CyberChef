# Agent Execution Guide for Prettier Rollout

Purpose: Define how AI agents should execute the Prettier rollout safely and consistently.

This file complements Plan-Prettier.md and does not duplicate rollout stages.

## Relationship to Plan-Prettier.md
- Plan-Prettier.md defines what to do and in what order.
- AGENTS.md defines how agents must perform each approved task.
- If there is conflict, sequencing comes from Plan-Prettier.md.

## Agent Scope Rules
- Work only on tasks explicitly requested for the current stage.
- Do not widen scope (file types, directories, or CI policy) without approval.
- Treat JS/MJS-first rollout as the default unless changed by maintainer direction.

## Change Hygiene
- Keep formatting-only edits separate from functional edits.
- Keep docs-only edits separate from tooling/CI edits when practical.
- Prefer small, reviewable diffs during advisory phases.

## Configuration Guardrails
- Preserve established repository conventions unless explicitly overridden.
- Ensure formatting settings align with `.editorconfig` and existing ESLint rules (4-space indent, double quotes, semicolons, LF line endings).
- Use Bailo Prettier config only as contextual reference, not as a direct template.
- When modifying `eslint.config.mjs`, only remove or disable stylistic rules — never remove semantic/quality rules (e.g. `no-eval`, `eqeqeq`, `no-unused-vars`).

## Key Repository Files
Agents should be aware of these files when executing tasks:
- `eslint.config.mjs` — ESLint flat config; contains ~20 stylistic rules that overlap with Prettier.
- `.editorconfig` — defines indent (4 spaces), charset (UTF-8), EOL (LF), trailing whitespace.
- `Gruntfile.js` — build orchestration; `lint` task runs ESLint.
- `.github/workflows/pull_requests.yml` and `master.yml` — CI pipelines.
- `package.json` — scripts and dependencies.

## Validation Commands
Agents must use these commands to verify changes (not custom alternatives):
- Lint: `npx grunt lint`
- Unit tests: `npm test`
- Node consumer tests: `npm run testnodeconsumer`
- Format check (once Stage 1 is complete): `npm run format:check`

## Safety and Validation
Before declaring a task complete, agents should:
- Run the relevant validation commands listed above for that task scope.
- Confirm no unintended behavior changes were introduced.
- Confirm CI intent is respected (advisory or blocking, per stage).
- Report exactly what changed and why.

## Escalation Conditions
Stop and ask for maintainer input if:
- A requested change conflicts with established code conventions.
- Scope expansion is needed to complete the task.
- CI behavior change is ambiguous for the current stage.

## Plan Maintenance
After completing a stage, agents must update `Plan-Prettier.md` to reflect:
- The actual work performed (files changed, settings chosen).
- Any deviations from the original plan and the reasoning behind them.
- New insights that affect subsequent stages.

## Reporting Format
Agent handoff should always include:
- Files changed.
- Purpose of each change.
- Checks run and outcomes.
- Any assumptions or decisions requiring maintainer confirmation.
