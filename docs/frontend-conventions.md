# Frontend 코드 구조 및 네이밍 규칙

**적용 범위:** 이 Repository의 React / TypeScript / CSS Modules / 테스트. A(Auth), B(User), C(Permission)가 같은 규칙으로 독립 구현할 수 있도록 하는 **Frontend 구현 규칙**입니다. 화면 IA·URL·REQ/UI ID·OpenAPI·도메인 소유권의 정본은 Contract이며 이 문서로 변경하지 않습니다.

## 디렉터리 경계

```text
src/
├── app/                      # 앱 초기화·Router·공통 Layout·Provider (공동 변경 시 리뷰)
│   ├── router/
│   ├── layouts/
│   └── providers/
├── features/
│   ├── auth/                 # A: 로그인·로그아웃·비밀번호
│   │   ├── pages/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api/
│   │   └── types/
│   ├── user/                 # B: 가입·프로필·사용자 관리 (같은 하위 규칙)
│   └── permission/           # C: Role·사용자 권한 (같은 하위 규칙)
└── shared/
    ├── api/                  # 공통 HTTP Client / OpenAPI 생성 타입
    │   └── generated/
    ├── ui/                   # 재사용 가능한 비즈니스 비종속 UI·스타일 토큰
    ├── hooks/                # 도메인 비종속 Hook
    ├── utils/
    └── mocks/                # 개발/테스트 전용 MSW
```

- 실제로 사용하는 폴더만 생성합니다. 빈 하위 폴더를 위해 파일을 만들지 않습니다.
- `pages/`는 **라우트에 직접 연결되는 최상위 화면**, `components/`는 해당 도메인 내부 UI 조각입니다.
- `hooks/`는 재사용 가능한 도메인 동작 및 TanStack Query Hook, `api/`는 OpenAPI 기반 요청 함수, `types/`는 **UI 전용 파생 타입**만 둡니다.
- `app/`은 조립·라우팅·Provider·Shell만 담당합니다. 도메인 화면의 본문/비즈니스 로직을 App에 작성하지 않습니다.
- 도메인 A/B/C 간 다른 `features/`의 내부 파일을 직접 import하지 않습니다. 진짜 공유 기능은 `shared/`로 추출하거나 도메인 간 공개 계약을 AA/FE 리드와 합의합니다.
- `shared/`는 `features/`를 import하지 않습니다. 순환 의존성을 만들지 않습니다. 공통 UI에 도메인 명칭·API를 끼워 넣지 않습니다.
- `src/shared/api/generated/`는 `contract.sha`의 승인 OpenAPI로 생성하고 **직접 수정하지 않습니다**. 임의 요청/응답 DTO를 별도로 발명하지 않습니다.
- `shared/api`가 HTTP·인증 헤더·공통 에러 처리를 담당하고, 각 `features/<domain>/api`는 업무 endpoint 호출을 캡슐화합니다. 서버 상태는 TanStack Query, 화면 내부 상태는 React State를 우선합니다.

## 이름 규칙

| 대상 | 형식 | 예시 |
|---|---|---|
| 디렉터리 | 소문자 `kebab-case` | `user-profile/` |
| React 화면/컴포넌트 파일 및 컴포넌트 | `PascalCase` | `UserListPage.tsx`, `UserTable.tsx` |
| 라우트 화면 | `<Purpose>Page` 접미사 | `ChangePasswordPage` |
| Custom Hook | `use` + PascalCase | `useUserList.ts` |
| API 모듈 | `camelCase` + `Api.ts` | `userApi.ts` |
| 일반 유틸 파일 | `camelCase.ts` | `formatUserStatus.ts` |
| TypeScript 타입 / Interface / Context / Provider | `PascalCase` | `UserSearchParams`, `AuthProvider` |
| UI 전용 타입 파일 | `camelCase.types.ts` | `user.types.ts` |
| 변수 / 함수 | `camelCase` | `fetchUserList` |
| 고정값 상수 | `UPPER_SNAKE_CASE` | `DEFAULT_PAGE_SIZE` |
| Boolean | `is/has/can/should` 접두사 | `isLoading`, `canEdit` |
| 내부 이벤트 핸들러 / Callback Props | `handleX` / `onX` | `handleSubmit` / `onSubmit` |
| CSS Module 및 클래스 | `<Component>.module.css` / `camelCase` | `UserTable.module.css`, `.tableHeader` |
| 테스트 | `<Target>.test.ts(x)` | `UserTable.test.tsx` |
| UI 라우트 URL | Contract 화면 IA의 경로, 신규 시 `kebab-case` | `/settings/password` (이미 승인된 경로 유지) |
| 기능 브랜치 | `feat/<domain>-<task>` | `feat/auth-login` |

추가 규칙:
- 컴포넌트·Hook·API 함수는 파일 단위로 명시적 named export를 우선합니다. `index.ts` barrel은 공개 진입점이 필요할 때만 추가합니다.
- 테스트는 대상 파일 옆에 두거나 해당 도메인의 `__tests__`에 두되 팀에서 한 방식으로 통일합니다. 이 PoC에서는 **대상 파일 옆**을 기본으로 합니다.
- React Props 타입은 `<Component>Props`, 서버 전송 데이터는 **생성된 OpenAPI 타입**을 참조합니다.
- Union Type을 우선 고려하며, `enum` 도입은 실제 런타임 객체가 필요한 경우에 한정합니다.
- 파일명 대소문자 변경은 Linux CI를 기준으로 확인합니다. 파일 이동 시 모든 import·test·Mock 참조를 갱신합니다.
- URL / HTTP 메서드 / 상태코드 / 필드명은 네이밍 취향으로 수정하지 않고 Contract PR을 선행합니다.

## 작업 및 검증

1. 구현 전 `design.md`, `AGENTS.md`, Contract의 UI/요구/승인 OpenAPI를 확인합니다.
2. 담당 도메인 폴더에서만 작업하고 `app/` 또는 `shared/` 수정이 필요하면 다른 담당자에게 영향도를 알립니다.
3. UI ID와 React Page, Contract API, TC를 명시적으로 연결합니다. Mock 결과와 실제 FE/BE 통합 결과를 구분합니다.
4. PR에서 `npm run typecheck`, `npm run test`, `npm run build` 및 관련 CI를 확인합니다. 기존 파일 이동은 import 오류와 라우트 스모크 테스트를 포함해 검증합니다.
