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

## 시작 방법 (Node 22.12+ 권장, 네트워크 필요)

```bash
npm install
npm run contract:generate
npm run mocks:init
cp .env.example .env.local
# .env.local에서 VITE_ENABLE_MOCKS=true (개발만)
npm run dev
```

프로덕션 Build는 prebuild로 승인된 Contract 타입을 재생성합니다.\n\n별도 Terminal에서 `npm run test`, `npm run typecheck`, `npm run build`. Playwright 브라우저 설치 후 `npm run test:e2e`는 **Mock UI 라우트 테스트만** 실행합니다.

`npm run contract:generate`는 `contract.sha`에 고정된 원격 OpenAPI를 다운로드하므로 GitHub 네트워크 접근이 필요합니다.
