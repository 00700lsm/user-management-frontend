# User Management Frontend (PoC)

공통 Shell/Design System 위에 **Auth / User / Permission 화면 모듈**을 구성합니다.

- API 계약 정본: https://github.com/00700lsm/user-management-contract/blob/main/openapi.yaml
- AA 화면 IA: https://github.com/00700lsm/user-management-contract/blob/main/docs/ui-structure.md
- UI 공통 기준: https://github.com/00700lsm/user-management-contract/blob/main/docs/ui-guidelines.md
- Backend: https://github.com/00700lsm/user-management-backend

| 개발자 | Frontend 화면 | 같은 개발자의 Backend |
|---|---|---|
| A | 로그인/비밀번호 | Auth |
| B | 가입/프로필/사용자 관리 | User |
| C | Role 목록/사용자 권한 | Permission |

디자인/레이아웃 중복을 막기 위해 공통 UI는 `src/shared/ui`, API 접근 계층은 `src/shared/api`에 둡니다. 화면별 기능 모듈에서 **직접 임의의 API 스키마를 정의하지 않습니다.**

기술 스택은 **React 19 + TypeScript + Vite 8 + React Router + TanStack Query + CSS Modules**로 확정됐습니다. 라우터/디자인/Mock 기반 **실행 골격은 생성됐지만**, 업무 기능과 실제 Auth API는 아직 구현 전입니다.

## AA 설계 인계

[Frontend AA 인계서](docs/aa/README.md)에 화면 ID·경로·API 연계, 사용자 흐름, 공통 UI 품질 체크리스트가 있습니다. 요구/IA/OpenAPI 정본은 Contract 저장소를 참조합니다.

## AI Agent 개발 스킬

- [Frontend 단계별 스킬](.agents/skills/frontend-workflow/SKILL.md): 프로젝트 초기화·공통 Contract 확인·화면 개발·Mock Auth·실제 통합·테스트·PR
- [Claude Code용 스킬](.claude/skills/frontend-workflow/SKILL.md)
- [공통 스킬 작성 가이드](https://github.com/00700lsm/user-management-contract/blob/dev/docs/governance/agent-skills-guide.md)

Sibling Contract 경로는 `../user-management-contract`입니다. 인증 정책·Mock Fixture·테스트 계획은 Contract 문서가 정본이며 API 타입은 `contract.sha`로 고정합니다.

## 필수 화면·CSS 디자인 기준

**[design.md](design.md)** — 모든 Frontend 화면/컴포넌트/CSS 구현 전 반드시 확인하는 디자인 시스템입니다. 버튼·입력창·카드·테이블·모달·공통 레이아웃·반응형·색상 토큰·화면별 템플릿을 정의했습니다.

- 공통 업무·화면 IA 및 UI 원칙은 **Contract 저장소**의 문서를 우선합니다.
- 구체 시각 스타일/컴포넌트 기준은 이 저장소의 `design.md`를 따릅니다.
- Cursor: `.cursor/rules/frontend-design.mdc` (alwaysApply), 기타 Agent: `AGENTS.md` / `CLAUDE.md` / Frontend Workflow Skill에서 필수 참조합니다.
- PoC의 `design.md` 비주얼 토큰/CSS Modules 기준은 Contract DEC-004에서 Accepted됐습니다.

## Frontend 기술 스택 (PoC Accepted)

[Frontend 기술 스택 / 초기 디렉터리 제안](docs/aa/tech-stack.md): React + TypeScript + Vite, React Router, TanStack Query, CSS Modules(`design.md` 토큰), MSW + Vitest + Playwright. 기존 OpenAPI 타입 생성 스크립트 재사용. 실제 애플리케이션 골격과 package.json은 추가됐습니다. 설치·빌드·서버 연동은 사용자의 개발환경에서 실행/검증이 필요합니다.

## 기본 앱 실행

```bash
npm install
npm run contract:generate
npm run mocks:init
cp .env.example .env.local
# 개발용 Mock 사용 시 .env.local 에 VITE_ENABLE_MOCKS=true
npm run dev
```

참고: [구현 상태](docs/implementation-status.md). H2 서버는 Backend Repo에서 별도로 실행합니다. `mocks:init`이 생성하는 공식 MSW Worker 파일은 Git 추적에서 제외됩니다.
