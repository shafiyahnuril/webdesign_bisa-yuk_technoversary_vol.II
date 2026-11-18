import { COPY } from "@/content/copy";
import type { SourceGroup } from "./sourceGroups";
import styles from "./SourceAccordion.module.css";

/** Sumber data per kelompok dalam `<details>` native. Kelompok pertama terbuka, sisanya tertutup. */
export function SourceAccordion({ groups }: { groups: readonly SourceGroup[] }) {
  if (groups.length === 0) {
    return <p className="t-body">{COPY["about.sources.empty"]}</p>;
  }
  // Nomor awal tiap kelompok = jumlah butir pada kelompok sebelumnya + 1.
  const starts = groups.map(
    (_, i) => 1 + groups.slice(0, i).reduce((sum, g) => sum + g.items.length, 0),
  );
  return (
    <div className={styles.list}>
      {groups.map((group, gi) => (
        <details key={group.title} className={styles.group} open={gi === 0}>
          <summary className={styles.summary} data-cursor="link">
            <span className={`t-card ${styles.title}`}>{group.title}</span>
            <span className={`t-ui-sm ${styles.count}`}>
              {COPY["about.sources.count"].replace("{n}", String(group.items.length))}
            </span>
            <svg className={styles.chevron} viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
              <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </summary>
          <ol start={starts[gi] ?? 1} className={styles.items}>
            {group.items.map((item) => (
              <li key={item.url} className="t-body">
                <a href={item.url} target="_blank" rel="noopener noreferrer" data-cursor="link">
                  {item.title} ↗
                </a>
                <span className={styles.meta}>
                  {" "}
                  {[item.publisher, item.year].filter(Boolean).join(", ")}
                </span>
              </li>
            ))}
          </ol>
        </details>
      ))}
    </div>
  );
}
