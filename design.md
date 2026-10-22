# User Management Frontend — Design System & CSS Guide

> **Version:** UI Design Baseline v0.1 · **상태:** PoC Accepted DEC-004 기반의 Frontend 시각·CSS 기준 (개별 화면 구현·접근성·실통합 검증은 별개)
>
> 모든 Frontend 페이지·공통 컴포넌트·스타일 수정 전에 **반드시 이 파일을 읽고 준수**합니다. 공통 업무·화면 목적·권한/IA의 정본은 sibling `../user-management-contract/docs/ui-guidelines.md`, `docs/ui-structure.md`, `openapi.yaml` 및 본 저장소의 `contract.sha`입니다. 충돌 시 Contract를 우선하고 디자인 변경 제안을 남깁니다.
>
> 이 문서는 **시각 디자인과 CSS 구현 기준**입니다. `src/shared/ui/styles/tokens.css`와 공통 Button 등 초기 구현은 존재하지만 모든 공통 컴포넌트/화면이 구현됐다는 뜻은 아닙니다. 무거운 UI 라이브러리 추가·다크 모드 등 PoC 범위를 바꾸는 선택은 AA/FE Lead와 합의합니다.

## 1. 디자인 방향

**키워드:** Calm · Clear · Compact · Consistent — 과장된 장식 없는 깔끔한 업무형 SaaS 관리자 화면.

- 밝은 회백색 배경 + 흰색 Surface, 짙은 Slate 타이포, **단일 Blue 포인트**.
- 콘텐츠/정보 계층을 간격·서체·Border로 표현. 무의미한 그라데이션, 과한 Blur/Shadow, Glassmorphism 금지.
- 인터랙션은 **눈에 띄되 절제**: Hover는 약한 배경 변화, Focus는 명확한 링, 애니메이션은 짧게.
- Auth/User/Permission 세 영역에서 Button/Form/Card/Table/Modal을 **동일 공통 컴포넌트**로 사용.
- 데스크톱 우선 업무 화면이지만 모바일에서도 입력·탐색·상태 확인과 기본 작업을 수행할 수 있어야 함.

## 2. 토큰 (CSS Custom Properties)

색상은 하드코딩해서 화면마다 복사하지 않습니다. 현재 `src/shared/ui/styles/tokens.css`에 기본 라이트 토큰이 구현돼 있습니다. 새 토큰은 공통 파일에서 관리하고 이 문서와 동기화합니다.

```css
:root {
  color-scheme: light;
  --ui-bg: #f8fafc;
  --ui-surface: #ffffff;
  --ui-surface-muted: #f1f5f9;
  --ui-text: #0f172a;
  --ui-text-secondary: #475569;
  --ui-text-muted: #64748b;
  --ui-border: #e2e8f0;
  --ui-border-strong: #cbd5e1;
  --ui-primary: #2563eb;
  --ui-primary-hover: #1d4ed8;
  --ui-primary-soft: #eff6ff;
  --ui-success: #15803d;
  --ui-success-soft: #f0fdf4;
  --ui-warning: #a16207;
  --ui-warning-soft: #fefce8;
  --ui-danger: #b91c1c;
  --ui-danger-hover: #991b1b;
  --ui-danger-soft: #fef2f2;
  --ui-focus: #93c5fd;
  --ui-overlay: rgb(15 23 42 / 48%);

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-full: 9999px;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;

  --shadow-card: 0 1px 3px rgb(15 23 42 / 5%);
  --shadow-popover: 0 12px 32px rgb(15 23 42 / 12%);

  --height-control: 40px;
  --height-control-sm: 36px;
  --height-table-row: 52px;
  --height-header: 64px;
  --width-sidebar: 240px;
  --width-content: 1280px;
}
```

- 기본 서체: `Pretendard, "Noto Sans KR", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`. Pretendard 미설치 시 시스템 폰트 사용. 폰트 파일은 저장소에 임의 포함하지 않습니다.
- `body`: 14px / line-height 1.5 / `--ui-text`. 설명: 13~14px, 폼 label: 13px/600, 버튼: 14px/600, 테이블: 13~14px.
- 제목: H1 24px/700(모바일 20px), H2 18px/650, H3 16px/650. 본문에 여러 크기를 과하게 섞지 않습니다.
- 간격은 4px 단위 토큰을 사용하고 **8px 기반 리듬**(`8/16/24/32`)을 우선합니다.
- Border는 기본 1px Solid `--ui-border`, Radius는 필드/버튼 10px, Card 14px. 완전 원형 버튼은 Icon-only 등 특별한 경우에만.
- Dark mode는 이 버전 범위 밖입니다. 임의로 각 화면에 다크 테마를 구현하지 않습니다.

## 3. 전체 레이아웃 / 배치 규칙

