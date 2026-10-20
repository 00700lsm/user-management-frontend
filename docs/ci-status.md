# Frontend CI

`.github/workflows/frontend-build.yml`을 추가했습니다. PR/push(main,dev)에서 Node 24, 의존성 설치, `contract.sha` OpenAPI 타입 생성, Mock Worker 설치, TypeScript/Vitest/Vite Build, Playwright의 개발용 Mock UI Smoke를 진행하도록 정의했습니다.

**2026-10-20 GitHub Actions의 빌드·Mock UI 테스트 및 Contract 타입 검증이 성공했습니다.** [Frontend CI](https://github.com/00700lsm/user-management-frontend/actions/runs/39346999583), [Contract CI](https://github.com/00700lsm/user-management-frontend/actions/runs/39346999603). 현재 구성은 lockfile이 없으므로 `npm install`을 사용합니다. 의존성 설치가 가능한 환경에서 `package-lock.json`을 생성·리뷰 후 CI를 `npm ci`로 전환하는 것이 좋습니다.

Mock UI Smoke는 **G1**만 검증합니다. 실제 Backend+DB/Auth 연결(E2E G3/G4) 검증과 운영용 Mock 차단 테스트는 추후 별도 Job으로 추가해야 합니다.
