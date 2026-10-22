---
name: implement-ui-screen
description: Implement or modify a specific approved User Management React screen by UI/REQ ID, route, and pinned OpenAPI while obeying design.md.
---

# Implement UI Screen

## Trigger, scope, inputs

Run on an **explicit request to implement or change** a particular Frontend screen, route, REQ/UI ID, form, data view, or end-user feature. This is a **source-changing** skill only for the requested scope.

Required input: UI ID, route, REQ ID or unambiguous screen description. If none can be resolved from Contract IA, stop and describe what is missing. Work in `user-management-frontend` only; find Contract in sibling `../user-management-contract` (from Workspace root: `repos/user-management-contract`).

## Always-read references, in this order

1. **Read the entire Frontend root `design.md` before changing any JSX, layout, UX, CSS or components.** Read the Contract `docs/ui-guidelines.md` and `docs/ui-structure.md`; approved AA rules have priority over visual details.
2. Read Frontend `AGENTS.md`, `docs/aa/screen-handoff.md`, `docs/aa/user-flows.md`, `docs/aa/tech-stack.md` and Contract `docs/requirements.md`, `docs/aa/decisions.md`, `docs/aa/traceability.md`.
3. Read `contract.sha` and the **OpenAPI at exactly this commit**, not latest Contract `dev`. If available locally, use `git -C ../user-management-contract show "$(cat contract.sha):openapi.yaml"`. Otherwise use the existing `npm run contract:generate` only when a network/dependency install is authorized and available. Generated types under `src/shared/api/generated/` are never hand-edited.

## Execution

1. Map `REQ → UI ID → route → API operation → permitted Role → planned TC`. A = Auth, B = User, C = Permission. Identify dependencies on real Backend APIs and blocked features.
2. Inspect existing `src/app/App.tsx`, `src/app/providers/AuthProvider.tsx`, `src/features/{auth,user,permission}/`, `src/shared/ui/`, `src/shared/api/`. Reuse the shared Shell, Button and other already available components instead of recreating styling per screen.
3. Implement the requested React screen with approved TypeScript/OpenAPI schemas and the shared API client/TanStack Query. Distinguish API 401, 403, validation, empty, loading and success states. Preserve React Router IA and guarded paths.
4. Apply the precise `design.md` standards for spacing, tokens, buttons/forms/cards/table/modal layout, responsive 1440/768/390px cases, keyboard focus and accessible labels. Use CSS Modules for screen-specific styling and shared tokens, no random Hex values.
5. Accepted DEC-009 permits JWT `sub` and `roles` claims for **UI display only**. The Backend MUST check current DB status/roles. **`GET /auth/me` is not in OpenAPI**; never invent new endpoints/fields. If a Contract change is needed, stop and request a Contract PR.
6. If real API is absent, implement the UI with Contract-shaped **dev/test MSW Mock** and mark its integration `BLOCKED`, not `DONE`. Mock USER/ADMIN permissions are not server authorization.
7. Add Vitest/React Testing Library tests for the requested screen and G1 Playwright flows if applicable. Run `npm run typecheck`, `npm run test`, `npm run build` when dependencies/network are available; report commands and exit codes. Run `npm run test:e2e` only after Playwright/MSW setup, and label it **G1 Mock**, not G4.
8. Do not change branches, pull, commit, push, merge, update `contract.sha`, or overwrite unrelated edits without separate user authorization.

## Required output

UI ID + route + owning developer, Contract SHA, changed files, screenshot/visual evidence when actually captured, `design.md` compliance or proposed exceptions, tests `PASS/FAIL/NOT_RUN` with commands, Backend/API missing prerequisites and the next integration gate.
