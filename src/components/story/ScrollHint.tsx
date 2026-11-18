import { useEffect, useRef } from "react";
import { COPY } from "@/content/copy";
import { storyEngine, type StoryEngine } from "@/engine/story-engine";
import { clamp01, segmentAt } from "@/engine/timeline";
import styles from "./ScrollHint.module.css";

export interface ScrollHintProps {
  /**
   * `start` = "(Gulir untuk mulai)" di hero Bab 1 (`shown <= 0.004`).
   * `loop` = "(Terus gulir)" di akhir Bab 10e (`t >= 0.93`, hilang saat `pull > 0.05`).
   */
  variant: "start" | "loop";
  /** Instance StoryEngine (opsional; default singleton `storyEngine`). */
  engine?: StoryEngine;
  /** Apakah disembunyikan secara eksternal (mis. `pull > 0.05` dari LoopDome). */
  hiddenByPull?: boolean;
}

export function ScrollHint({
  variant,
  engine = storyEngine,
  hiddenByPull = false,
}: ScrollHintProps) {
  const ref = useRef<HTMLParagraphElement | null>(null);
  const hiddenByPullRef = useRef(hiddenByPull);

  useEffect(() => {
    hiddenByPullRef.current = hiddenByPull;
    if (ref.current && hiddenByPull) {
      ref.current.style.opacity = "0";
      ref.current.style.visibility = "hidden";
    }
  }, [hiddenByPull]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = (shown: number) => {
      if (variant === "start") {
        const fade = clamp01(1 - shown / 0.004);
        el.style.opacity = fade.toFixed(3);
        el.style.visibility = fade <= 0.01 ? "hidden" : "visible";
      } else {
        if (hiddenByPullRef.current) {
          el.style.opacity = "0";
          el.style.visibility = "hidden";
          return;
        }
        const { id, t } = segmentAt(shown);
        if (id !== "b10" || t < 0.93) {
          el.style.opacity = "0";
          el.style.visibility = "hidden";
          return;
        }
        const fade = clamp01((t - 0.93) / 0.05);
        el.style.opacity = fade.toFixed(3);
        el.style.visibility = fade <= 0.01 ? "hidden" : "visible";
      }
    };

    update(engine.state.shown);
    return engine.onFrame((shown) => update(shown));
  }, [variant, engine]);

  const text = variant === "start" ? COPY["hero.hint"] : COPY["end.hint"];

  return (
    <p
      ref={ref}
      className={styles.hint}
      data-scroll-hint={variant}
      data-story-ui
    >
      <span>{text}</span>
      <svg
        className={styles.chevron}
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="m5 9 7 7 7-7"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </p>
  );
}
