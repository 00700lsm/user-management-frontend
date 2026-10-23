import type { ButtonHTMLAttributes } from "react";
import styles from "./Button.module.css";
type Variant = "primary" | "secondary" | "ghost" | "danger";
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  /** Shows a spinner + loadingLabel, blocks clicks and keeps the original width. */
  loading?: boolean;
  loadingLabel?: string;
};
export function Button({
  variant = "primary", className = "", loading = false, loadingLabel, children, disabled, ...props
}: ButtonProps) {
  const cls = `${styles.button} ${styles[variant]} ${className}`.trim();
  if (!loading) return <button {...props} disabled={disabled} className={cls}>{children}</button>;
  // The idle label stays in the grid (hidden) so the button width does not change while loading.
  return <button {...props} disabled aria-busy="true" className={`${cls} ${styles.loading}`}>
    <span className={styles.idleLabel} aria-hidden="true">{children}</span>
    <span className={styles.busyLabel}><span className={styles.spinner} aria-hidden="true" />{loadingLabel ?? children}</span>
  </button>;
}
