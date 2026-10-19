# Shared API Client

공통 OpenAPI 계약을 기반으로 API Client 또는 타입을 생성/관리하는 공통 계층입니다.

- 정본은 Contract Repository의 `openapi.yaml`
- 특정 Contract Git SHA를 기준으로 타입/클라이언트 버전을 고정
- 인증 헤더, 오류 처리, API base URL 같은 횡단 관심사를 모음
- 모듈의 화면 코드에서 응답 필드명/URL을 임의로 가정하지 않음

프레임워크 결정 후 생성 툴/검증 CI를 확정합니다.
