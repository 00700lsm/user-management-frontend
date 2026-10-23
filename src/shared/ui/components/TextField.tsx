import { useId, useState } from "react";
import type { InputHTMLAttributes } from "react";
import styles from "./TextField.module.css";

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  label: string;
  id?: string;
  /** Field-level message. Replaces the hint while present. */
  error?: string;
  hint?: string;
  /** Mark invalid without a field message (e.g. a form-level server error). */
  invalid?: boolean;
  /** Extra id(s) for aria-describedby, e.g. a form-level alert. */
  describedBy?: string;
}

/** Labeled input. type="password" gets a show/hide toggle. */
export function TextField({ label, id, error, hint, invalid, describedBy, type = "text", ...props }: TextFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const noteId = `${inputId}-note`;
  const [shown, setShown] = useState(false);
  const isPassword = type === "password";
  const isInvalid = !!error || !!invalid;
  const note = error ?? hint;
  const ids = [note ? noteId : "", describedBy ?? ""].filter(Boolean).join(" ") || undefined;
  return <div className={styles.field}>
    <label htmlFor={inputId} className={styles.label}>{label}</label>
    <div className={styles.control}>
      <input
        {...props} id={inputId} name={props.name ?? inputId}
        type={isPassword && shown ? "text" : type}
        aria-invalid={isInvalid || undefined} aria-describedby={ids}
        className={`${styles.input} ${isPassword ? styles.withToggle : ""}`.trim()}
      />
      {isPassword && <button type="button" className={styles.toggle} aria-pressed={shown}
        aria-label={`${label} ${shown ? "숨기기" : "표시"}`} onClick={() => setShown(v => !v)}>
        {shown ? "숨기기" : "표시"}
      </button>}
    </div>
    {note && <p id={noteId} className={error ? styles.error : styles.hint}>{note}</p>}
  </div>;
}
