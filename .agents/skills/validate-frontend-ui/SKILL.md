---
name: validate-frontend-ui
description: Run read-only checks for design.md CSS-token compliance, TypeScript, unit tests, production build and G1 Mock UI smoke tests.
---

# Validate Frontend UI

## Trigger and limits

Run when a user requests a Frontend design-system audit, UI regression check, build verification, accessibility review or readiness report. **Read-only source and Git**. Test/build tools can create ignored outputs (`dist/`, `coverage/`, generated OpenAPI types), but never edit tracked source, reformat files, install dependencies without authorization or change branches.

## Execution

1. Read **the entire root `design.md`**, `AGENTS.md`, `docs/aa/ui-consistency-checklist.md`, Contract `docs/ui-guidelines.md` and `docs/ui-structure.md`; check the tested `contract.sha` and approved OpenAPI baseline.
2. Run the zero-dependency static CSS-token check from the Frontend root:
   ```bash
   python3 scripts/check_design_tokens.py
   ```
   This checks that each `var(--...)` used in `src/**/*.css` has a `--...` declaration in `src/shared/ui/styles/tokens.css`. It **does not** prove visual quality, WCAG compliance or rendered layout.
3. If `node_modules` and approved generated API types are present, run:
   ```bash
   npm run typecheck
   npm run test
   npm run build
   ```
   Note `prebuild` re-downloads the OpenAPI pinned by `contract.sha`; requires network. If unavailable or dependencies not installed, report `NOT_RUN` instead of silently downloading packages.
4. When Playwright Chromium and the official MSW worker are already installed, `npm run test:e2e` tests **G1 Mock UI smoke only**. Its webServer starts a local Vite server with mocks; record the environment and avoid labeling it a real Auth E2E.
5. Inspect pages/components against `design.md`: token usage; Button/Input/Card/Table/Modal variants, responsive desktop/tablet/mobile (1440/768/390px), loading/empty/403/error flows, keyboard labels/focus. These are qualitative checks—mark `NEEDS_REVIEW` or `NOT_RUN` without screenshots/browser evidence.
6. Identify UI IDs/REQs, list actual files, test commands+exit codes, CI runs **only if personally verified**. Do not treat Mock UI successful tests as Backend authorization coverage.

## Output

```text
Scope / branch / Contract SHA:
CSS token check: PASS | FAIL | NOT_RUN
Typecheck / unit / production build: PASS | FAIL | NOT_RUN
Browser G1 Mock smoke: PASS | FAIL | NOT_RUN
Design consistency + a11y + responsive: VERIFIED | NEEDS_REVIEW | NOT_RUN
Open UI/Contract defects and impacted screens:
Evidence: commands, exit codes, reports/screenshots/CI (only actual)
```
