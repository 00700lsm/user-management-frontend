import type { ButtonHTMLAttributes } from "react";
import styles from "./Button.module.css";
type Variant = "primary" | "secondary" | "ghost" | "danger";
export function Button({
  variant = "primary", className = "", ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button {...props} className={`${styles.button} ${styles[variant]} ${className}`.trim()} />;
}
