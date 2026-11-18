import { Link } from "react-router-dom";
import { COPY } from "@/content/copy";
import { SITE } from "@/content/site";
import { useInView } from "@/hooks/useInView";
import styles from "./ClosingStrip.module.css";

interface ClosingStripProps {
  /** Email tim; disembunyikan bila belum diisi (nilai "TODO"). */
  email: string;
}

const [RE, REST] = SITE.name.split(":") as [string, string];

/** Penutup About: nama dengan "Re:" yang menyala, kalimat penutup besar, tombol ke beranda dan Contact. */
export function ClosingStrip({ email }: ClosingStripProps) {
  const [ref, lit] = useInView<HTMLDivElement>(0.5);
  const hasEmail = email !== "" && !email.startsWith("TODO");
  return (
    <div className={`${styles.strip} ${lit ? styles.lit : ""}`} ref={ref}>
      <p className={`t-chapter ${styles.brand}`} role="img" aria-label={SITE.name}>
        <span className={styles.re} aria-hidden="true">
          <span className={styles.reOutline}>{RE}:</span>
          <span className={styles.reFill}>{RE}:</span>
        </span>
        <span aria-hidden="true">{REST}</span>
      </p>
      <p className={`t-punch ${styles.closing}`}>{COPY["about.closing"]}</p>
      <div className={styles.actions}>
        <Link to="/" className={`t-ui ${styles.button}`} data-cursor="link">
          {COPY["about.closing.home"]}
        </Link>
        <p className={`t-body ${styles.contact}`}>
          <Link to="/contact" data-cursor="link">
            {COPY["about.closing.contact"]} →
          </Link>
          {hasEmail ? (
            <>
              <span aria-hidden="true"> · </span>
              <a href={`mailto:${email}`} data-cursor="link">
                {email}
              </a>
            </>
          ) : null}
        </p>
      </div>
    </div>
  );
}
