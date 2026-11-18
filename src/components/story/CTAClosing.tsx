import { useEffect, useRef } from "react";
import { COPY } from "@/content/copy";
import { storyEngine, type StoryEngine } from "@/engine/story-engine";
import { segmentAt, smoothstep } from "@/engine/timeline";
import styles from "./CTAClosing.module.css";

export interface CTAClosingProps {
  /** Instance StoryEngine (opsional; default singleton `storyEngine`). */
  engine?: StoryEngine;
}

/**
 * Ajakan penutup kampanye "Bawa botolmu besok." pada Bab 10e (`t = 0.72..1.00`).
 */
export function CTAClosing({ engine = storyEngine }: CTAClosingProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = (shown: number) => {
      const { id, t } = segmentAt(shown);
      if (id !== "b10" || t < 0.72) {
        el.style.opacity = "0";
        el.style.visibility = "hidden";
        return;
      }

      const alpha = smoothstep(0.72, 0.82, t);
      const ty = (1 - alpha) * 18;
      el.style.visibility = alpha <= 0.005 ? "hidden" : "visible";
      el.style.opacity = alpha.toFixed(3);
      el.style.transform = `translate3d(0, ${ty.toFixed(2)}px, 0)`;
    };

    update(engine.state.shown);
    return engine.onFrame((shown) => update(shown));
  }, [engine]);

  return (
    <div ref={ref} className={styles.wrap} data-cta-closing data-story-ui>
      <p className={`t-chapter ${styles.cta}`}>{COPY["ch10e.cta"]}</p>
    </div>
  );
}
