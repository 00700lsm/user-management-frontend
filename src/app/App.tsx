import { useEffect, useState } from "react";
import { Link, Navigate, Outlet, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import { FORBIDDEN_EVENT } from "../shared/api/session";
import { Alert } from "../shared/ui/components/Alert";
import { Button } from "../shared/ui/components/Button";
import { useAuth } from "./providers/AuthProvider";
import { ChangePasswordPage } from "../features/auth/pages/ChangePasswordPage";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { SignupPage } from "../features/user/pages/SignupPage";
import { ProfilePage } from "../features/user/pages/ProfilePage";
import { UserListPage } from "../features/user/pages/UserListPage";
import { RoleListPage } from "../features/permission/pages/RoleListPage";
import { UserRolesPage } from "../features/permission/pages/UserRolesPage";

function Protected({ admin = false }: { admin?: boolean }) {
  const auth = useAuth();
  const location = useLocation();
  if (!auth.isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname, reason: auth.endReason }} />;
  if (admin && !auth.roles.includes("ADMIN")) {
    return <main className="page"><section className="card"><h1>접근 권한이 없습니다</h1><p className="muted">ADMIN 권한이 필요한 화면입니다. 서버에서도 권한을 별도로 확인합니다.</p><Link to="/me">내 정보로 이동</Link></section></main>;
  }
  return <Outlet />;
}

function Shell() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [forbidden, setForbidden] = useState(false);
  // 403: show a re-login notice on the current screen; never log out automatically.
  useEffect(() => {
    const onForbidden = () => setForbidden(true);
    window.addEventListener(FORBIDDEN_EVENT, onForbidden);
    return () => window.removeEventListener(FORBIDDEN_EVENT, onForbidden);
  }, []);
  useEffect(() => setForbidden(false), [location.pathname]);
  const relogin = () => { auth.invalidate(); navigate("/login", { replace: true }); };
  return (
    <div className="app">
      <header className="topbar">
        <strong>User Management</strong>
        <Button variant="secondary" type="button" onClick={() => { void auth.logout().finally(() => navigate("/login", { replace: true })); }}>로그아웃</Button>
      </header>
      <div className="layout">
        <aside className="sidebar" aria-label="메인 메뉴">
          <nav>
            <Link to="/me">내 정보</Link>
            <Link to="/settings/password">비밀번호 변경</Link>
            {auth.roles.includes("ADMIN") && <>
              <Link to="/admin/users">사용자 관리</Link>
              <Link to="/admin/roles">역할 관리</Link>
            </>}
          </nav>
        </aside>
        <div>
          {forbidden && <div className="bannerSlot">
            <Alert variant="error" action={<Button variant="secondary" type="button" onClick={relogin}>재로그인</Button>}>
              접근 권한이 없습니다. 권한이 변경되었다면 다시 로그인해 주세요.
            </Alert>
          </div>}
          <Outlet />
        </div>
      </div>
    </div>
  );
}

function Scaffold({ title, description, links }: {
  title: string; description: string; links?: { path: string; label: string }[];
}) {
  return <main className="page">
    <div className="pageTitle"><div><h1>{title}</h1><p className="muted">{description}</p></div></div>
    <section className="card">
      <h2>구현 대기</h2>
      <p className="muted">라우트와 공통 디자인만 연결한 기본 화면입니다. 기능별 계약/Backend 구현 후 연결합니다.</p>
      {links?.map(x => <p key={x.path}><Link to={x.path}>{x.label}</Link></p>)}
    </section>
  </main>;
}

function UserDetailPlaceholder() {
  const { id = "" } = useParams();
  return <Scaffold title="사용자 상세" description="User / UI-USER-004 · API 연결 전" links={[
    { path: `/admin/users/${id}/roles`, label: "권한 관리" },
  ]} />;
}

export function App() {
  return <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/signup" element={<SignupPage />} />
    <Route element={<Protected />}>
      <Route element={<Shell />}>
        <Route path="/" element={<Navigate to="/me" replace />} />
        <Route path="/me" element={<ProfilePage />} />
        <Route path="/settings/password" element={<ChangePasswordPage />} />
        <Route element={<Protected admin />}>
          <Route path="/admin/users" element={<UserListPage />} />
          <Route path="/admin/users/:id" element={<UserDetailPlaceholder />} />
          <Route path="/admin/roles" element={<RoleListPage />} />
          <Route path="/admin/users/:id/roles" element={<UserRolesPage />} />
        </Route>
      </Route>
    </Route>
    <Route path="*" element={<main className="page"><h1>페이지를 찾을 수 없습니다</h1><Link to="/login">로그인으로</Link></main>} />
  </Routes>;
}
