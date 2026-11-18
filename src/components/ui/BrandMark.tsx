import type { ElementType, HTMLAttributes } from "react";
import styles from "./BrandMark.module.css";

export interface BrandMarkProps extends HTMLAttributes<HTMLElement> {
  /** Elemen HTML pembungkus. Default: "span". */
  as?: ElementType;
  /** Ukuran varian: "nav" (default), "hero", atau "menu". */
  size?: "nav" | "hero" | "menu";
  /** Tambahkan kelas on-light saat ditampilkan di atas permukaan terang (mis. panel menu). */
  onLight?: boolean;
}

/**
 * Identitas "Re:bottle" yang sinkron dengan atribut `<html data-re="off" | "on">`.
 * Pada Babak I (`data-re="off"`), "Re:" memakai garis luar 1px dan opasitas 0.45.
 * Pada Babak II (`data-re="on"`), "Re:" menyala penuh dengan kilau halus.
 */
export function BrandMark({
  as: Component = "span",
  size = "nav",
  onLight = false,
  className,
  ...rest
}: BrandMarkProps) {
  const classes = [
    styles.brand,
    size === "hero" ? styles.hero : size === "menu" ? styles.menu : styles.nav,
    onLight ? styles.onLight : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component className={classes} data-brand-mark {...rest}>
      <span className={styles.re}>
        <span className={styles.reStroke}>Re:</span>
        <span className={styles.reFill} aria-hidden="true">
          Re:
        </span>
      </span>
      <span className={styles.bottle}>bottle</span>
    </Component>
  );
}
