# Plan: Staged Introduction of Prettier

## Goal
Introduce Prettier in controlled stages to improve consistency and readability while minimizing risk and review churn.

## Constraints and Decisions
- Scope starts with JavaScript and MJS files only.
- CI should be advisory first (no failing gate initially).
- Existing project convention remains 4-space indentation.
- Reference context from GCHQ Bailo config:
  - https://github.com/gchq/Bailo/blob/main/.prettierrc.json
- Bailo config is context only, not a direct copy, because this repository has different established conventions.

## Desired End State
- Formatting is deterministic and automated.
- Developers no longer spend time on manual style fixes.
- Formatting checks are integrated in CI once baseline adoption is stable.

## Staged Rollout

### Stage 0: Baseline Assessment
- Inventory current style enforcement in ESLint and build workflows.
- Identify style rules that would overlap with Prettier.
- Confirm file-scope boundaries for the first adoption wave.
- Verify `.editorconfig` alignment (the repo already defines 4-space indent, UTF-8, LF line endings, and trailing-whitespace trimming — Prettier respects these).

Deliverable:
- Agreed compatibility matrix between current style rules and target Prettier behavior.

### Stage 1: Tooling Introduction (No Enforcement)
- Add Prettier configuration with project-aligned settings.
  - `tabWidth: 4` (matches `.editorconfig` and ESLint `indent` rule).
  - `semi: true` (matches ESLint `semi: ["error", "always"]`).
  - `singleQuote: false` (matches ESLint `quotes: ["error", "double"]`).
  - `endOfLine: "lf"` (matches ESLint `linebreak-style` and `.editorconfig`).
  - `bracketSpacing: true`, `trailingComma` — decide based on Stage 0 findings.
- Create `.prettierignore` for generated/vendor/legacy paths (e.g. `build/`, `src/core/vendor/`, `node_modules/`).
- Add npm scripts: `"format": "prettier --write"` and `"format:check": "prettier --check"` scoped to `src/**/*.{js,mjs}`.
- Add `eslint-config-prettier` as a dev dependency and extend it in `eslint.config.mjs` to disable stylistic rules that conflict with Prettier.

Deliverable:
- Local formatting commands available for contributors.

### Stage 2: Advisory CI Signal
- Add a `format:check` step in CI workflows (`pull_requests.yml`, `master.yml`) using `npm run format:check`.
- This step should use `continue-on-error: true` so it is advisory / non-blocking.
- Keep existing `npx grunt lint` and test gates as the only blockers.
- Track repeated advisory failures to identify friction points.

Deliverable:
- CI visibility into formatting drift without impacting merge flow.

### Stage 3: Baseline Reformat (Formatting-Only Change Set)
- Run a one-time repository formatting pass for the approved scope.
- Keep this isolated from functional code changes.
- Validate behavior with lint/tests after the formatting pass.
- Add a `.git-blame-ignore-revs` file listing the formatting commit hash, so `git blame` skips the mass-reformat.

Deliverable:
- Clean formatting baseline with low-risk review profile.

### Stage 4: Enforcement
- Promote format-check to blocking CI after baseline is merged and stable (remove `continue-on-error`).
- Remove or disable ESLint stylistic rules now handled by Prettier (indent, quotes, semi, brace-style, comma-spacing, space-in-parens, array-bracket-spacing, block-spacing, key-spacing, no-trailing-spaces, eol-last, etc.). This is required, not optional — keeping them causes contradictory errors.
- Confirm `eslint-config-prettier` is active so any remaining conflicts are suppressed.
- Keep semantic and quality lint rules intact.

Deliverable:
- Prettier becomes the source of truth for formatting.

### Stage 5: Optional Scope Expansion
- Evaluate JSON/YAML/Markdown formatting only after JS/MJS rollout has stabilized.
- If expanded, do so in a separate formatting-only pass.

Deliverable:
- Broader formatting consistency with controlled change size.

## Verification Criteria Per Stage
- Lint and tests continue to pass.
- No functional changes mixed into formatting-only stages.
- CI behavior matches current stage policy (advisory vs blocking).
- Contributor workflow documentation stays aligned with stage behavior.

## Editor Integration
- Add `.vscode/settings.json` recommendations: default formatter set to Prettier, format-on-save enabled for JS/MJS.
- This can land alongside Stage 1 or Stage 3.

## Plan Maintenance
- After completing each stage, update this plan to reflect the actual work done, decisions made, and any new insights.
- Record deviations from the original plan and the reasoning behind them.
- This keeps the plan a living document that accurately guides subsequent stages.

## Ownership Notes
- Commits and pushes are performed by the repository maintainer.
- This plan defines sequence and outcomes, not commit mechanics.
