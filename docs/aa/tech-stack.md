# Frontend 기술 스택 및 초기 구성 기준 (Accepted)

**상태: Accepted PoC 스택. Frontend Scaffold 파일 생성됨 / GitHub Actions 빌드·테스트 성공.** 공통 기술 스택의 정본은 sibling Contract의 `../user-management-contract/docs/aa/tech-stack-proposal.md`입니다. 기술 선택은 Contract DEC-004 기준으로 확정됐습니다.

## 추천
| 계층 | 기술 | 이유 |
|---|---|---|
| Framework | React + TypeScript + Vite | 단일 SPA, 빠른 개발·빌드, 팀원 공통 타입 |
| Router | React Router | 로그인/일반/ADMIN 경로·중첩 레이아웃 |
| API Query | TanStack Query | 서버 상태·캐시·재조회·로딩/에러 통일 |
| API Type | 기존 `openapi-typescript` | 고정 `contract.sha`의 OpenAPI에서 타입 생성 |
| API Client | 브라우저 `fetch` 래퍼(우선) | 공통 base URL, Authorization, 401/403/ApiError |
| CSS | **CSS Modules + `design.md`의 CSS Custom Properties** | 도메인별 스타일 충돌/중복 감소, 최소 의존성 |
| Form | React Hook Form + Zod (필요 시 팀 합의) | 폼 유효성 복잡도 높아질 때만 추가 |
| Mock | MSW | HTTP 경계에서 승인 API Contract 기반 Mock, 개발/테스트 전용 |
| Unit UI test | Vitest + React Testing Library | 화면·컴포넌트·Auth Guard 단위 검증 |
| E2E | Playwright | 실제 Auth 연결 후 가입/로그인/권한 등 G4 검증 |
| 패키지 | 기존 `npm` 스크립트 유지, Node LTS | 기존 계약 생성 도구 재사용. Node 22.12+ 권장 |

## 디자인 기준은 선택사항이 아님

실제 CSS·Button/Card/Input/Table/Modal, 테마·반응형은 **Frontend 루트 [design.md](../../design.md)를 구현 전 반드시 확인**합니다. CSS Modules는 스타일 격리 수단이지 별도 디자인 시스템이 아닙니다. Tailwind, MUI, Chakra, shadcn/ui 등을 추가 도입하려면 DEC-004와 공통 컴포넌트·디자인 토큰 정합성부터 재검토합니다.

## 초기 디렉터리 목표와 생성된 구조

```text
src/
├── app/
│   ├── providers/       # Query/Auth/Router Provider
│   ├── router/          # Guest/USER/ADMIN Route & Screen IA
│   └── layouts/         # Shared App Shell
├── features/
│   ├── auth/            # 개발자 A
│   ├── user/            # 개발자 B
│   └── permission/      # 개발자 C
└── shared/
    ├── api/             # OpenAPI generated 타입 + 단일 API Client
    │   └── generated/
    ├── ui/              # 디자인 공통 컴포넌트 / 토큰 / CSS
    └── mocks/           # MSW 테스트/개발 전용 Fixture (AA 기준에 따라)
```

React Router/Query/공통 Button/토큰/Mock Route 골격이 생성됐습니다. 상세 도메인 기능은 A/B/C 구현 대상입니다.

## 구현 순서
1. Contract 공통 `docs/aa/README.md`, `docs/aa/decisions.md`, `docs/aa/tech-stack-proposal.md`와 Frontend `design.md` 읽기
2. DEC-004(스타일/컴포넌트/라이브러리), DEC-001/009(인증 상태/Role) 및 공통 Shell 검토
3. Vite TS 기반 앱(이미 기본 골격 생성) + 기본 Router + QueryClient + `design.md` Token/CSS Modules + 공통 UI 구현
4. `npm install`, `npm run contract:generate`로 승인 SHA 타입 생성
5. MSW Guest/USER/ADMIN Fixture + AuthProvider Mock/Real Adapter 분리
6. A/B/C 개별 화면 구현. Mock만으로 완료 판단 금지: Real Auth G3, E2E G4 실시

## 검증/개발 주의
- `npm run test`, `npm run typecheck`, `npm run build`, `npm run test:e2e`가 있으며 GitHub Actions의 Mock UI G1 테스트가 통과했습니다. G3/G4 실제 Auth/E2E는 미구현.
- `GET /auth/me`, JWT Role Claims는 현재 Contract에 없는 것으로 간주; Contract 변경 PR 승인 전 임의 사용 금지.
- 개발 Proxy/환경별 API Base URL은 앱 골격 구성 시 결정. 환경별 URL/Secret을 클라이언트 소스에 하드코딩하지 않음.
- 명시적 승인 없이 기존 `contract.sha`를 바꾸거나 사용자의 기존 브랜치를 변경하지 않음.
