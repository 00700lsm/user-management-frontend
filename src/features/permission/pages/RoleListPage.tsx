import { ApiRequestError } from "../../../shared/api/client";
import { Alert } from "../../../shared/ui/components/Alert";
import { getPermissionErrorMessage } from "../api/permissionApi";
import { useRoles } from "../hooks/useRoles";
import styles from "./RoleListPage.module.css";

export function RoleListPage() {
  const { data, isPending, error } = useRoles();
  const isDenied = error instanceof ApiRequestError && (error.status === 401 || error.status === 403);
  return <main className="page">
    <div className="pageTitle">
      <div>
        <h1>역할 관리</h1>
        <p className="muted">Permission · UI-PERM-001 · 관리자 전용</p>
      </div>
    </div>
    <section className={`card ${styles.card}`}>
      <p className="muted">사용할 수 있는 역할입니다. 사용자별 부여는 사용자 상세의 권한 관리에서 합니다.</p>
      {isPending && <p role="status" className="muted">역할 목록을 불러오는 중…</p>}
      {error && <Alert variant="error">{getPermissionErrorMessage(error)}</Alert>}
      {data && !isDenied && data.length === 0 && <p className="muted">등록된 역할이 없습니다.</p>}
      {data && !isDenied && data.length > 0 && <div className={styles.tableWrap}>
        <table>
          <thead><tr><th>코드</th><th>이름</th></tr></thead>
          <tbody>
            {data.map((role) => <tr key={role.code}><td>{role.code}</td><td>{role.name}</td></tr>)}
          </tbody>
        </table>
      </div>}
    </section>
  </main>;
}
