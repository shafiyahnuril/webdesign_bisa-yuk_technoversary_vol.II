import { COPY } from "@/content/copy";
import { Appear } from "./Appear";
import styles from "./ScenarioCards.module.css";

/** Dua skenario berdampingan (bertumpuk di HP). Statis, tanpa slider. */
export function ScenarioCards() {
  return (
    <ul className={styles.grid}>
      <Appear as="li" index={0}>
        <article className={`${styles.card} ${styles.neg}`} data-cursor="info" data-hover>
          <h3 className="t-card">{COPY["about.temp.band1"]}</h3>
          <p className={`t-mono ${styles.range}`}>{COPY["about.temp.band1.desc"]}</p>
        </article>
      </Appear>
      <Appear as="li" index={1}>
        <article className={`${styles.card} ${styles.pos}`} data-cursor="info" data-hover>
          <h3 className="t-card">{COPY["about.temp.band2"]}</h3>
          <p className={`t-mono ${styles.range}`}>{COPY["about.temp.band2.desc"]}</p>
        </article>
      </Appear>
    </ul>
  );
}
