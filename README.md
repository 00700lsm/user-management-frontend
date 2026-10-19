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

현재 기술 스택은 미정이며 실행 가능한 앱은 아직 구현되지 않은 **설계 골격**입니다.
