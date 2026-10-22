# Frontend AA 설계 인계서

**상태: 공통 Contract 승인 기준을 연결하는 인계 문서.** 이 문서는 Frontend 담당자가 무엇을 어떤 화면에서 구현해야 하는지 설명하는 인계 자료입니다. 공통 요구사항·화면·API 계약을 별도 복제한 정본이 아닙니다.

## AA 공통 정본
- [전체 AA 인계 목차](https://github.com/00700lsm/user-management-contract/blob/dev/docs/aa/README.md)
- [업무 요구사항](https://github.com/00700lsm/user-management-contract/blob/dev/docs/requirements.md), [기능 상세/업무 규칙](https://github.com/00700lsm/user-management-contract/blob/dev/docs/aa/functional-spec.md)
- [화면 IA / UI ID / route](https://github.com/00700lsm/user-management-contract/blob/dev/docs/ui-structure.md)
- [공통 UI 설계 기준](https://github.com/00700lsm/user-management-contract/blob/dev/docs/ui-guidelines.md)
- [공통 OpenAPI](https://github.com/00700lsm/user-management-contract/blob/dev/openapi.yaml)
- [요구·화면·API 추적표](https://github.com/00700lsm/user-management-contract/blob/dev/docs/aa/traceability.md)
- [Accepted PoC 설계 결정](https://github.com/00700lsm/user-management-contract/blob/dev/docs/aa/decisions.md)

계약의 실제 버전은 이 Repository의 `contract.sha`가 가리키는 커밋입니다. `dev` 브랜치 링크는 읽기 편의를 위한 것이며 자동으로 계약 버전을 바꾸지 않습니다.

## 담당자
| 담당 | Frontend | 동일 담당 Backend |
|---|---|---|
| A | Auth: 로그인·로그아웃·비밀번호 변경 | Auth |
| B | User: 회원가입·내 정보·관리자 사용자 관리 | User |
| C | Permission: 역할 조회·사용자 권한 변경 | Permission |

## Frontend 인계 문서
1. [화면·행위·API 매핑](./screen-handoff.md) — 화면 구성, 역할, 이동, 통합 대상
2. [사용자 흐름](./user-flows.md) — 핵심 E2E 시나리오
3. [공통 디자인·UX 검증](./ui-consistency-checklist.md) — 공통 Shell, 컴포넌트, 상태 처리

## 설계와 구현의 책임
- AA/PL: 화면 목적/IA/행동/역할/필드 요구 및 공통 패턴의 승인
- FE 담당: React 등 구현 방식·상세 레이아웃·컴포넌트 조합·스타일과 테스트
- 공통 UI 변경은 관련 담당자 공동 검토, API 스키마 변경은 Contract 저장소 PR 선행

현재 React/Vite 라우팅·공통 디자인·G1 Mock UI 실행 골격이 있으며 실제 Auth/업무 API 통합과 G3/G4는 아직 구현 전입니다.

## 작업별 Frontend Skill

- [화면 구현](../../.agents/skills/implement-ui-screen/SKILL.md)
- [공통 UI 컴포넌트 작성](../../.agents/skills/create-shared-ui-component/SKILL.md)
- [디자인 및 빌드 검증](../../.agents/skills/validate-frontend-ui/SKILL.md)
- [실제 FE/BE 연동 검증](../../.agents/skills/test-frontend-integration/SKILL.md)

모든 화면·스타일 변경에는 **Frontend 루트 `design.md` 전체 확인**이 선행됩니다.
