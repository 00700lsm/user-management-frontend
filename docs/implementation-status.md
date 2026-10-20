# Frontend Skeleton 상태

## 준비됨
- React 19/TypeScript/Vite + React Router 7 + TanStack Query 초기 앱
- Frontend `design.md` 색상·레이아웃 CSS Custom Properties와 CSS Modules Button
- Route: Login/Signup/Profile/Admin User List, 나머지는 명시적 미구현 Placeholder
- `sessionStorage` 기반 Token/Role UI 상태, 라우트 가드(보안 아님)
- API fetch 공통 401·403 처리, 개발 전용 MSW Guest/USER/ADMIN 예시
- Vitest Button 단위 테스트·Playwright 개발 전용 Mock 라우트 테스트 초안

## 아직 구현되지 않음
- 실제 Spring Boot Auth 로그인/JWT/Logout, Signup, Profile Edit, Admin CRUD, Permission
- G2 Runtime Contract, G3 Real Auth, G4 실제 E2E 검증
- Mock 로그인은 **서명된 Token이 아니라 DEV UI Fixture**. 배포 빌드에서 Mock 사용 금지.
- 실제 서버에 연결된 기능이 없어 로그인/가입은 현재 동작하지 않거나 실패할 수 있습니다.
- Gradle/JPA는 Backend 별도 프로젝트에 있음.

## 시작 방법 (Node 24 권장, 네트워크 필요)

```bash
npm install
npm run contract:generate
npm run mocks:init
cp .env.example .env.local
# .env.local에서 VITE_ENABLE_MOCKS=true (개발만)
npm run dev
```

프로덕션 Build는 prebuild로 승인된 Contract 타입을 재생성합니다.

별도 Terminal에서 `npm run test`, `npm run typecheck`, `npm run build`. Playwright 브라우저 설치 후 `npm run test:e2e`는 **Mock UI 라우트 테스트만** 실행합니다.

`npm run contract:generate`는 `contract.sha`에 고정된 원격 OpenAPI를 다운로드하므로 GitHub 네트워크 접근이 필요합니다.


## GitHub Actions 검증 결과 (2026-10-20)

- [Frontend main CI](https://github.com/00700lsm/user-management-frontend/actions/runs/39346999583): Node 24/npm 11 환경 의존성 설치, pinned OpenAPI 타입 생성, TypeScript 검사, Vitest, Vite production build 및 Playwright Mock UI Smoke **성공**.
- [Contract type generation](https://github.com/00700lsm/user-management-frontend/actions/runs/39346999603): **성공**.
- Browser Mock 테스트는 **G1** 수준입니다. 실제 Backend 인증·회원가입·CRUD 및 G3/G4 E2E는 별도 기능 개발과 통합 검증이 필요합니다.
- Node 22의 npm 10.9.x는 특정 Vitest/Vite peer 의존성 조합에서 npm 내부 `edgesOut` 오류가 발생했습니다. **Node 24/npm 11 사용을 권장**합니다.

## GitHub Actions 검증 (2026-10-20)

- Frontend Build + MSW G1 Mock UI: [성공](https://github.com/00700lsm/user-management-frontend/actions/runs/39346999583)
- 승인 OpenAPI 타입 생성: [성공](https://github.com/00700lsm/user-management-frontend/actions/runs/39346999603)
- **실제 Backend Auth/DB/API를 이용한 G3/G4 E2E는 미구현입니다.**
