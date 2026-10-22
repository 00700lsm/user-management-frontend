import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth, mockEnabled } from "../../../app/providers/AuthProvider";
import { Button } from "../../../shared/ui/components/Button";

export function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const redirect = (location.state as { from?: string } | null)?.from ?? "/me";
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true); setError("");
    try { await auth.login(loginId, password); navigate(redirect, { replace: true }); }
    catch (e) { setError(e instanceof Error ? e.message : "로그인 실패"); }
    finally { setBusy(false); }
  };
  return <main className="login">
    <section className="card loginPanel">
      <h1>로그인</h1><p className="muted">User Management PoC</p>
      <form className="form" onSubmit={(e) => { void submit(e); }}>
        <div className="field"><label htmlFor="loginId">로그인 ID</label><input id="loginId" value={loginId} onChange={e => setLoginId(e.target.value)} required autoComplete="username" /></div>
        <div className="field"><label htmlFor="password">비밀번호</label><input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" /></div>
        {error && <p role="alert" className="error">{error}</p>}
        <Button disabled={busy} type="submit">{busy ? "로그인 중…" : "로그인"}</Button>
        <p>계정이 없으신가요? <Link to="/signup">회원가입</Link></p>
      </form>
      {mockEnabled && <div aria-label="개발 전용 Mock 로그인" style={{ marginTop: 24 }}>
        <p className="muted"><strong>DEV ONLY</strong> · 실제 인증이 아닙니다.</p>
        <div className="actions">
          <Button type="button" variant="secondary" onClick={() => { auth.mockLogin("USER"); navigate("/me", { replace: true }); }}>Mock USER</Button>
          <Button type="button" variant="secondary" onClick={() => { auth.mockLogin("ADMIN"); navigate("/admin/users", { replace: true }); }}>Mock ADMIN</Button>
        </div>
      </div>}
    </section>
  </main>;
}
