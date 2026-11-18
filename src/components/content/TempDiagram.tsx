import { useEffect, useRef, useState } from "react";
import { COPY } from "@/content/copy";
import styles from "./TempDiagram.module.css";

// Geometri SVG (satuan viewBox). Sumbu 0 sampai 4,5 °C.
const W = 900;
const X0 = 42;
const X1 = 858;
const MAX = 4.5;
const x = (t: number) => X0 + (t / MAX) * (X1 - X0);

const MARKS = [
  { t: 1.5, label: "1,5°C", target: true },
  { t: 2, label: "2,0°C", target: false },
  { t: 4, label: "4,0°C", target: false },
] as const;

/** Diagram statis dua skenario suhu. Pita terisi dari kiri (transform: scaleX) saat masuk viewport. */
export function TempDiagram() {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(() => typeof IntersectionObserver === "undefined");

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  const fill = `${styles.fill} ${shown ? styles.in : ""}`;

  return (
    <figure className={styles.figure} ref={ref}>
      <svg
        viewBox={`0 0 ${W} 330`}
        role="img"
        aria-labelledby="temp-title temp-desc"
        className={styles.svg}
      >
        <title id="temp-title">{COPY["about.temp.diagram.title"]}</title>
        <desc id="temp-desc">
          {COPY["about.temp.band1.desc"]}. {COPY["about.temp.band2.desc"]}.{" "}
          {COPY["about.temp.diagram.note"]}
        </desc>

        {/* Legenda */}
        <rect x={X0} y={28} width={24} height={11} rx={6} className={styles.band1} />
        <text x={X0 + 34} y={39} className={styles.legend}>
          {COPY["about.temp.band1"]}
        </text>
        <rect x={460} y={28} width={24} height={11} rx={6} className={styles.band2} />
        <text x={494} y={39} className={styles.legend}>
          {COPY["about.temp.band2"]}
        </text>

        {/* Sumbu dan garis acuan */}
        <path d={`M${X0} 230H${X1}`} className={styles.axis} />
        {MARKS.map((m) => (
          <path
            key={m.t}
            d={`M${x(m.t)} 70V230`}
            className={m.target ? styles.target : styles.guide}
          />
        ))}

        {/* Pita: tiap pita memuai dari ujung kirinya (transform-origin: kiri). */}
        <rect
          x={x(1.2)}
          y={100}
          width={x(4) - x(1.2)}
          height={26}
          rx={13}
          className={`${styles.band1} ${fill}`}
          style={{ transformOrigin: `${x(1.2)}px 113px` }}
        />
        <rect
          x={x(1.2)}
          y={150}
          width={x(1.5) - x(1.2)}
          height={26}
          rx={13}
          className={`${styles.band2} ${fill}`}
          style={{ transformOrigin: `${x(1.2)}px 163px` }}
        />

        {/* Label sumbu */}
        <text x={X0} y={258} textAnchor="middle" className={styles.tick}>
          0,0°C
        </text>
        {MARKS.map((m) => (
          <text
            key={m.t}
            x={x(m.t)}
            y={258}
            textAnchor="middle"
            className={m.target ? styles.tickTarget : styles.tick}
          >
            {m.label}
          </text>
        ))}
        <text x={X1} y={258} textAnchor="middle" className={styles.tick}>
          4,5°C
        </text>

        <text x={X0} y={305} className={styles.note}>
          {COPY["about.temp.diagram.note"]}
        </text>
      </svg>

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
