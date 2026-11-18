import styles from "./Scrim.module.css";

export interface ScrimProps {
  /** Apakah scrim terlihat (panel menu terbuka). */
  open: boolean;
  /** Callback saat scrim diklik untuk menutup menu. */
  onClick: () => void;
}

/**
 * Lapisan gelap tipis (`z-index: 80`) di belakang panel menu.
 * Mengetuk/mengklik scrim akan menutup panel menu.
 */
export function Scrim({ open, onClick }: ScrimProps) {
  return (
    <div
      className={`${styles.scrim} ${open ? styles.open : ""}`}
      aria-hidden="true"
      data-scrim
      data-open={open ? "true" : "false"}
      data-story-ui
      onClick={onClick}
    />
  );
}
