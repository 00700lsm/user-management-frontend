# 주요 사용자 흐름 및 통합 테스트 시나리오 (AA Draft)

## 1. 일반 사용자 가입/로그인/내 정보
```mermaid
flowchart LR
  Signup[회원가입 UI-USER-001] -->|POST /users/signup| Created[계정 생성]
  Created --> Login[로그인 UI-AUTH-001]
  Login -->|POST /auth/login| Profile[내 정보 UI-USER-002]
  Profile -->|GET/PATCH /users/me| Saved[정보 조회/수정 완료]
```
- Guest는 가입/로그인 가능. 로그인된 USER는 내 정보 조회·수정 가능.
- 중복 아이디/이메일, 로그인 실패, 미인증 접근 등 비정상 흐름을 포함합니다.
- 가입 과정의 User↔Auth↔Permission 처리/실패 복구 방식은 아직 결정되지 않았습니다.

## 2. 관리자 사용자 관리
```mermaid
flowchart LR
  List[사용자 목록 UI-USER-003] --> Detail[사용자 상세 UI-USER-004]
  List --> Register[사용자 등록]
  Detail --> Edit[정보 수정]
  Detail --> Status[ACTIVE/INACTIVE/WITHDRAWN 변경]
  Detail --> Roles[권한 화면 UI-PERM-002]
```
- 목록에서 이름/이메일 검색, 상태 필터, 페이지 이동을 검증합니다.
- ADMIN 외 접근 제한, 없는 사용자 404, 상태변경 성공/실패 UX를 확인합니다.
- 등록 시 초기 암호 배포 정책은 결정 전까지 차단 항목입니다.

## 3. 관리자 Role/Permission
```mermaid
flowchart LR
  UserDetail[사용자 상세] --> PermissionUI[사용자 권한 UI-PERM-002]
  PermissionUI -->|GET roles| Current[현재 권한 조회]
  Current --> Change[USER/ADMIN 권한 선택]
  Change -->|PUT roles| Verify[권한 변경 결과 확인]
```
- Role 목록은 UI-PERM-001에서 조회합니다.
- 권한 없는 사용자의 접근 차단, 중복 입력, 변경 완료와 재조회 일치 여부 검증이 필요합니다.

## 구현 시 연계 지점
- User 상세에서 Permission 화면으로 사용자 식별자를 전달합니다.
- Auth 인증 상태 및 ADMIN 권한 정보를 공통 Shell과 각 화면에서 사용합니다. 토큰 저장·만료·갱신은 [DEC-001](https://github.com/00700lsm/user-management-contract/blob/dev/docs/aa/decisions.md) 이후 구체화합니다.
- 모든 요청/응답 필드는 `contract.sha`의 OpenAPI로 생성된 타입을 사용합니다.
- 주요 흐름의 E2E 구현 여부는 별도 테스트 증거로 기록해야 합니다. 도식화했다고 실행 완료는 아닙니다.
