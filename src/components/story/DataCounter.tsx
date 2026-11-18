import { useEffect, useRef } from "react";
import { storyEngine, type StoryEngine } from "@/engine/story-engine";
import { clamp01, lerp, segmentAt, type SegId } from "@/engine/timeline";
import styles from "./DataCounter.module.css";

export interface DataCounterProps {
  /** ID segmen tempat counter bekerja (mis. "b3", "b5", "b6"). */
  segment: SegId;
  /** Nilai awal counter. Default: 0. */
  from?: number;
  /** Nilai akhir counter (mis. 450 atau 2400). */
  to: number;
  /** Satuan / label di samping atau di bawah angka. */
  unit: string;
  /** Rentang waktu lokal `t` (0..1) tempat counter naik. Default: [0.2, 0.66]. */
  range?: readonly [number, number];
  /** Keterangan tambahan di bawah (mis. "(ilustrasi)" atau catatan sumber). */
  note?: string;
  /** Instance StoryEngine (opsional; default singleton `storyEngine`). */
  engine?: StoryEngine;
}

const INT_FORMAT = new Intl.NumberFormat("id-ID");

/**
 * Counter angka tabular (`JetBrains Mono Variable`, `tabular-nums`) yang naik
 * secara imperatif mengikuti `shown` tanpa memicu re-render React per frame.
 */
export function DataCounter({
  segment,
  from = 0,
  to,
  unit,
  range = [0.2, 0.66],
  note,
  engine = storyEngine,
}: DataCounterProps) {
  const numRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = numRef.current;
    if (!el) return;

    const [startT, endT] = range;
    const span = Math.max(0.001, endT - startT);

    const update = (shown: number) => {
      const { id, t } = segmentAt(shown);
      let k = 0;
      if (id === segment) {
        k = clamp01((t - startT) / span);
      } else {
        k = t > endT ? 1 : 0;
      }
      const value = Math.round(lerp(from, to, k));
      const formatted = INT_FORMAT.format(value);
      if (el.textContent !== formatted) {
        el.textContent = formatted;
      }
    };

    update(engine.state.shown);
    return engine.onFrame((shown) => update(shown));
  }, [segment, from, to, range, engine]);

  return (
    <div className={styles.counter} data-counter={segment}>
      <p className={styles.row}>
        <span ref={numRef} className={`t-data ${styles.number}`} data-counter-value>
          {INT_FORMAT.format(from)}
        </span>
        <span className={`t-ui ${styles.unit}`}>{unit}</span>
      </p>
      {note ? <p className={`t-ui-sm ${styles.note}`}>{note}</p> : null}
    </div>
  );
}
