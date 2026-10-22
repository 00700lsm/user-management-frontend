---
name: create-shared-ui-component
description: Create or refactor reusable Frontend Button, Input, Card, Table, Modal or other shared components according to design.md and Contract UI rules.
---

# Create Shared UI Component

## Trigger / scope

Run on an **explicit request** to create, update or unify reusable components (Button, Input, FormField, Select, Card, Table, Pagination, Modal, StatusBadge, Toast, page Shell) in `src/shared/ui`. This is **source-changing** within the requested component scope. If only one page needs unique behavior, prefer `implement-ui-screen` instead.

## Preconditions

1. **Read the complete repository root `design.md` first, even for refactors.** Read Frontend `AGENTS.md`, `src/shared/ui/README.md`, `src/shared/ui/styles/tokens.css`, `src/shared/ui/styles/global.css`; then Contract `docs/ui-guidelines.md`, `docs/ui-structure.md`, `docs/aa/decisions.md`.
2. The accepted stack is React + TypeScript, **CSS Modules + `design.md` CSS custom-property tokens** (DEC-004). Do not add Tailwind/MUI/other UI frameworks or alter Contract IA without an approved design change. Missing Contract sibling or missing `design.md` means stop and report.
3. Inspect existing consumers and components. Decide public props (variant/size/disabled/loading/validation), keyboard behavior, and semantic HTML before implementation. Preserve existing callers or document planned migration.

## Execution

1. Define visual/behavior variants from `design.md`: heights, radius, spacing, typography, focus-visible ring, normal/hover/disabled/loading/error, mobile touch targets, accessible `aria-*` and required keyboard behavior.
2. Implement a reusable component and isolated `*.module.css` under `src/shared/ui/components/`; style with variables from `styles/tokens.css`. Do not duplicate shared design primitives in `src/features/*`, embed arbitrary Hex values, or break the existing Button contract.
3. For data components, handle empty/loading/error/pagination and accessible labels as applicable. For dialog, implement initial/focus-trap/restore, Escape behavior and confirm/cancel semantics; do not ship an inaccessible dialog.
4. Add targeted Vitest/Testing Library tests covering props, interaction and accessible states. Include at least one actual consuming page example or confirm real integration with current callers; do not claim all pages migrated if only the component exists.
5. Run `python3 scripts/check_design_tokens.py` (if Python available) to detect undefined CSS tokens; `npm run typecheck`, `npm run test`, `npm run build` when dependencies available. If visual browser test was not run, mark responsive/focus visual inspection `NOT_RUN`.
6. If component design differs from Contract common UI rules, propose AA/FE review first. Git commits/push/branch switches require separate explicit instruction.

## Required output

Component name + props/variants, affected screens/consumers, files and token changes, `design.md` checklist and any exception, test commands+exit codes, PASS/FAIL/NOT_RUN, accessibility/responsive checks, migration needed.
