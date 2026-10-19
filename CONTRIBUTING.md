# Frontend 개발 규칙

팀 공통 규칙 정본: https://github.com/00700lsm/user-management-contract/blob/main/docs/governance/git-workflow.md

## 업무 담당
A=Auth FE+BE, B=User FE+BE, C=Permission FE+BE.

## 계약 연동
```bash
npm install
npm run contract:generate
```
- `contract.sha`를 기준으로 공통 OpenAPI를 다운로드해 TypeScript API 타입을 생성합니다.
- 자동 생성 파일은 `src/shared/api/generated/` 아래에 위치하며 소스 정본으로 수동 수정하지 않습니다.
- 도메인 화면은 이 타입을 소비합니다. 실제 API Client 및 앱 실행 코드는 후속 구현 대상입니다.
- Contract 변경이 필요하면 공통 저장소 PR 승인 후 `contract.sha`를 변경합니다.

## PR
관련 Requirement/UI ID, Backend 관련 PR, Contract SHA, 공통 UI 사용 여부, 검증 증거를 기록합니다.
