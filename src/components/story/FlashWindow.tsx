import { useEffect, useRef } from "react";
import { storyEngine, type StoryEngine } from "@/engine/story-engine";
import { segmentAt, smoothstep } from "@/engine/timeline";
import styles from "./FlashWindow.module.css";

export interface FlashWindowProps {
  /** Instance StoryEngine (opsional; default singleton `storyEngine`). */
  engine?: StoryEngine;
  /** Label di luar area gambar kilas. Default: "Sungai yang sama. Sekarang." */
  caption?: string;
}

/**
 * Bingkai DOM jendela kilas Bab 7c (`t = 0.40..0.70`).
 * Area gambar diberi atribut `data-flash-window` untuk rect scissor pass Three.js oleh koordinator;
 * label diletakkan di luar area gambar agar tidak tertutup render scissor.
 */
export function FlashWindow({
  engine = storyEngine,
  caption = "Sungai yang sama. Sekarang.",
}: FlashWindowProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const update = (shown: number) => {
      const { id, t } = segmentAt(shown);
      if (id !== "b7" || t < 0.38 || t > 0.72) {
        el.style.opacity = "0";
        el.style.visibility = "hidden";
        return;
      }

      const enter = smoothstep(0.4, 0.46, t);
      const exit = 1 - smoothstep(0.66, 0.7, t);
      const alpha = Math.min(enter, exit);
      const scale = 0.8 + 0.2 * alpha;

      el.style.visibility = alpha <= 0.005 ? "hidden" : "visible";
      el.style.opacity = alpha.toFixed(3);
      el.style.transform = `scale(${scale.toFixed(4)})`;
    };

    update(engine.state.shown);
    return engine.onFrame((shown) => update(shown));
  }, [engine]);

  return (
    <div ref={wrapRef} className={styles.wrap} data-flash-container data-story-ui>
      <div
        className={styles.viewport}
        data-flash-window
        role="img"
        aria-label="Kilas sungai yang kini jernih tanpa sampah"
      />
      <p className={`t-ui-sm ${styles.caption}`}>{caption}</p>
    </div>
  );
}
