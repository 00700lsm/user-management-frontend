import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ApiRequestError } from "../../../shared/api/client";
import { Alert } from "../../../shared/ui/components/Alert";
import { Button } from "../../../shared/ui/components/Button";
import { getPermissionErrorMessage } from "../api/permissionApi";
import type { RoleCode } from "../api/permissionApi";
import { useReplaceUserRoles, useRoles, useUserRoles } from "../hooks/useRoles";
import styles from "./UserRolesPage.module.css";

const ERROR_ID = "roles-error";

function sameRoles(left: readonly string[], right: readonly string[]) {
  if (left.length !== right.length) return false;
  const sortedLeft = [...left].sort();
  const sortedRight = [...right].sort();
  return sortedLeft.every((code, index) => code === sortedRight[index]);
}

export function UserRolesPage() {
  const params = useParams();
  const navigate = useNavigate();
  const userId = Number(params.id);
  const idIsValid = Number.isInteger(userId) && userId >= 1;
  const catalog = useRoles();
  const assignment = useUserRoles(userId, idIsValid);
  const replaceRoles = useReplaceUserRoles(userId);
  const [draft, setDraft] = useState<RoleCode[] | null>(null);
  const [fieldError, setFieldError] = useState("");
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDraft(null);
    setFieldError("");
    setFormError("");
    setNotice("");
    setSaved(false);
  }, [params.id]);

  const loaded = assignment.data?.roleCodes ?? [];
  const selected = draft ?? loaded;
  const isDenied = [catalog.error, assignment.error].some((error) =>
    error instanceof ApiRequestError && (error.status === 401 || error.status === 403));
  const isMissing = !idIsValid || (assignment.error instanceof ApiRequestError && assignment.error.status === 404);
  const isLoading = idIsValid && (catalog.isPending || assignment.isPending) && !isMissing;
  const canEdit = idIsValid && !isDenied && !isMissing && catalog.data && assignment.data;

  const toggle = (code: RoleCode) => {
    setSaved(false);
    setNotice("");
    setFieldError("");
    setDraft(selected.includes(code) ? selected.filter((item) => item !== code) : [...selected, code]);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!catalog.data) return;
    setFormError("");
    setNotice("");
    setSaved(false);
    if (selected.length === 0) {
      setFieldError("역할을 하나 이상 선택해 주세요.");
      (event.currentTarget.querySelector("input") as HTMLInputElement | null)?.focus();
      return;
    }
    setFieldError("");
    const roleCodes = [
      ...catalog.data.map((role) => role.code).filter((code) => selected.includes(code)),
      ...selected.filter((code) => !catalog.data?.some((role) => role.code === code)),
    ];
    if (sameRoles(roleCodes, loaded)) {
      setNotice("변경된 내용이 없습니다.");
      return;
    }
    try {
      await replaceRoles.mutateAsync({ roleCodes });
      setDraft(null);
      setSaved(true);
    } catch (caught) {
      setFormError(getPermissionErrorMessage(caught));
    }
  };

  const currentLabel = loaded
    .map((code) => catalog.data?.find((role) => role.code === code)?.name ?? code)
    .join(", ");

  return <main className="page">
    <nav className={styles.crumb} aria-label="현재 위치">
      <Link to="/admin/users">사용자 관리</Link>
      <span aria-hidden="true">/</span>
      <Link to={`/admin/users/${params.id ?? ""}`}>사용자 상세</Link>
      <span aria-hidden="true">/</span>
      <span>권한</span>
    </nav>
    <div className="pageTitle">
      <div>
        <h1>사용자 권한</h1>
        <p className="muted">Permission · UI-PERM-002 · 관리자 전용</p>
      </div>
    </div>
    <section className={`card ${styles.card}`}>
      {isLoading && <p role="status" className="muted">권한 정보를 불러오는 중…</p>}
      {catalog.error && <Alert variant="error">{getPermissionErrorMessage(catalog.error)}</Alert>}
      {!catalog.error && assignment.error && <Alert variant="error">{getPermissionErrorMessage(assignment.error)}</Alert>}
      {!idIsValid && <Alert variant="error">사용자를 찾을 수 없습니다.</Alert>}
      {saved && <Alert variant="success">역할을 저장했습니다.</Alert>}
      {canEdit && <form className={styles.form} noValidate onSubmit={(event) => { void submit(event); }}>
        <fieldset className={styles.choices} disabled={replaceRoles.isPending}>
          <legend>역할 선택</legend>
          <p className="muted">현재 역할: {currentLabel || "없음"}. 저장하면 선택한 역할만 남습니다.</p>
          {catalog.data?.map((role) => <label key={role.code} className={styles.choice}>
            <input
              type="checkbox"
              name={`role-${role.code}`}
              checked={selected.includes(role.code)}
              onChange={() => toggle(role.code)}
              aria-invalid={fieldError ? true : undefined}
              aria-describedby={fieldError ? ERROR_ID : undefined}
            />
            <span>{role.name}</span>
            <span className={styles.code}>{role.code}</span>
          </label>)}
        </fieldset>
        {fieldError && <p id={ERROR_ID} role="alert" className={styles.fieldError}>{fieldError}</p>}
        {notice && <Alert variant="info">{notice}</Alert>}
        {formError && <Alert variant="error">{formError}</Alert>}
        <div className={styles.footer}>
          <Button variant="secondary" type="button" onClick={() => navigate(`/admin/users/${userId}`)} disabled={replaceRoles.isPending}>취소</Button>
          <Button type="submit" loading={replaceRoles.isPending} loadingLabel="저장 중…">권한 저장</Button>
        </div>
      </form>}
    </section>
  </main>;
}
