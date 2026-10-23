import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../../../shared/api/client";
import type { ApiUser } from "../../../shared/api/client";
import { mockEnabled } from "../../../shared/api/session";
export function ProfilePage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["profile"],
    queryFn: () => apiRequest<ApiUser>("/users/me"),
    retry: false,
  });
  return <main className="page">
    <div className="pageTitle"><div><h1>내 정보</h1><p className="muted">User · UI-USER-002</p></div></div>
    <section className="card">
      {mockEnabled && <p className="muted"><strong>Mock API 모드</strong> · 운영 연동 결과가 아닙니다.</p>}
      {isLoading && <p role="status">사용자 정보를 불러오는 중…</p>}
      {error && <p role="alert" className="error">{error.message}</p>}
      {data && <dl>
        <dt>로그인 ID</dt><dd>{data.loginId}</dd>
        <dt>이름</dt><dd>{data.name}</dd>
        <dt>이메일</dt><dd>{data.email}</dd>
        <dt>상태</dt><dd>{data.status}</dd>
      </dl>}
      <p className="muted">실제 수정 기능은 User 도메인 작업에서 구현합니다.</p>
    </section>
  </main>;
}
