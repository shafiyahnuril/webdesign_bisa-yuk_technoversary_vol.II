import { COPY } from "@/content/copy";
import type { SourceGroup } from "./sourceGroups";
import styles from "./SourceList.module.css";

/** Daftar sumber bernomor (penomoran berlanjut antarkelompok), tautan ↗ ke tab baru. */
export function SourceList({ groups }: { groups: readonly SourceGroup[] }) {
  if (groups.length === 0) {
    return <p className="t-body">{COPY["about.sources.empty"]}</p>;
  }
  // Nomor awal tiap kelompok = jumlah butir pada kelompok sebelumnya + 1.
  const starts = groups.map(
    (_, i) => 1 + groups.slice(0, i).reduce((sum, g) => sum + g.items.length, 0),
  );
  return (
    <div className={styles.list}>
      {groups.map((group, gi) => {
        const first = starts[gi] ?? 1;
        return (
          <section key={group.title} className={styles.group}>
            <h3 className={`t-ui ${styles.groupTitle}`}>{group.title}</h3>
            <ol start={first} className={styles.items}>
              {group.items.map((item) => (
                <li key={item.url} className="t-body">
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    {item.title} ↗
                  </a>
                  <span className={styles.meta}>
                    {" "}
                    {[item.publisher, item.year].filter(Boolean).join(", ")}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
