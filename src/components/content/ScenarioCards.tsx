import { COPY } from "@/content/copy";
import { Appear } from "./Appear";
import styles from "./ScenarioCards.module.css";

/** Dua skenario sama tinggi (bertumpuk di HP). Statis, tanpa angka dan tanpa slider. */
export function ScenarioCards() {
  return (
    <div className={styles.wrap}>
      <ul className={styles.grid}>
        <Appear as="li" index={0}>
          <article className={`${styles.card} ${styles.neg}`} data-cursor="info" data-hover>
            <h3 className="t-card">{COPY["about.scenario.a.title"]}</h3>
            <p className="t-body">{COPY["about.scenario.a.body"]}</p>
          </article>
        </Appear>
        <Appear as="li" index={1}>
          <article className={`${styles.card} ${styles.pos}`} data-cursor="info" data-hover>
            <h3 className="t-card">{COPY["about.scenario.b.title"]}</h3>
            <p className="t-body">{COPY["about.scenario.b.body"]}</p>
          </article>
        </Appear>
      </ul>
      <p className="t-ui-sm">{COPY["about.scenario.body"]}</p>
    </div>
  );
}
