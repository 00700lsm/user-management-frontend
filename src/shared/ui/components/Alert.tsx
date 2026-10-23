import type { ReactNode } from "react";
import styles from "./Alert.module.css";

type AlertVariant = "error" | "success" | "info";
interface AlertProps {
  variant: AlertVariant;
  id?: string;
  /** Optional action (e.g. a re-login Button) shown beside the message. */
  action?: ReactNode;
  children: ReactNode;
}
/** Inline message. Errors use role="alert"; success/info use role="status". Prefix text keeps it from being color-only. */
export function Alert({ variant, id, action, children }: AlertProps) {
  const prefix = { error: "오류", success: "완료", info: "안내" }[variant];
  return <div id={id} role={variant === "error" ? "alert" : "status"} className={`${styles.alert} ${styles[variant]}`}>
    <p className={styles.message}><strong className={styles.prefix}>{prefix}</strong> {children}</p>
    {action}
  </div>;
}