### Desktop (너비 ≥ 1024px)
```text
┌──────────────────────────── Header (64px) ───────────────────────────────┐
│  Brand                                      Breadcrumb / Profile / Logout  │
├──────── Sidebar 240px ───────┬────────────────────────────────────────────┤
│  메뉴 (아이콘 + 텍스트)       │  Content (max 1280px, padding 32px)       │
│  - 내 정보                   │  Title                  [Primary Action]  │
│  - 사용자 관리 (ADMIN)       │  Subtitle / Breadcrumb                    │
│  - 역할 관리 (ADMIN)         │  [Filter Card]                              │
│                              │  [Table / Detail Surface]                  │
└──────────────────────────────┴────────────────────────────────────────────┘
```

- Shell: Header 높이 64px, Sidebar 폭 240px. Content 최대 폭 1280px, 좌우 패딩 32px. 본문 배경 `--ui-bg`.
- 페이지 제목 영역: **왼쪽 제목/설명, 오른쪽 주요 액션(최대 1개 Primary)**. 제목 아래 24px 간격으로 첫 Card 배치.
- 인접 Card 간 간격 16~24px. 1열 목록/폼을 무리하게 2열로 분할하지 않습니다.
- Breadcrumb / 페이지 제목 / Filter Card / 본문 Card 순서를 유지합니다.
- 헤더의 전체 네비게이션과 Sidebar는 Auth 상태·사용자 권한에 따라 표기하지만 **서버 인가와 별개**입니다.

### Tablet (768~1023px) / Mobile (<768px)
- 본문 패딩: Tablet 24px, Mobile 16px. Sidebar는 접히는 Drawer 또는 컴팩트 내비게이션(실제 패턴은 FE Lead 확정).
- 페이지 제목/액션: 768px 미만에서 세로 배치. 주요 버튼은 상황에 따라 전체 폭.
- 검색/필터 영역은 줄바꿈하고 모바일에서는 세로 정렬. 입력의 최소 터치 높이 40~44px.
- 데이터 표는 **가로 스크롤 컨테이너 + 최소 열 너비** 또는 합의된 Compact Card 표현. 중요 열을 글자 단위로 무너뜨리지 않습니다.
- Modal 너비: `min(480px, calc(100vw - 32px))`; 정보량이 많은 Dialog는 `min(640px, calc(100vw - 32px))`.

## 4. 공통 컴포넌트 명세

| 컴포넌트 | 외형·크기 | 배치 및 사용 |
|---|---|---|
| **Button Primary** | Blue 배경, 흰 글자, 높이 40px, Radius 10px, 좌우 16px | 화면의 단일 주요 액션: 등록·저장·로그인 |
| Button Secondary | White/Surface, Border 1px, Slate 글자, 높이 40px | 취소·뒤로·보조 작업 |
| Button Ghost | 투명 배경, Hover 시 Soft Background | 표 행 내부·작은 도구·Icon 버튼 |
| Button Danger | Danger 텍스트/Border 기본, 최종 파괴적 확인에서 Danger Solid | 탈퇴·위험한 상태 변경. 항상 확인 단계 |
| Icon Button | 36×36px 이상, Focus Ring, accessible label | 테이블/헤더의 반복 액션 |
| Text Input / Select | 높이 40px, Border, Radius 10px, 좌우 12px | 라벨은 입력 위, Label→8px 간격, 필드→Helper 6px |
| Textarea | min-height 96px, 동일 Border/Radius | 긴 내용만, 임의 Auto-grow 금지 |
| Card / Panel | Surface White, Border, Radius 14px, Padding 24px, 약한 Shadow | 콘텐츠 그룹. Filter Card는 20~24px Padding |
| Data Table | Header Surface-muted, Header 44px, Row 52px | 숫자·일시 오른쪽, 명칭·텍스트 왼쪽 정렬 |
| Status Badge | Soft Background, 둥근 Pill, 작은 12px/600 | ACTIVE=Success, INACTIVE=Warning/Muted, WITHDRAWN=Neutral/Danger-soft |
| Modal / Dialog | White, Radius 14px, 넓이 480px 기본, Shadow-popover | 제목·설명·내용·Footer 분리; 우측 아래 취소/확정 |
| Toast | Surface, Border, Shadow-popover, 텍스트+아이콘 | 성공/실패 피드백; 중요 오류는 인라인에도 표시 |
| Pagination | 테이블 오른쪽 아래, 36px 버튼, 현재 페이지 강조 | `page`는 API의 0-based 값을 UI 표시용 1-based로 변환 |
| Skeleton | Surface-muted의 정적인 줄/상자 | Loading Layout Shift 최소화, 과한 Shimmer 금지 |

