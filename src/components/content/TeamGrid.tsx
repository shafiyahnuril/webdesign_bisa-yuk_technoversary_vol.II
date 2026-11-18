import { COPY } from "@/content/copy";
import styles from "./TeamGrid.module.css";

export interface TeamMember {
  name: string;
  role: string;
  institution: string;
  /** Tautan opsional (profil/akun). */
  url?: string;
}

const isPending = (text: string) => text === "TODO";

/** Kartu anggota tim: 2-3 kolom di desktop, 1 kolom di HP. Isian "TODO" tampil sebagai placeholder. */
export function TeamGrid({ members }: { members: readonly TeamMember[] }) {
  return (
    <ul className={styles.grid}>
      {members.map((m, i) => {
        const pending = isPending(m.name);
        return (
          <li key={`${m.name}-${i}`} className={`${styles.card} ${pending ? styles.pending : ""}`}>
            <p className={`t-card ${styles.name}`}>
              {pending ? COPY["about.team.placeholder.name"] : m.name}
            </p>
            <p className="t-ui">{isPending(m.role) ? COPY["about.team.placeholder.role"] : m.role}</p>
            {isPending(m.institution) ? null : <p className="t-body">{m.institution}</p>}
            {m.url && /^https?:\/\//.test(m.url) ? (
              <a href={m.url} target="_blank" rel="noopener noreferrer" className={styles.link}>
                {m.url.replace(/^https?:\/\/(www\.)?/, "")} ↗
              </a>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
