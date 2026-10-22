# Frontend Repository — Agent Rules

This repository owns the React UI. Work and commit only within its Git repository, not the Workspace root.

## Mandatory design system — applies without invoking a Skill

**Before creating, changing or reviewing any Frontend page, layout, JSX component, CSS or UX, read the entire root `design.md`.** Follow its design tokens, typography, sizing, Button/Input/Card/Table/Modal states, layout rules, responsive behavior and accessible keyboard/focus patterns. Contract's `docs/ui-guidelines.md` and `docs/ui-structure.md` have higher authority than visual details. If rules conflict, stop and report the exception for AA/FE review. Cursor also applies `.cursor/rules/frontend-design.mdc`.

## Always-on development rules

- Source of truth: sibling `../user-management-contract`, or `repos/user-management-contract` from Workspace. Read its `docs/aa/README.md`, `docs/aa/decisions.md`, `docs/ui-structure.md`, `docs/ui-guidelines.md` and affected REQ/UI/API/TC materials.
- External HTTP contract: the committed `openapi.yaml` **at this repository's `contract.sha`**, not the moving Contract `dev` branch. Never hand-edit `src/shared/api/generated/` or add unapproved API endpoints.
- Stack **Accepted DEC-004**: React + TypeScript + Vite + React Router + TanStack Query + CSS Modules + `design.md` CSS tokens. Test with MSW (dev/test only), Vitest and Playwright. Read `docs/aa/tech-stack.md` before major dependency changes.
- Owners: A=Auth, B=User, C=Permission; each owns FE + matching BE. Shared UI in `src/shared/ui`, API/client in `src/shared/api`; reuse before adding new styling.
- Accepted DEC-009: JWT `sub` and `roles` support client-side navigation display only. The Backend must verify roles/account status. `GET /auth/me` does **not** currently exist in OpenAPI; use Contract PR if genuinely required.
- Auth Mock via MSW and unsigned dev-only tokens **never proves real security** and must remain disabled for production. Distinguish G1 Mock UI and G3/G4 real FE/BE integration.
- Do not pull, checkout, reset, commit, push or merge without an explicit authorized task. Report actual `PASS/FAIL/NOT_RUN/BLOCKED`, Contract SHA and affected UI/REQ.

## Explicit callable Frontend Skills

- `.agents/skills/implement-ui-screen/SKILL.md`: implement a particular approved screen and tests (source-changing)
- `.agents/skills/create-shared-ui-component/SKILL.md`: create/refactor shared UI components (source-changing)
- `.agents/skills/validate-frontend-ui/SKILL.md`: read-only UI, CSS token and build checks
- `.agents/skills/test-frontend-integration/SKILL.md`: verify real FE/BE Auth/API flows with Mock disabled (read-only by default)

Claude Code uses the same names through `.claude/skills/`. Do not add redundant all-purpose workflow skills.
