import type { Credit } from "@/content/credits";
import { COPY } from "@/content/copy";
import styles from "./LicenseTable.module.css";

/** Penanda isian yang belum diisi (jangan ditampilkan ke pengunjung). */
const isPending = (text: string | undefined) => !text || text.startsWith("TODO");

/**
 * Tabel atribusi dan lisensi. Di HP baris menjadi kartu (label kolom lewat data-label).
 * Keterangan metode tampil hanya bila sudah terisi.
 */
export function LicenseTable({ credits }: { credits: readonly Credit[] }) {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th scope="col">{COPY["about.licenses.col.type"]}</th>
          <th scope="col">{COPY["about.licenses.col.name"]}</th>
          <th scope="col">{COPY["about.licenses.col.author"]}</th>
          <th scope="col">{COPY["about.licenses.col.license"]}</th>
        </tr>
      </thead>
      <tbody>
        {credits.map((c) => (
          <tr key={`${c.type}-${c.name}`}>
            <td data-label={COPY["about.licenses.col.type"]}>
              {COPY[`about.licenses.type.${c.type}`]}
            </td>
            <th scope="row" data-label={COPY["about.licenses.col.name"]}>
              {c.url ? (
                <a href={c.url} target="_blank" rel="noopener noreferrer">
                  {c.name} ↗
                </a>
              ) : (
                c.name
              )}
              {isPending(c.method) ? null : <span className={styles.method}>{c.method}</span>}
            </th>
            <td data-label={COPY["about.licenses.col.author"]}>{c.author ?? "—"}</td>
            <td data-label={COPY["about.licenses.col.license"]}>{c.license}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
