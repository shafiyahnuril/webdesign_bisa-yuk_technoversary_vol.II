import type { HTMLAttributes, ReactNode } from "react";
import styles from "./CopyPanel.module.css";

export interface CopyPanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Gunakan permukaan kertas terang (khusus Bab 10). */
  light?: boolean;
}

/**
 * Panel teks semi-transparan di atas panggung cerita (tanpa `backdrop-filter`).
 */
export function CopyPanel({ children, light = false, className, ...rest }: CopyPanelProps) {
  const classes = [styles.panel, light ? styles.light : "", className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} data-copy-panel {...rest}>
      {children}
    </div>
  );
}
