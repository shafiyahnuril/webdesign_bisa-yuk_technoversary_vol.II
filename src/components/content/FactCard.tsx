import type { ElementType } from "react";
import type { Fact } from "@/content/facts";
import { Appear } from "./Appear";
import { CountUp } from "./CountUp";
import { factParts, fillStatement } from "./factUtils";
import { useInView } from "@/hooks/useInView";
import styles from "./FactCard.module.css";

export type FactCardSize = "wide" | "narrow" | "full";

interface FactCardProps {
  fact: Fact;
  size?: FactCardSize;
  index?: number;
  as?: ElementType;
  /** Tanpa lebar kolom grid 12 (dipakai saat kartu berdiri sendiri di samping teks). */
  inline?: boolean;
}

/** Kartu fakta terverifikasi: angka besar, satuan kecil di bawahnya, kalimat, dan chip sumber. */
export function FactCard({ fact, size = "narrow", index = 0, as = "div", inline = false }: FactCardProps) {
  const parts = factParts(fact);
  const [ref, inView] = useInView<HTMLElement>(0.4);
  const linkable = /^https?:\/\//.test(fact.sourceUrl);
  const credit = [fact.publisher, fact.year].filter(Boolean).join(", ");

  return (
    <Appear
      as={as}
      index={index}
      className={inline ? undefined : styles[`span-${size}`]}
    >
      <figure ref={ref} className={`${styles.card} ${styles[size] ?? ""}`} data-cursor="info" data-hover>
        <p className={`t-mono ${styles.value}`} aria-hidden="true">
          {parts.prefix ? <span className={styles.prefix}>{parts.prefix}</span> : null}
          {parts.number === null ? (
            parts.text
          ) : (
            <CountUp to={parts.number} decimals={parts.decimals} suffix={parts.suffix} active={inView} />
          )}
        </p>
        {parts.unit ? (
          <p className={styles.unit} aria-hidden="true">
            {parts.unit}
          </p>
        ) : null}
        <figcaption className={`t-body ${styles.caption}`}>{fillStatement(fact)}</figcaption>
        {linkable ? (
          <a
            className={`t-ui-sm ${styles.chip}`}
            href={fact.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="link"
          >
            {credit} ↗
          </a>
        ) : (
          <span className={`t-ui-sm ${styles.chip}`}>{credit}</span>
        )}
      </figure>
    </Appear>
  );
}
