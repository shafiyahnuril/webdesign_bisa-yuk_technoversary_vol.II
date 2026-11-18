import { COPY } from "@/content/copy";
import { useInView } from "@/hooks/useInView";
import styles from "./TempDiagram.module.css";

// Sumbu 0 sampai 4,5°C; posisi dalam persen lebar jalur.
const MAX = 4.5;
const TARGET = 1.5;
const pct = (t: number) => (t / MAX) * 100;

// Label sumbu berjarak sama (tiap 1,5°C); garis kecil tiap 0,5°C.
const LABELS = [
  { t: 0, text: "0,0°C", pos: "first" },
  { t: 1.5, text: "1,5°C", pos: "target" },
  { t: 3, text: "3,0°C", pos: "mid" },
  { t: 4.5, text: "4,5°C", pos: "last" },
] as const;
const MINOR = [0.5, 1, 2, 2.5, 3.5, 4] as const;

/** Zona di atas target dan garis target, digambar di dalam satu lajur. */
function LaneMarks() {
  return (
    <>
      <span className={styles.zone} style={{ left: `${pct(TARGET)}%` }} />
      <span className={styles.targetLine} style={{ left: `${pct(TARGET)}%` }} />
    </>
  );
}

/** Diagram statis dua skenario suhu. Pita terisi dari kiri (transform: scaleX) saat masuk layar. */
export function TempDiagram() {
  const [ref, inView] = useInView<HTMLElement>(0.3);
  const state = inView ? styles.in : "";

  return (
    <figure className={styles.figure} ref={ref} aria-label={COPY["about.temp.diagram.title"]}>
      <div className={styles.chart} aria-hidden="true">
        <div className={styles.row}>
          <p className={styles.name}>{COPY["about.temp.band1"]}</p>
          <div className={styles.lane}>
            <LaneMarks />
            <span
              className={`${styles.bar} ${styles.bar1}`}
              style={{ left: `${pct(1.2)}%`, width: `${pct(4) - pct(1.2)}%` }}
            >
              <span className={`${styles.fill} ${state}`} />
              <span className={`t-mono ${styles.value} ${styles.start} ${state}`}>+1,2°C</span>
              <span className={`t-mono ${styles.value} ${styles.end} ${state}`}>+4,0°C</span>
            </span>
          </div>
        </div>

        <div className={styles.row}>
          <p className={styles.name}>{COPY["about.temp.band2"]}</p>
          <div className={styles.lane}>
            <LaneMarks />
            <span
              className={`${styles.bar} ${styles.bar2}`}
              style={{ left: `${pct(1.2)}%`, width: `${pct(TARGET) - pct(1.2)}%` }}
            >
              <span className={`${styles.fill} ${state}`} />
            </span>
            <span
              className={`t-mono ${styles.value} ${styles.outside} ${state}`}
              style={{ left: `${pct(TARGET)}%` }}
            >
              +1,5°C
            </span>
          </div>
        </div>

        <div className={styles.axis}>
          {MINOR.map((t) => (
            <span key={t} className={styles.minor} style={{ left: `${pct(t)}%` }} />
          ))}
          {LABELS.map((m) => (
            <span
              key={m.t}
              className={`t-mono ${styles.tick} ${styles[m.pos]}`}
              style={{ left: `${pct(m.t)}%` }}
            >
              {m.text}
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
