import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../app/providers/AuthProvider";
import { mockEnabled } from "../../../shared/api/session";
import { Alert } from "../../../shared/ui/components/Alert";
import { Button } from "../../../shared/ui/components/Button";
import { TextField } from "../../../shared/ui/components/TextField";
import { getAuthErrorMessage } from "../api/authApi";
import styles from "./LoginPage.module.css";

interface LoginLocationState { from?: string; reason?: "expired" | "passwordChanged" }
const ERROR_ID = "login-error";

export function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const state = useLocation().state as LoginLocationState | null;
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ loginId?: string; password?: string }>({});
  const [error, setError] = useState("");
  const from = state?.reason === "passwordChanged" ? undefined : state?.from;
  const redirect = from && from !== "/login" ? from : "/me";

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = {
      loginId: loginId.trim() ? undefined : "로그인 ID를 입력해 주세요.",
      password: password ? undefined : "비밀번호를 입력해 주세요.",
    };
    setError("");
    setFieldErrors(errors);
    if (errors.loginId || errors.password) {
      const first = errors.loginId ? "loginId" : "password";
      (event.currentTarget.elements.namedItem(first) as HTMLInputElement | null)?.focus();
      return;
    }
    setBusy(true);
    try { await auth.login(loginId.trim(), password); navigate(redirect, { replace: true }); }
    catch (e) { setError(getAuthErrorMessage(e)); }
    finally { setBusy(false); }
  };
  const mockLogin = async (role: "USER" | "ADMIN") => {
    await auth.mockLogin(role);
    navigate(role === "ADMIN" ? "/admin/users" : "/me", { replace: true });
  };

  return <main className={styles.page}>
    <section className={styles.panel}>
      <h1>로그인</h1>
      <p className={styles.subtitle}>User Management PoC</p>
      {state?.reason === "expired" && <Alert variant="info">로그인이 만료되었습니다. 다시 로그인해 주세요.</Alert>}
      {state?.reason === "passwordChanged" && <Alert variant="success">비밀번호가 변경되었습니다. 새 비밀번호로 다시 로그인해 주세요.</Alert>}
      <form className={styles.form} noValidate onSubmit={(e) => { void submit(e); }}>
        <TextField label="로그인 ID" name="loginId" value={loginId} onChange={e => setLoginId(e.target.value)}
          autoComplete="username" error={fieldErrors.loginId} invalid={!!error} describedBy={error ? ERROR_ID : undefined} />
        <TextField label="비밀번호" name="password" type="password" value={password} onChange={e => setPassword(e.target.value)}
          autoComplete="current-password" error={fieldErrors.password} invalid={!!error} describedBy={error ? ERROR_ID : undefined} />
        {error && <Alert variant="error" id={ERROR_ID}>{error}</Alert>}
        <Button type="submit" className={styles.submit} loading={busy} loadingLabel="로그인 중…">로그인</Button>
        <p className={styles.signup}>계정이 없으신가요? <Link to="/signup">회원가입</Link></p>
      </form>
      {mockEnabled && <div className={styles.mock} role="group" aria-label="개발 전용 Mock 로그인">
        <p className={styles.subtitle}><strong>DEV ONLY</strong> · 실제 인증이 아닙니다.</p>
        <div className={styles.mockActions}>
          <Button type="button" variant="secondary" onClick={() => { void mockLogin("USER"); }}>Mock USER</Button>
          <Button type="button" variant="secondary" onClick={() => { void mockLogin("ADMIN"); }}>Mock ADMIN</Button>
        </div>
      </div>}
    </section>
  </main>;
}
