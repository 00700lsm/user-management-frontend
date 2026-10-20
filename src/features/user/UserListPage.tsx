import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { apiRequest } from "../../shared/api/client";
import type { ApiUser } from "../../shared/api/client";
import { Button } from "../../shared/ui/components/Button";

type UserPage = { items: ApiUser[]; total: number; page: number; size: number };
export function UserListPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["users", 0, 20],
    queryFn: () => apiRequest<UserPage>("/admin/users?page=0&size=20"),
    retry: false,
  });
  return <main className="page">
    <div className="pageTitle"><div><h1>사용자 관리</h1><p className="muted">User · UI-USER-003 · 관리자 전용</p></div><Button type="button" disabled title="등록 화면 구현 전">+ 사용자 등록</Button></div>
    <section className="card" style={{ marginBottom: 16 }}>
      <p className="muted">검색 및 상태 필터는 User 도메인 구현 예정입니다.</p>
    </section>
    <section className="card">
      {isLoading && <p role="status">목록을 불러오는 중…</p>}
      {error && <p role="alert" className="error">{error.message}</p>}
      {data && <div style={{ overflowX: "auto" }}>
        <table><thead><tr><th>로그인 ID</th><th>이름</th><th>이메일</th><th>상태</th></tr></thead>
          <tbody>{data.items.map(user => <tr key={user.id}>
            <td><Link to={`/admin/users/${user.id}`}>{user.loginId}</Link></td>
            <td>{user.name}</td><td>{user.email}</td><td>{user.status}</td>
          </tr>)}</tbody>
        </table>
        {data.items.length === 0 && <p className="muted">등록된 사용자가 없습니다.</p>}
        <p className="muted">총 {data.total}건 · 현재 {data.page + 1}페이지</p>
      </div>}
    </section>
  </main>;
}
