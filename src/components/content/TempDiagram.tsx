import { COPY } from "@/content/copy";
import { useInView } from "@/hooks/useInView";
import styles from "./TempDiagram.module.css";

// Sumbu 0 sampai 4,5°C; posisi dalam persen lebar jalur.
const MAX = 4.5;
const pct = (t: number) => (t / MAX) * 100;

const TICKS = [
  { t: 0, label: "0,0°C", kind: "first" },
  { t: 1.5, label: "1,5°C", kind: "target" },
  { t: 2, label: "2,0°C", kind: "minor" },
  { t: 4, label: "4,0°C", kind: "plain" },
] as const;

/** Garis panduan sumbu di dalam satu lajur (tidak melewati teks nama skenario). */
function Guides() {
  return (
    <>
      {TICKS.map((m) => (
        <span
          key={m.t}
          className={m.kind === "target" ? styles.targetLine : styles.guide}
          style={{ left: `${pct(m.t)}%` }}
        />
      ))}
    </>
  );
}

/** Diagram statis dua skenario suhu. Pita terisi dari kiri (transform: scaleX) saat masuk layar. */
export function TempDiagram() {
  const [ref, inView] = useInView<HTMLElement>(0.3);
  const fill = `${styles.barFill} ${inView ? styles.in : ""}`;

  return (
    <figure className={styles.figure} ref={ref} aria-label={COPY["about.temp.diagram.title"]}>
      <div className={styles.chart} aria-hidden="true">
        <div className={styles.track}>
          <div className={styles.row}>
            <p className={`t-ui-sm ${styles.name}`}>{COPY["about.temp.band1"]}</p>
            <div className={styles.lane}>
              <Guides />
              <span
                className={`${styles.bar} ${styles.bar1}`}
                style={{ left: `${pct(1.2)}%`, width: `${pct(4) - pct(1.2)}%` }}
              >
                <span className={fill} />
                <span className={`t-mono ${styles.end}`}>+4,0°C</span>
              </span>
            </div>
          </div>

          <div className={styles.row}>
            <p className={`t-ui-sm ${styles.name}`}>{COPY["about.temp.band2"]}</p>
            <div className={styles.lane}>
              <Guides />
              <span
                className={`${styles.bar} ${styles.bar2}`}
                style={{ left: `${pct(1.2)}%`, width: `${pct(1.5) - pct(1.2)}%` }}
              >
                <span className={fill} />
              </span>
              <span className={`t-mono ${styles.outside}`} style={{ left: `${pct(1.5)}%` }}>
                +1,5°C
              </span>
            </div>
          </div>
        </div>

        <div className={styles.axis}>
          {TICKS.map((m) => (
            <span
              key={m.t}
              className={`t-mono ${styles.tick} ${styles[m.kind]}`}
              style={{ left: `${pct(m.t)}%` }}
            >
              {m.label}
            </span>
          ))}
        </div>
      </div>

      <figcaption className={`t-ui-sm ${styles.note}`}>
        {COPY["about.temp.diagram.note"]}
      </figcaption>

      {/* Ringkasan untuk pembaca layar. */}
      <table className="sr-only">
        <caption>{COPY["about.temp.table.caption"]}</caption>
        <thead>
          <tr>
            <th scope="col">{COPY["about.temp.table.scenario"]}</th>
            <th scope="col">{COPY["about.temp.table.from"]}</th>
            <th scope="col">{COPY["about.temp.table.to"]}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">{COPY["about.temp.band1"]}</th>
            <td>+1,2°C</td>
            <td>+4,0°C</td>
          </tr>
          <tr>
            <th scope="row">{COPY["about.temp.band2"]}</th>
            <td>+1,5°C</td>
            <td>+1,5°C</td>
          </tr>
        </tbody>
      </table>
    </figure>
  );
}
