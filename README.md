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

## 디렉터리 및 네이밍 규칙

[Frontend 구현 컨벤션](docs/frontend-conventions.md)을 사용합니다. A/B/C 도메인은 `src/features/{auth,user,permission}/pages`에 화면을 배치하고, 내부 공통 요소는 해당 도메인의 `components`·`hooks`·`api`로 분리합니다. `src/app`은 앱 조립, `src/shared`는 진짜 공통 코드를 담당합니다. URL·API 계약 변경 권한은 이 문서에 없습니다.

## Frontend AI Agent Skills

상시 준수 규칙은 [AGENTS.md](AGENTS.md), 시각 디자인 기준은 **[design.md](design.md)**에서 관리합니다. 다음 Skill은 특정 작업을 요청할 때 명시적으로 사용합니다.

| Skill | 사용 시점 | 실행 범위 |
|---|---|---|
| [`prepare-contract-pr`](.agents/skills/prepare-contract-pr/SKILL.md) | 기능 PR을 보내기 직전 | 최신 Contract/dev 비교·영향 검토·안전한 pin 갱신·타입/빌드 테스트 결과 보고 |
| [`implement-ui-screen`](.agents/skills/implement-ui-screen/SKILL.md) | 로그인·프로필·관리자 등 특정 화면 개발 | React 화면·API 연결·테스트 작성 |
| [`create-shared-ui-component`](.agents/skills/create-shared-ui-component/SKILL.md) | Button/Input/Card/Table/Modal 공통화 | `src/shared/ui` 코드·스타일·테스트 작성 |
| [`validate-frontend-ui`](.agents/skills/validate-frontend-ui/SKILL.md) | CSS/디자인 일관성·빌드·테스트 점검 | 기본 읽기 전용 검사 |
| [`test-frontend-integration`](.agents/skills/test-frontend-integration/SKILL.md) | 실제 Backend와 Auth/Permission 연결 검증 | Mock 비활성 G3/G4 테스트 판정 |

Claude Code는 `.claude/skills/`에서 같은 이름으로 호출합니다. Cursor/Codex 등은 `.agents/skills/`를 사용합니다. 공통 Skill 작성 원칙은 [Contract 가이드](https://github.com/00700lsm/user-management-contract/blob/dev/docs/governance/agent-skills-guide.md)를 참조하세요.

디자인 Token 검사: `python3 scripts/check_design_tokens.py` (Python 표준 라이브러리, 별도 설치 불필요). 검사 스크립트는 실제 화면 캡처, 대비, 반응형, 접근성 테스트까지 보장하지 않습니다.

## 필수 화면·CSS 디자인 기준

**[design.md](design.md)** — 모든 Frontend 화면/컴포넌트/CSS 구현 전 반드시 확인하는 디자인 시스템입니다. 버튼·입력창·카드·테이블·모달·공통 레이아웃·반응형·색상 토큰·화면별 템플릿을 정의했습니다.

- 공통 업무·화면 IA 및 UI 원칙은 **Contract 저장소**의 문서를 우선합니다.
- 구체 시각 스타일/컴포넌트 기준은 이 저장소의 `design.md`를 따릅니다.
- Cursor: `.cursor/rules/frontend-design.mdc` (alwaysApply), 기타 Agent: `AGENTS.md` / `CLAUDE.md` / 각 작업별 Frontend Skill에서 필수 참조합니다.
- PoC의 `design.md` 비주얼 토큰/CSS Modules 기준은 Contract DEC-004에서 Accepted됐습니다.

## Frontend 기술 스택 (PoC Accepted)

[Frontend 기술 스택 / 초기 디렉터리 제안](docs/aa/tech-stack.md): React + TypeScript + Vite, React Router, TanStack Query, CSS Modules(`design.md` 토큰), MSW + Vitest + Playwright. 기존 OpenAPI 타입 생성 스크립트 재사용. 실제 애플리케이션 골격과 package.json은 추가됐습니다. GitHub Actions의 타입 검사·빌드·Mock UI 테스트가 통과했으며 실제 Backend 연동은 미구현입니다.

## 기본 앱 실행

```bash
npm install
npm run contract:generate
npm run mocks:init
cp .env.example .env.local
# 개발용 Mock 사용 시 .env.local 에 VITE_ENABLE_MOCKS=true
npm run dev
```

참고: [구현 상태](docs/implementation-status.md). H2는 Backend에 내장되어 별도 H2 서버가 필요하지 않습니다. `mocks:init`이 생성하는 공식 MSW Worker 파일은 Git 추적에서 제외됩니다.

## 로컬 실행 및 확인

**요구 환경:** Node.js 24/npm, Bash, 인터넷(패키지 설치·Contract SHA 다운로드). Workspace에서 실행한다면 `cd repos/user-management-frontend`로 이동합니다.

```bash
npm install
npm run contract:generate
npm run mocks:init
cp .env.example .env.local
npm run dev
```

개발용 화면만 확인하려면 `.env.local` 파일을 열어 `VITE_ENABLE_MOCKS=true`로 변경한 후 실행하세요. 브라우저에서 **http://localhost:5173/login**에 접속하고 **Mock USER / Mock ADMIN** 버튼으로 화면을 확인합니다.

- Mock은 개발 모드에서만 활성화되며 **서명된 JWT/실제 Backend 인증이 아닙니다.** `VITE_ENABLE_MOCKS=false`로 변경하면 `/api` 요청이 Vite Proxy를 통해 **http://localhost:8080**의 Backend로 전달됩니다. 변경 시 개발 서버를 재시작하세요.
- Backend 실제 Auth/업무 API는 아직 구현되지 않았으므로 Mock을 끄면 로그인·프로필·관리자 기능이 정상 동작하지 않을 수 있습니다.
- 확인 명령: `npm run typecheck`, `npm run test`, `npm run build`. 브라우저 Mock 테스트: `npx playwright install chromium` 후 `npm run test:e2e`.
- `npm run contract:generate`는 `contract.sha`에 고정된 OpenAPI 타입을 생성합니다. `mocks:init`은 공식 MSW Worker를 생성하며 해당 파일은 Git에서 제외됩니다.
