import { Link } from "react-router-dom";
import { COPY } from "@/content/copy";
import styles from "./ClosingStrip.module.css";

interface ClosingStripProps {
  /** Email tim; disembunyikan bila belum diisi (nilai "TODO"). */
  email: string;
}

/** Penutup About: info kontak singkat, tautan ke Contact, dan kalimat penutup. */
export function ClosingStrip({ email }: ClosingStripProps) {
  const hasEmail = email !== "" && !email.startsWith("TODO");
  return (
    <div className={styles.strip}>
      <p className={`t-punch ${styles.closing}`}>{COPY["about.closing"]}</p>
      <p className={`t-body ${styles.contact}`}>
        {hasEmail ? (
          <>
            <a href={`mailto:${email}`}>{email}</a>
            <span aria-hidden="true"> · </span>
          </>
        ) : null}
        <Link to="/contact">{COPY["about.closing.contact"]} →</Link>
      </p>
    </div>
  );
}
