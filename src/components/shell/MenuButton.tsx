import { forwardRef, type ButtonHTMLAttributes } from "react";
import { COPY } from "@/content/copy";
import styles from "./MenuButton.module.css";

export interface MenuButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Apakah panel menu sedang terbuka. */
  open: boolean;
  /** Callback saat tombol diklik untuk membuka/menutup menu. */
  onToggle: () => void;
  /** ID elemen panel menu yang dikontrol. Default: "menu-panel". */
  controlsId?: string;
}

/**
 * Tombol menu bulat 56px (HP 48px) dengan ikon dua titik (• •) yang bertransformasi
 * menjadi tanda silang (✕) saat terbuka.
 */
export const MenuButton = forwardRef<HTMLButtonElement, MenuButtonProps>(function MenuButton(
  { open, onToggle, controlsId = "menu-panel", className, ...rest },
  ref,
) {
  const label = open ? COPY["nav.menu.close"] : COPY["nav.menu.open"];
  const classes = [styles.button, open ? styles.open : "", className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      ref={ref}
      type="button"
      className={classes}
      aria-label={label}
      aria-expanded={open}
      aria-controls={controlsId}
      onClick={onToggle}
      data-menu-button
      data-hover
      {...rest}
    >
      <span className={styles.icon} aria-hidden="true">
        <span className={styles.dots}>
          <span className={styles.dotLeft} />
          <span className={styles.dotRight} />
        </span>
        <span className={styles.cross}>
          <span className={styles.crossLineA} />
          <span className={styles.crossLineB} />
        </span>
      </span>
    </button>
  );
});
