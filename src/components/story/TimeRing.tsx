import { useEffect, useRef } from "react";
import { storyEngine, type StoryEngine } from "@/engine/story-engine";
import { clamp01, lerp, segmentAt, type SegId } from "@/engine/timeline";
import styles from "./TimeRing.module.css";

export interface TimeRingProps {
  /** Segmen bab tempat cincin waktu bekerja ("b2" atau "b7"). */
  segment: Extract<SegId, "b2" | "b7">;
  /** Nilai maksimum waktu (default 10). */
  max?: number;
  /** Satuan waktu ("menit" di B2, "detik" di B7). */
  unit: string;
  /** Rentang waktu lokal `t` saat cincin terisi. */
  range?: readonly [number, number];
  /** Instance StoryEngine (opsional; default singleton `storyEngine`). */
  engine?: StoryEngine;
}

/**
 * Cincin waktu SVG (diadaptasi dari `TimeRingArtwork` pada `rebottle_assets`)
 * untuk Bab 2 ("10 menit", `t = 0.22..0.52`) dan Bab 7 ("10 detik", `t = 0.14..0.34`).
 */
export function TimeRing({
  segment,
  max = 10,
  unit,
  range,
  engine = storyEngine,
}: TimeRingProps) {
  const progressCircleRef = useRef<SVGCircleElement | null>(null);
  const valueRef = useRef<HTMLSpanElement | null>(null);

  const defaultRange: readonly [number, number] =
    segment === "b2" ? [0.22, 0.52] : [0.14, 0.34];
  const activeRange = range ?? defaultRange;

  useEffect(() => {
    const circle = progressCircleRef.current;
    const valEl = valueRef.current;
    if (!circle || !valEl) return;

    const [startT, endT] = activeRange;
    const span = Math.max(0.001, endT - startT);

    const update = (shown: number) => {
      const { id, t } = segmentAt(shown);
      const progress = id === segment ? clamp01((t - startT) / span) : 0;
      const offset = (1 - progress).toFixed(4);
      circle.setAttribute("stroke-dashoffset", offset);

      const num = Math.round(lerp(0, max, progress));
      const str = String(num);
      if (valEl.textContent !== str) {
        valEl.textContent = str;
      }
    };

    update(engine.state.shown);
    return engine.onFrame((shown) => update(shown));
  }, [segment, max, activeRange, engine]);

  const ariaLabel =
    segment === "b2"
      ? `Cincin durasi Bab 2, ${max} ${unit}`
      : `Cincin durasi Bab 7, ${max} ${unit}`;

  return (
    <div className={styles.ring} role="img" aria-label={ariaLabel} data-time-ring={segment}>
      <svg
        className={styles.svg}
        viewBox="0 0 140 140"
        aria-hidden="true"
        focusable="false"
      >
        <circle
          cx="70"
          cy="70"
          r="62"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeOpacity="0.24"
          fill="none"
        />
        <circle
          ref={progressCircleRef}
          cx="70"
          cy="70"
          r="62"
          pathLength={1}
          stroke="var(--accent-now)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="1"
          strokeDashoffset="1"
          fill="none"
          transform="rotate(-90 70 70)"
          data-time-ring-progress
        />
      </svg>
      <div className={styles.center} aria-hidden="true">
        <span ref={valueRef} className={styles.value}>
          0
        </span>
        <small className={styles.unit}>{unit}</small>
      </div>
    </div>
  );
}
