# Frontend Agent Guide

## Mandatory visual/CSS design gate

**For every screen, component, page layout, styling or CSS change, read the complete root `design.md` BEFORE implementation.** Follow its CSS tokens, buttons, cards, tables, forms, responsive layout and accessibility checklist. This applies even when the frontend-workflow skill is not invoked. Design exceptions require an explained review; Contract AA UI/IA requirements have higher authority. Cursor additionally uses `.cursor/rules/frontend-design.mdc`.

Work in the Frontend Git repository only. Do not commit application code to the Workspace root.

- Workflow Skill: `.agents/skills/frontend-workflow/SKILL.md`.
- Sibling Contract: `../user-management-contract`; from Workspace root: `repos/user-management-contract`.
- Before implementation read the Contract `docs/aa/README.md`, `docs/aa/decisions.md`, `docs/aa/auth-design.md` and `docs/governance/agent-skills-guide.md`.
- Use this repository's `contract.sha` and the matching committed OpenAPI for types/client, not latest Contract dev.
- A=Auth, B=User, C=Permission; each developer owns their domain FE and BE.
- When shared API/UI rules change, propose Contract PR first. Mock Auth is for tests only; do not invent response fields, JWT Role claims or GET /auth/me.
- Feature PRs target dev and each repository has independent Git history. No automatic pull, branch switch, commit or push.
