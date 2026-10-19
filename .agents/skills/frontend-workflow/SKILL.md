---
name: frontend-workflow
description: Guide frontend project setup, page implementation, Auth mock testing, API contract checks and FE/BE integration for User Management tasks.
---

# Frontend Workflow — setup to integration

Run when asked to prepare, implement or validate a Frontend feature. Report the phase completed and the blockers; do not assume the application is already runnable.

## 0. Locate roots & read the authority
1. Confirm own repo is `user-management-frontend`. Find sibling Contract at `../user-management-contract/`; when started at Workspace root use `repos/user-management-contract/`. If missing, stop and ask to run Workspace init.
2. Read Contract `docs/aa/README.md`, `docs/aa/decisions.md`, `docs/ui-structure.md`, `docs/ui-guidelines.md`, `docs/aa/auth-design.md`, `docs/aa/mock-fixtures.md`, `docs/aa/integration-test-plan.md`, and `docs/governance/git-workflow.md`.
3. Read own `docs/aa/README.md`, `CONTRIBUTING.md` and `contract.sha`. Confirm Backend's contract.sha equals own. **Use OpenAPI at pinned commit** for actual generated types; current Contract dev head is not automatically approved.

## 1. Project setup — only when requested
- Inspect existing `package.json`, `src/app`, `src/features`, `src/shared/ui`, `src/shared/api`. This repo initially contains type generation tooling and placeholders, not a full app.
- Check decisions for React/TypeScript tooling, UI library, tokens, routing, auth storage, error UX. If unresolved, propose options to AA/FE lead; do not silently choose.
- Once stack is approved, scaffold without overwriting existing tracked work. Preserve Auth/User/Permission feature folders and shared UI/API boundaries.
- Run `npm install` and `npm run contract:generate` only when dependencies/environment allow. Inspect generated schema; **do not hand-edit it**.

## 2. Implement assigned screen
- A=Auth, B=User, C=Permission. Map REQ ID → UI ID → route → OpenAPI operation; use `docs/aa/screen-handoff.md`.
- Reuse shared layout/Form/Table/Modal, shared typed API client and unified loading/empty/error/forbidden UX.
- Do not invent request fields, JWT claims or `GET /auth/me`; propose Contract PR first when the design is insufficient.

## 3. Login-required pages before Auth is ready
- Define a shared Auth state/provider interface with a test-only Mock adapter and later Real adapter.
- Mock Guest/USER/ADMIN/expired/inactive states from Contract's `docs/aa/mock-fixtures.md`. Use MSW or another approved mock approach for HTTP responses matching **pinned OpenAPI**.
- Verify guest redirect, USER access, ADMIN-only pages, expired 401 and 403 UX. Mock UI is **not** server-side authorization.
- Restrict Mock to test/dev environment and verify it cannot be enabled in release build.

## 4. Test and integrate
- Run relevant lint/typecheck/unit tests **if scripts exist**, otherwise report missing scripts without claiming success.
- Coordinate A's real Auth endpoint and B/C API, then test Mock disabled with real Backend and same contract.sha.
- Execute G1→G4 and TC-INT cases from Contract integration plan; include failing cases and E2E evidence.

## 5. Git & result
- Do not commit feature changes in Workspace root; use FE repo feature branch from `dev`, PR to `dev`. Do not push/merge without instruction.
- Report REQ/UI/TC IDs, approved Contract SHA, touched files, tests run/pass/fail/not run, blocked decisions and Backend PR link.
