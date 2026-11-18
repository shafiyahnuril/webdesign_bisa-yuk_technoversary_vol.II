import { useRef, type ReactNode } from "react";
import { usePageFocus } from "./usePageFocus";
import styles from "./PageHero.module.css";

interface PageHeroProps {
  title: string;
  lede?: string;
  /** Label subtema kecil di atas judul (mis. "Kampanye Peduli Lingkungan"). */
  eyebrow?: string;
  children?: ReactNode;
}

/** Kepala halaman non-Home: H1 (menerima fokus setelah ganti rute) + lede opsional. */
export function PageHero({ title, lede, eyebrow, children }: PageHeroProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  usePageFocus(headingRef);

  return (
    <header className={styles.hero}>
      {eyebrow ? <p className={`t-ui ${styles.eyebrow}`}>{eyebrow}</p> : null}
      <h1 ref={headingRef} tabIndex={-1} className={`t-chapter ${styles.title}`}>
        {title}
      </h1>
      {lede ? <p className={`t-body-lg ${styles.lede}`}>{lede}</p> : null}
      {children}
    </header>
  );
}
