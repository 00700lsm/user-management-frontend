# UI 공통화·디자인 일관성 검증 체크리스트

**상태: 미완료, 개발 전 확인용.** 정본: [공통 UI 기준](https://github.com/00700lsm/user-management-contract/blob/dev/docs/ui-guidelines.md).

## Frontend 필수 디자인 기준

- [ ] **Frontend 루트 [design.md](../../design.md)를 구현 전에 읽음** (해당 화면/컴포넌트/CSS 변경 전체)
- [ ] `design.md`의 토큰·Button/Input/Card/Table/Modal·Page Layout·Responsive·Focus/오류 상태 적용
- [ ] Contract 공통 UI 원칙과 `design.md`가 충돌하면 AA/FE Lead와 협의하고 변경 이력 기록

## AA/FE Lead 공통 결정
- [ ] 공통 Shell(Header/Sidebar/Content), 메뉴/경로 확정
- [ ] Color/Typography/Spacing/Responsive 디자인 토큰 확정
- [ ] Button/Input/Select/Table/Pagination/Modal/StatusBadge/FormField 기본 동작 확정
- [ ] 등록·수정·목록·상세·로그인 공통 페이지 패턴 확정
- [ ] 유효성 검사/서버 오류/알림/확인 모달 패턴 확정
- [ ] ADMIN 전용 메뉴·라우팅 및 Forbidden UX 합의
- [ ] [DEC-004](https://github.com/00700lsm/user-management-contract/blob/dev/docs/aa/decisions.md) 처리 상태 확인

## 기능 화면 완료 점검
- [ ] 화면 ID·route·사용자 역할·화면 이동이 [IA](https://github.com/00700lsm/user-management-contract/blob/dev/docs/ui-structure.md)와 일치
- [ ] 공통 UI를 재사용하며 도메인별 Table/Button/Modal 중복 구현 없음
- [ ] `contract.sha`와 생성된 TypeScript API 타입/클라이언트 기준 일치
- [ ] Loading / Empty / Error / Success / Forbidden, 필드별 검증 결과 처리
- [ ] 주요 키보드 접근, Label/포커스/오류 안내
- [ ] 연관 Backend PR과 화면 테스트/E2E 증거 링크
- [ ] 공통 UI·API 변경 시 관련 담당자 리뷰 및 Contract 변경 PR 선행

현재는 공통 컴포넌트 **설계 대상 목록**이며 실제 컴포넌트가 모두 구현된 상태는 아닙니다.
