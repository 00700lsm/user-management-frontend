import { ApiRequestError } from "../../../shared/api/client";
import type { ApiUser } from "../../../shared/api/client";
import { mockEnabled } from "../../../shared/api/session";
import { Alert } from "../../../shared/ui/components/Alert";
import { getUserErrorMessage } from "../api/userApi";
import { useMyProfile } from "../hooks/useMyProfile";
import styles from "./ProfilePage.module.css";

const STATUS_LABELS: Record<ApiUser["status"], string> = { ACTIVE: "활성", INACTIVE: "비활성", WITHDRAWN: "탈퇴" };
// Fixed to Korea time so the date does not depend on the viewer's (or CI's) time zone.
const JOINED_DATE = new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", dateStyle: "medium" });

export function ProfilePage() {
  const { data, isPending, error } = useMyProfile();
  // A failed refetch keeps the old data. After 401/403 it must not stay on screen; after a network
  // or server error the last profile stays visible under the error message.
  const isDenied = error instanceof ApiRequestError && (error.status === 401 || error.status === 403);
  return <main className="page">
    <div className="pageTitle"><div><h1>내 정보</h1><p className="muted">User · UI-USER-002</p></div></div>
    <div className={`card ${styles.card}`}>
      {/* A static notice, not a live region: role="status" here would collide with real status messages. */}
      {mockEnabled && <p className="muted"><strong>Mock API 모드</strong> · 실제 서버 연동 결과가 아닙니다.</p>}
      {isPending && <p role="status" className="muted">사용자 정보를 불러오는 중…</p>}
      {error && <Alert variant="error">{getUserErrorMessage(error)}</Alert>}
      {data && !isDenied && <section aria-label="프로필 정보">
        <dl className={styles.fields}>
          <dt>로그인 ID</dt><dd>{data.loginId}</dd>
          <dt>이름</dt><dd>{data.name}</dd>
          <dt>이메일</dt><dd>{data.email}</dd>
          <dt>상태</dt><dd>{STATUS_LABELS[data.status]}</dd>
          <dt>가입일</dt><dd><time dateTime={data.createdAt}>{JOINED_DATE.format(new Date(data.createdAt))}</time></dd>
        </dl>
      </section>}
    </div>
  </main>;
}