### 버튼 상태
- Normal/Hover/Focus-visible/Disabled/Loading을 모두 구현합니다.
- Hover: Primary는 `--ui-primary-hover`; Secondary/Ghost는 `--ui-surface-muted`.
- Focus: 2px Focus Ring + 2px Offset, 키보드 사용 시에만 시각적으로 강조. `outline: none` 단독 사용 금지.
- Disabled: 대비·클릭 불가 상태 표시, `cursor: not-allowed`; 이유가 필요한 경우 보조 설명 제공.
- Loading: 기존 버튼 폭을 유지하고 Spinner + 작업 중 Label을 표시하며 중복 클릭 방지.
- Confirmation Footer: **취소(Secondary) 왼쪽 → 확인(Primary/Danger) 오른쪽**으로 일관되게 배치.

### 입력/폼
- `label`은 Placeholder와 별개로 항상 표시합니다.
- 필수 표시와 설명 문구가 필요하면 Label 아래 또는 Input 아래에 한 줄로 명시합니다.
- 에러 시 Danger Border + 텍스트, `aria-invalid` 및 `aria-describedby` 연결. **색상만으로 오류를 알리지 않습니다.**
- 기본 Form Gap 20px; 같은 의미의 짧은 필드는 Desktop 2열, Mobile 1열.
- 저장·취소는 페이지 하단(또는 카드 Footer) 오른쪽 정렬. 신규 화면에서 임의의 위치 사용 금지.
- Password 입력은 표시/숨김 버튼과 강도·정책 안내를 지원하되 정책은 AA 승인값 사용.

### 목록 / 테이블
- 검색·상태 필터는 **Table 위 별도 Filter Card**에 위치. 오른쪽 Search 버튼, Enter 제출 허용.
- 헤더는 `--ui-surface-muted`, 글자는 `--ui-text-secondary`, 600 weight.
- Row Hover는 연한 Blue/Slate Surface, 구분선만 사용; 과한 지브라 배경 금지.
- Row Click 전체에 상세 이동을 적용한다면 텍스트 링크/키보드 접근도 제공.
- Empty State는 아이콘(선택) + 설명 + 가능한 다음 액션. 403/404/500은 Empty와 구별.
- Pagination은 테이블 카드 하단; 기본 페이지당 20건. 서버가 반환한 total을 이용하며 숫자를 임의 추정하지 않습니다.

## 5. 화면별 표준 템플릿 (Contract UI ID 준수)

| 화면 | 권장 컨테이너·구성 | 주요 CTA |
|---|---|---|
| `/login` (UI-AUTH-001) | 배경 `--ui-bg`; 중앙 Card 최대 400px, Padding 32px; 서비스 제목 → ID/비밀번호 → 에러 → 버튼 | **로그인** 전체 폭 |
| `/signup` (UI-USER-001) | 중앙 Card 최대 480px, Padding 32px; 1열 Form, 안내·오류 인라인 | **가입하기** 전체 폭 |
| `/settings/password` (UI-AUTH-002) | 제목 + 단일 Card 최대 560px, 이전/새 비밀번호 + 검증 | **비밀번호 변경** |
| `/me` (UI-USER-002) | 제목 + 프로필 Card 최대 760px, 읽기/편집 상태 구분 | **수정 / 저장** |
| `/admin/users` (UI-USER-003) | 제목+우측 **사용자 등록**; Filter Card → Table Card → Pagination | **사용자 등록** |
| `/admin/users/:id` (UI-USER-004) | Breadcrumb + 상세 헤더; 기본 정보 Card·상태 Card·역할 관리 이동 | **정보 수정** |
| `/admin/roles` (UI-PERM-001) | 제목+역할 설명; Table/List Card | 필요 시 보조 액션 |
| `/admin/users/:id/roles` (UI-PERM-002) | Breadcrumb; 현재 Role/선택 Form Card; 변경 확인 | **권한 저장** |

권한을 볼 수 없는 경우 메뉴 숨김과 함께 서버 403에 대한 `Forbidden` 상태를 별도로 구현합니다. Auth Mock을 운영 빌드에서 사용하면 안 됩니다.

### 관리자 사용자 목록 참고 Wireframe
```text
사용자 관리                                   [ + 사용자 등록 ]
사용자를 조회하고 상태를 관리합니다.

┌────────────────────────────────────────────────────────────┐
│ [이름/이메일 검색            ] [상태: 전체 ▾] [검색]       │
└────────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────────┐
│ 로그인 ID    이름         이메일           상태    가입일    │
│ ───────────────────────────────────────────────────────── │
│ user001      홍길동       example@test...  [ACTIVE] ...  │
│ user002      김영희       example@test...  [INACTIVE] ...│
│                                               1  2  3  ›  │
└────────────────────────────────────────────────────────────┘
```

## 6. CSS 구현 예시 (공통 요소만)

