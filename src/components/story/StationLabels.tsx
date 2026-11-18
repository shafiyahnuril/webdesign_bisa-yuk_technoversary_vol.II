import { useEffect, useMemo, useRef } from "react";
import { COPY } from "@/content/copy";
import { storyEngine, type StoryEngine } from "@/engine/story-engine";
import { segmentAt, smoothstep } from "@/engine/timeline";
import styles from "./StationLabels.module.css";

export interface StationLabelsProps {
  /** Instance StoryEngine (opsional; default singleton `storyEngine`). */
  engine?: StoryEngine;
}

interface StationMeta {
  index: number;
  num: string;
  name: string;
  micro?: "drop" | "bolt";
  microText?: string;
}

/**
 * Empat label stasiun Bab 9 (`01 CACAH · 02 CUCI · 03 LEBUR · 04 CETAK`).
 * Setiap item memiliki atribut `data-station-index="0".."3"` dengan `position: absolute; left: 0; top: 0`
 * agar koordinator 3D dapat memproyeksikan posisi world -> screen melalui `transform`.
 */
export function StationLabels({ engine = storyEngine }: StationLabelsProps) {
  const wrapRef = useRef<HTMLOListElement | null>(null);

  const stations = useMemo<StationMeta[]>(() => {
    const names = COPY["ch9.stations"].split("·").map((s) => s.trim());
    return [
      { index: 0, num: "01", name: names[0] ?? "Cacah" },
      { index: 1, num: "02", name: names[1] ?? "Cuci", micro: "drop", microText: "air" },
      { index: 2, num: "03", name: names[2] ?? "Lebur", micro: "bolt", microText: "energi" },
      { index: 3, num: "04", name: names[3] ?? "Cetak" },
    ];
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const update = (shown: number) => {
      const { id, t } = segmentAt(shown);
      if (id !== "b9" || t > 0.88) {
        el.style.opacity = "0";
        el.style.visibility = "hidden";
        return;
      }

      const enter = smoothstep(0.02, 0.1, t);
      const exit = 1 - smoothstep(0.8, 0.86, t);
      const alpha = Math.min(enter, exit);

      el.style.visibility = alpha <= 0.005 ? "hidden" : "visible";
      el.style.opacity = alpha.toFixed(3);
    };

    update(engine.state.shown);
    return engine.onFrame((shown) => update(shown));
  }, [engine]);

  // Posisi fallback layar jika belum dioverride oleh proyeksi 3D koordinator
  const defaultPositions = [
    "translate3d(18vw, 24dvh, 0)",
    "translate3d(38vw, 24dvh, 0)",
    "translate3d(58vw, 24dvh, 0)",
    "translate3d(78vw, 24dvh, 0)",
  ];

  return (
    <ol
      ref={wrapRef}
      className={styles.list}
      aria-label="Stasiun daur ulang Bab 9"
      data-station-labels
      data-story-ui
    >
      {stations.map((st) => (
        <li
          key={st.index}
          className={styles.station}
          data-station-index={st.index}
          style={{ transform: defaultPositions[st.index] }}
        >
          <span className={styles.badge}>
            <span className={styles.num}>{st.num}</span>
            <span className={styles.name}>{st.name}</span>
          </span>
          {st.micro ? (
            <span className={styles.micro} data-station-micro={st.micro}>
              {st.micro === "drop" ? (
                <svg
                  className={styles.icon}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    d="M12 3c-3 4-7 8-7 12a7 7 0 0 0 14 0c0-4-4-8-7-12Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg
                  className={styles.icon}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    d="M12.8 2.8 5 14h6l-.8 7.2L19 10h-6l-.2-7.2Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
              <span>{st.microText}</span>
            </span>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
