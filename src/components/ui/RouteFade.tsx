import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import styles from "./RouteFade.module.css";

/**
 * Fade-in antar rute (opacity saja).
 * TODO(A): pasang di AppShell membungkus rute aktif; sengaja belum dipasang oleh Pihak B.
 */
export function RouteFade({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return (
    <div key={pathname} className={styles.fade}>
      {children}
    </div>
  );
}