아래는 Token 사용 방식의 예시입니다. Framework를 선택해도 **동일 Token/Component 계약**을 적용합니다.

```css
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: Pretendard, "Noto Sans KR", -apple-system,
    BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: var(--ui-text);
  background: var(--ui-bg);
}
button, input, select, textarea { font: inherit; }
:where(button, a, input, select, textarea):focus-visible {
  outline: 2px solid var(--ui-focus);
  outline-offset: 2px;
}
.ui-card {
  background: var(--ui-surface);
  border: 1px solid var(--ui-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  padding: var(--space-6);
}
.ui-button {
  min-height: var(--height-control);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: 0 var(--space-4);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: background-color 150ms ease, border-color 150ms ease;
}
.ui-button--primary {
  background: var(--ui-primary);
  color: #fff;
}
.ui-button--primary:hover { background: var(--ui-primary-hover); }
.ui-button--secondary {
  background: var(--ui-surface);
  border-color: var(--ui-border-strong);
  color: var(--ui-text);
}
.ui-button:disabled { cursor: not-allowed; opacity: .55; }
.ui-input {
  width: 100%;
  min-height: var(--height-control);
  padding: 0 var(--space-3);
  color: var(--ui-text);
  background: var(--ui-surface);
  border: 1px solid var(--ui-border-strong);
  border-radius: var(--radius-md);
}
.ui-input[aria-invalid="true"] { border-color: var(--ui-danger); }
.ui-page {
  width: min(100%, var(--width-content));
  margin-inline: auto;
  padding: var(--space-8);
}
@media (max-width: 767px) {
  .ui-page { padding: var(--space-4); }
  .ui-card { padding: var(--space-4); }
}
@media (prefers-reduced-motion: reduce) {
  .ui-button { transition: none; }
}
```

**현재 공통 UI 위치:** `src/shared/ui/styles/tokens.css`, `src/shared/ui/styles/global.css`, `src/shared/ui/components/*`. 기본 Button/스타일은 구현됐지만 나머지 컴포넌트와 UX 상태는 기능 개발 단계에서 추가 검증합니다. 승인된 스택(DEC-004)을 임의 변경하지 않습니다.

## 7. 접근성 / 품질 기준
- 일반 본문 텍스트 대비 **4.5:1 이상**, 큰 텍스트/주요 UI 경계 **3:1 이상**을 목표로 확인; 상태는 색+텍스트로 표현.
- 키보드 Tab 순서·Enter/Space·Esc·Focus 복귀(Modal 닫힘)를 지원. Dialog는 초점 이동/트랩/복귀 필요.
- 중요한 버튼은 아이콘만 두지 말고 텍스트 또는 `aria-label` 제공. 터치 영역은 가능하면 44×44px.
- 성공/오류 알림은 `role=status` 또는 적절한 `aria-live` 활용. 오류 위치/원인/해결을 설명.
- 동작 불확실성: Loading, Empty, Error, Success, Forbidden을 모든 주요 화면에 정의.
- 외관 테스트 시 Desktop 1440px/Tablet 768px/Mobile 390px 기본 확인, 긴 이름·이메일·0/대량 결과·모달 Overflow·Zoom 200% 확인.

## 8. 디자인 변경 / Agent 필수 체크리스트
- [ ] 작업 시작 전에 **Frontend 루트의 이 `design.md` 전체**를 읽었다.
- [ ] sibling Contract `docs/ui-guidelines.md`와 `docs/ui-structure.md`, 해당 UI ID/REQ를 확인했다.
- [ ] 색상/간격/Radius/Typography/Shadow는 토큰을 사용하고 임의 Hex 값을 분산시키지 않았다.
- [ ] 새 Button/Input/Card/Table/Modal을 화면마다 따로 구현하지 않고 `src/shared/ui`를 먼저 확인했다.
- [ ] 버튼 배치·상태·금지/오류/로딩 UX와 Responsive 기준을 준수했다.
- [ ] 키보드/Focus/대비 및 주요 화면 크기를 검증했다.
- [ ] 디자인 예외는 이유와 영향 화면·공통 컴포넌트를 PR에 기록했다.
- [ ] 공통 디자인 기준 변경 시 FE 공동 리뷰 + **Contract의 UI 공통 원칙·DEC-004 영향 여부 확인** 후 필요하면 선행 변경 PR을 작성했다.
- [ ] 테스트하지 않은 화면 또는 미구현 CSS는 완료로 보고하지 않았다.

**우선순위:** Contract AA 기능·IA·공통 UI 원칙 → 이 Frontend `design.md`의 비주얼/CSS 규격 → 각 화면의 구현 상세. 더 상위 기준과 충돌 시 숨기지 않고 이슈/PR로 합의합니다.
