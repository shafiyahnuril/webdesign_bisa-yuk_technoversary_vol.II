import { COPY } from "@/content/copy";
import { Appear } from "./Appear";
import { CapAvatar } from "./CapAvatar";
import styles from "./TeamGrid.module.css";

export interface TeamMember {
  name: string;
  role: string;
  institution: string;
  /** Tautan opsional (profil/akun). */
  url?: string;
}

const isPending = (text: string) => text === "TODO";

// Kemiringan tutup bervariasi per kartu (statis, deterministik).
const TILTS = [0, 14, -9, 22, -16] as const;

/** Kartu anggota tim dengan tutup botol sebagai avatar. Isian "TODO" tampil sebagai placeholder. */
export function TeamGrid({ members }: { members: readonly TeamMember[] }) {
  return (
    <ul className={styles.grid}>
      {members.map((m, i) => {
        const pending = isPending(m.name);
        return (
          <Appear as="li" key={`${m.name}-${i}`} index={i}>
            <div
              className={`${styles.card} ${pending ? styles.pending : ""}`}
              data-cursor="info"
              data-hover
            >
              <CapAvatar tilt={TILTS[i % TILTS.length]} />
              <div className={styles.body}>
                <p className={`t-card ${styles.name}`}>
                  {pending ? COPY["about.team.placeholder.name"] : m.name}
                </p>
                <p className="t-ui-sm">
                  {isPending(m.role) ? COPY["about.team.placeholder.role"] : m.role}
                </p>
                {isPending(m.institution) ? null : <p className="t-body">{m.institution}</p>}
                {m.url && /^https?:\/\//.test(m.url) ? (
                  <a
                    href={m.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.link}
                    data-cursor="link"
                  >
                    {m.url.replace(/^https?:\/\/(www\.)?/, "")} ↗
                  </a>
                ) : null}
              </div>
            </div>
          </Appear>
        );
      })}
    </ul>
  );
}
