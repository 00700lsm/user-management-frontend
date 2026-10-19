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

## AA 설계 인계

[Frontend AA 인계서](docs/aa/README.md)에 화면 ID·경로·API 연계, 사용자 흐름, 공통 UI 품질 체크리스트가 있습니다. 요구/IA/OpenAPI 정본은 Contract 저장소를 참조합니다.

## AI Agent 개발 스킬

- [Frontend 단계별 스킬](.agents/skills/frontend-workflow/SKILL.md): 프로젝트 초기화·공통 Contract 확인·화면 개발·Mock Auth·실제 통합·테스트·PR
- [Claude Code용 스킬](.claude/skills/frontend-workflow/SKILL.md)
- [공통 스킬 작성 가이드](https://github.com/00700lsm/user-management-contract/blob/dev/docs/governance/agent-skills-guide.md)

Sibling Contract 경로는 `../user-management-contract`입니다. 인증 정책·Mock Fixture·테스트 계획은 Contract 문서가 정본이며 API 타입은 `contract.sha`로 고정합니다.
