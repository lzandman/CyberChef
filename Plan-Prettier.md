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

#### Stage 0 — Completed Assessment

**File scope for first adoption wave (JS/MJS only):**

| Location | `.js` files | `.mjs` files | Total |
|---|---|---|---|
| `src/` | 5 | 644 | 649 |
| `tests/` | — | — | 202 (combined) |
| Root config files | 4 | 1 | 5 |
| **Total in scope** | | | **~856** |

Excluded directories: `src/core/vendor/`, `build/`, `node_modules/`.

**`.editorconfig` ↔ Prettier alignment (all confirmed compatible):**

| Setting | `.editorconfig` | Proposed Prettier | Aligned? |
|---|---|---|---|
| indent_style | `space` | (default) | Yes |
| indent_size | `4` | `tabWidth: 4` | Yes |
| charset | `utf-8` | N/A (Prettier respects editorconfig) | Yes |
| end_of_line | `lf` | `endOfLine: "lf"` | Yes |
| insert_final_newline | `true` | Prettier always adds | Yes |
| trim_trailing_whitespace | `true` | Prettier always trims | Yes |

**Proposed Prettier settings:**

| Prettier Option | Value | Source / Justification |
|---|---|---|
| `tabWidth` | `4` | `.editorconfig`, ESLint `indent` |
| `useTabs` | `false` | `.editorconfig indent_style: space` |
| `semi` | `true` | ESLint `semi: ["error", "always"]` |
| `singleQuote` | `false` | ESLint `quotes: ["error", "double"]` |
| `endOfLine` | `"lf"` | `.editorconfig`, ESLint `linebreak-style` |
| `bracketSpacing` | `true` | ESLint `block-spacing` / `array-bracket-spacing` (matches default) |
| `trailingComma` | `"all"` | Prettier default; not currently enforced by ESLint |
| `printWidth` | `120` | Not currently enforced; 120 is a reasonable default |

Note: Bailo config (`tabWidth: 2`, `semi: false`, `singleQuote: true`) differs on all major settings and was not used.

**ESLint stylistic rules — Prettier overlap (to be disabled via `eslint-config-prettier` in Stage 1):**

| ESLint Rule | Current Setting | Prettier Handles? | Notes |
|---|---|---|---|
| `indent` | `["error", 4, {...}]` | Yes | Direct overlap |
| `quotes` | `["error", "double", {...}]` | Yes | Direct overlap |
| `semi` | `["error", "always"]` | Yes | Direct overlap |
| `linebreak-style` | `["error", "unix"]` | Yes | Direct overlap |
| `brace-style` | `["error", "1tbs"]` | Yes | Direct overlap |
| `space-before-blocks` | `["error", "always"]` | Yes | Direct overlap |
| `block-spacing` | `"error"` | Yes | Direct overlap |
| `array-bracket-spacing` | `"error"` | Yes | Direct overlap |
| `comma-spacing` | `"error"` | Yes | Direct overlap |
| `comma-style` | `"error"` | Yes | Direct overlap |
| `computed-property-spacing` | `"error"` | Yes | Direct overlap |
| `no-trailing-spaces` | `"warn"` | Yes | Direct overlap |
| `eol-last` | `"error"` | Yes | Direct overlap |
| `func-call-spacing` | `"error"` | Yes | Direct overlap |
| `key-spacing` | `["warn", {"mode": "minimum"}]` | Yes | Current `"minimum"` allows alignment padding; Prettier uses strict spacing — behavioral change |
| `keyword-spacing` | `["error", {...}]` | Yes | Direct overlap |
| `no-whitespace-before-property` | `"error"` | Yes | Direct overlap |
| `operator-linebreak` | `["error", "after"]` | Yes | Prettier may wrap operators to line start; `eslint-config-prettier` disables |
| `space-in-parens` | `"error"` | Yes | Direct overlap |

**ESLint stylistic rules — NOT handled by Prettier (keep active):**

| ESLint Rule | Current Setting | Reason to Keep |
|---|---|---|
| `spaced-comment` | `["error", "always", {...}]` | Prettier does not format comment spacing |
| `unicode-bom` | `"error"` | Prettier does not enforce BOM policy |
| `no-multiple-empty-lines` | `["warn", {...}]` | Prettier only trims trailing blank lines at EOF; `eslint-config-prettier` restricts but keeps this rule |
| `camelcase` | `["error", {...}]` | Naming convention — not a formatting concern |

**ESLint semantic/quality rules (must remain untouched):**

`no-eval`, `no-implied-eval`, `dot-notation`, `eqeqeq`, `no-caller`, `no-extra-bind`, `no-unused-expressions`, `no-useless-call`, `no-useless-return`, `radix`, `no-unused-vars`, `no-empty`, `no-control-regex`, `require-atomic-updates`, `no-async-promise-executor`, `jsdoc/require-jsdoc`, `no-var`, `prefer-const`, `no-console`.

**CI current state:**

Both `pull_requests.yml` and `master.yml` run: `npx grunt lint` → `npm test` → `npm run testnodeconsumer`. No Prettier step exists yet. The `lint` Grunt task maps to `eslint`.

**Stage 0 decisions for Stage 1:**
- `trailingComma: "all"` — adopt Prettier default since no existing ESLint rule enforces trailing commas.
- `printWidth: 120` — adopt as a reasonable default; not currently enforced.
- `key-spacing` alignment padding (current `mode: "minimum"`) will be collapsed by Prettier — accepted as an intentional style normalization.

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

#### Stage 1 — Completed

**Files changed:**

| File | Purpose |
|---|---|
| `.prettierrc.json` (new) | Prettier config: `tabWidth: 4`, `useTabs: false`, `semi: true`, `singleQuote: false`, `endOfLine: "lf"`, `bracketSpacing: true`, `trailingComma: "all"`, `printWidth: 120` |
| `.prettierignore` (new) | Excludes `build/`, `src/core/vendor/`, `node_modules/` |
| `package.json` | Added `format` and `format:check` scripts scoped to `src/**/*.{js,mjs}`, `tests/**/*.{js,mjs}`, and `*.{js,mjs}`; added `prettier` and `eslint-config-prettier` to devDependencies |
| `eslint.config.mjs` | Imported `eslint-config-prettier` and appended it as the last config entry to disable conflicting stylistic rules |

**Scope note:** Format scripts also cover `tests/**/*.{js,mjs}` and root-level config files (`*.{js,mjs}`) beyond the originally-specified `src/` scope, since these files are in the Stage 0 inventory.

**Validation results:**

| Check | Result |
|---|---|
| `npx grunt lint` | Passed — all 5 ESLint targets clean |
| `npm test` | Passed — 243 Node API tests + 1935 operation tests |
| `npm run testnodeconsumer` | Failed (pre-existing Windows shell issue — uses `cp`, `rm -rf`, `mkdir` Unix commands) |
| `npm run format:check` | Functional — reports 797 files with style differences (expected; no formatting pass yet) |

**No deviations from plan.** All settings match the Stage 0 assessment. `eslint-config-prettier` is applied as the final config entry, which correctly overrides stylistic rules without touching semantic/quality rules.

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
