import { COPY } from "@/content/copy";
import { FACTS, type Fact } from "@/content/facts";
import { isShowable } from "./factUtils";
import styles from "./FactBlock.module.css";

interface FactBlockProps {
  value: string;
  label: string;
  source: { id: string };
}

/** Angka besar (Mono) + keterangan + sumber kecil. Tersembunyi bila fakta belum `verified: true`. */
export function FactBlock({ value, label, source }: FactBlockProps) {
  const fact: Fact | undefined = (FACTS as Record<string, Fact>)[source.id];
  const showable = fact !== undefined && isShowable(fact) && value !== "";

  if (!showable) {
    // Di DEV tampilkan penanda agar celah data terlihat; di produksi klaim disembunyikan.
    if (!import.meta.env.DEV) return null;
    return (
      <figure className={`${styles.block} ${styles.dev}`} data-fact-pending={source.id}>
        <p className={`t-data t-mono ${styles.value}`}>{COPY["about.fact.dev"]}</p>
        <figcaption className={`t-ui-sm ${styles.label}`}>{label}</figcaption>
      </figure>
    );
  }

  const linkable = /^https?:\/\//.test(fact.sourceUrl);
  const credit = [fact.publisher, fact.year].filter(Boolean).join(", ");
  return (
    <figure className={styles.block}>
      <p className={`t-data t-mono ${styles.value}`}>{value}</p>
      <figcaption className={`t-body ${styles.label}`}>{label}</figcaption>
      <p className={`t-ui-sm ${styles.source}`}>
        {linkable ? (
          <a href={fact.sourceUrl} target="_blank" rel="noopener noreferrer">
            {credit} ↗
          </a>
        ) : (
          credit
        )}
      </p>
    </figure>
  );
}
