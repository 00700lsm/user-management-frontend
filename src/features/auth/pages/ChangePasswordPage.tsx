import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../app/providers/AuthProvider";
import { ApiRequestError } from "../../../shared/api/client";
import { Alert } from "../../../shared/ui/components/Alert";
import { Button } from "../../../shared/ui/components/Button";
import { TextField } from "../../../shared/ui/components/TextField";
import { changePassword, getAuthErrorMessage } from "../api/authApi";
import styles from "./ChangePasswordPage.module.css";

const POLICY_HINT = "12자 이상 입력해 주세요.";
const ERROR_ID = "password-error";
const REDIRECT_DELAY_MS = 1500;
type Errors = { oldPassword?: string; newPassword?: string; confirm?: string };

export function ChangePasswordPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [oldPassword, setOld] = useState("");
  const [newPassword, setNew] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Errors>({});
  const [serverField, setServerField] = useState<keyof Errors | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  // 204: all tokens are invalidated server-side. Show the notice, then clear the session and go to /login.
  useEffect(() => {
    if (!done) return;
    const id = setTimeout(() => {
      auth.invalidate("passwordChanged");
      navigate("/login", { replace: true, state: { reason: "passwordChanged" } });
    }, REDIRECT_DELAY_MS);
    return () => clearTimeout(id);
  }, [done, auth.invalidate, navigate]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors: Errors = {
      oldPassword: oldPassword ? undefined : "이전 비밀번호를 입력해 주세요.",
      newPassword: !newPassword ? "새 비밀번호를 입력해 주세요." : Array.from(newPassword).length < 12 ? POLICY_HINT : undefined,
      confirm: !confirm ? "새 비밀번호 확인을 입력해 주세요." : confirm !== newPassword ? "새 비밀번호가 일치하지 않습니다." : undefined,
    };
    setError(""); setServerField(null); setFieldErrors(errors);
    const first = (["oldPassword", "newPassword", "confirm"] as const).find(k => errors[k]);
    if (first) {
      (event.currentTarget.elements.namedItem(first) as HTMLInputElement | null)?.focus();
      return;
    }
    setBusy(true);
    try { await changePassword({ oldPassword, newPassword }); setDone(true); }
    catch (e) {
      // 400 keeps the session; a 401 was already routed to /login by apiRequest.
      setError(getAuthErrorMessage(e));
      const code = e instanceof ApiRequestError ? e.code : "";
      setServerField(code === "INVALID_OLD_PASSWORD" ? "oldPassword" : code === "PASSWORD_POLICY_VIOLATION" ? "newPassword" : null);
    }
    finally { setBusy(false); }
  };
  const describe = (k: keyof Errors) => (error && serverField === k ? ERROR_ID : undefined);

  return <main className="page">
    <div className="pageTitle"><div><h1>비밀번호 변경</h1><p className="muted">Auth · UI-AUTH-002</p></div></div>
    <section className={styles.card}>
      {done
        ? <Alert variant="success">비밀번호가 변경되었습니다. 보안을 위해 모든 로그인이 해제되며, 새 비밀번호로 다시 로그인해 주세요.</Alert>
        : null}
      <form className={styles.form} noValidate onSubmit={(e) => { void submit(e); }}>
        <fieldset className={styles.fieldset} disabled={busy || done}>
          <TextField label="이전 비밀번호" name="oldPassword" type="password" autoComplete="current-password"
            value={oldPassword} onChange={e => setOld(e.target.value)} error={fieldErrors.oldPassword}
            invalid={serverField === "oldPassword"} describedBy={describe("oldPassword")} />
          <TextField label="새 비밀번호" name="newPassword" type="password" autoComplete="new-password" hint={POLICY_HINT}
            value={newPassword} onChange={e => setNew(e.target.value)} error={fieldErrors.newPassword}
            invalid={serverField === "newPassword"} describedBy={describe("newPassword")} />
          <TextField label="새 비밀번호 확인" name="confirm" type="password" autoComplete="new-password"
            value={confirm} onChange={e => setConfirm(e.target.value)} error={fieldErrors.confirm} />
        </fieldset>
        {error && <Alert variant="error" id={ERROR_ID}>{error}</Alert>}
        <div className={styles.footer}>
          <Button type="submit" loading={busy} loadingLabel="변경 중…" disabled={done}>비밀번호 변경</Button>
        </div>
      </form>
    </section>
  </main>;
}
