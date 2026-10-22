---
name: test-frontend-integration
description: Verify real Frontend-to-Backend API and Auth/User/Permission flows without MSW, distinguishing G1 Mock UI tests from G3/G4 integration.
---

# Test Frontend Integration

## Trigger and test environment

Run when a user requests real FE/BE integration validation, authentication/role E2E, or evaluation of whether screen flows work against the running Spring Boot Backend. **Verification only by default**; write new tests or fixtures only if explicitly requested. Never test on production with destructive user mutations or unknown accounts.

## Execution

1. Read **the entire Frontend `design.md` before any UI or browser-flow work**; also `AGENTS.md`, `docs/aa/user-flows.md`, `docs/aa/screen-handoff.md`, `docs/implementation-status.md`, Contract `docs/aa/integration-test-plan.md`, `docs/aa/mock-fixtures.md`, `docs/aa/auth-design.md`, `docs/aa/decisions.md`.
2. Verify Frontend and Backend `contract.sha` are **identical valid approved SHA**. Resolve OpenAPI from that commit; do not replace it with moving dev. Verify the Backend actually implements Auth, User, Permission API operations. Initial repo is a scaffold with real business APIs **not implemented**; mark blocked and never claim successful real integration from its Mock routes.
3. Verify test-only H2 data/accounts and nonproduction JWT issuance exist, and the Backend is a local isolated test instance. Do not use personal accounts/real secrets. **Disable MSW**: `VITE_ENABLE_MOCKS=false` for actual integration; record `import.meta.env.DEV` gating and absence of mock interceptors. No forged unsigned mock token counts as a real JWT.
4. If environment is available, exercise actual login→profile, signup→login, USER admin forbidden (both FE guard and Backend HTTP 403), ADMIN user list/detail, role update reflected in next protected request, inactivity/withdrawal, token expired/revoked/logout, error/loading/empty UI, and reload/session state. Link to Contract TC-INT-001..012.
5. Use existing Playwright tests **only if configured for real Backend and Mock disabled**. Current `npm run test:e2e` uses `playwright.config.ts` setting `VITE_ENABLE_MOCKS=true`: that command is **G1 Mock only**; do not use it as G3/G4 evidence. Real integration needs an explicitly configured separate test environment/test and assertions.
6. For each scenario, record actual requests/status/schema/test fixture (redact JWT), FE/BE/Contract commits, PASS/FAIL/BLOCKED/NOT_RUN and frontend design/accessibility issues. **Backend authorization is authoritative**; hidden admin menus alone do not demonstrate access control.

## Output

```text
FE/BE/Contract SHA + test environment and Mock flag:
Real Backend Auth availability: READY | NOT_IMPLEMENTED | UNKNOWN
TC-INT scenario matrix: PASS | FAIL | BLOCKED | NOT_RUN
Gates: G1 (Mock) vs G3/G4 (Real), only verified gates marked PASS
Evidence: test names, commands, HTTP status, CI logs (if checked)
Blocking Backend API/Fixture/AA decisions and next steps
```
