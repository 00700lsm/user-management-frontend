# Claude Code — Frontend

Read `AGENTS.md` and **the complete `design.md` before any UI/component/CSS work**. Read the Contract sibling and use the OpenAPI pinned by `contract.sha`.

Invoke a specific skill for the requested work:
- `/implement-ui-screen`: implement an approved UI ID/route with tests
- `/create-shared-ui-component`: create reusable CSS-Module components
- `/validate-frontend-ui`: audit design tokens, TypeScript, tests, build, G1 Mock UI
- `/test-frontend-integration`: verify real Frontend–Backend/Auth integration (MSW off)

Each adapter in `.claude/skills/<name>/SKILL.md` references the canonical `.agents/skills/<name>/SKILL.md`. Rules apply even when no skill is explicitly called. Never silently update the Contract SHA, branches or Git remote; never claim mock tests are real Backend E2E.
