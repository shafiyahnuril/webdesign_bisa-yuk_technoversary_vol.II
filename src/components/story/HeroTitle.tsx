import { useEffect, useRef } from "react";
import { BrandMark } from "@/components/ui/BrandMark";
import { storyEngine, type StoryEngine } from "@/engine/story-engine";
import { clamp01, segmentAt } from "@/engine/timeline";
import styles from "./HeroTitle.module.css";

export interface HeroTitleProps {
  /** Instance StoryEngine (opsional; default singleton `storyEngine`). */
  engine?: StoryEngine;
}

/**
 * Judul besar "Re:bottle" (`z-index: 10`) di belakang kanvas botol 3D (`z-index: 20`).
 * Aktif hanya di Bab 1: bertahan di `t = 0..0.06`, lalu `scale 1 -> 1.16`,
 * `opacity 1 -> 0`, `translateY 0 -> -4dvh` pada `t = 0.06..0.28`.
 */
export function HeroTitle({ engine = storyEngine }: HeroTitleProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const applyFrame = (shown: number) => {
      const { id, t } = segmentAt(shown);
      if (id !== "b1" || t >= 0.3) {
        el.style.opacity = "0";
        el.style.visibility = "hidden";
        return;
      }

      const progress = t <= 0.06 ? 0 : clamp01((t - 0.06) / (0.28 - 0.06));
      const opacity = 1 - progress;
      const scale = 1 + progress * 0.16;
      const ty = -progress * 4;

      el.style.visibility = opacity <= 0.001 ? "hidden" : "visible";
      el.style.opacity = opacity.toFixed(3);
      el.style.transform = `translate3d(0, ${ty.toFixed(2)}dvh, 0) scale(${scale.toFixed(4)})`;
    };

    applyFrame(engine.state.shown);
    return engine.onFrame((shown) => applyFrame(shown));
  }, [engine]);

  return (
    <div ref={wrapRef} className={styles.wrap} data-hero-title data-story-ui>
      <BrandMark as="h1" size="hero" className={styles.title} />
    </div>
  );
}
