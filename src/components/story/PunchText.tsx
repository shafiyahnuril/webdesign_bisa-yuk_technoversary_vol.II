import { useEffect, useMemo, useRef } from "react";
import { COPY } from "@/content/copy";
import { storyEngine, type StoryEngine } from "@/engine/story-engine";
import { clamp01, segmentAt, smoothstep } from "@/engine/timeline";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import styles from "./PunchText.module.css";

export interface PunchTextProps {
  /** Instance StoryEngine (opsional; default singleton `storyEngine`). */
  engine?: StoryEngine;
}

/**
 * Layar hening Punchline ("Bagaimana jika semua ini tidak terjadi?"):
 * - `t = 0.00..0.40`: *rewind* tanpa teks.
 * - `t = 0.40..0.48`: kalimat masuk kata demi kata di tengah layar.
 * - `t = 0.48..0.90`: TAHAN (±76 vh gulir).
 * - `t = 0.90..1.00`: teks keluar sebelum transisi ke Bab 7 (*text gap*).
 */
export function PunchText({ engine = storyEngine }: PunchTextProps) {
  const reducedMotion = useReducedMotion();
  const text = COPY["punch.line"];
  const words = useMemo(() => text.trim().split(/\s+/), [text]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const total = Math.max(1, words.length);

    const update = (shown: number) => {
      const { id, t } = segmentAt(shown);
      if (id !== "punch" || t < 0.39 || t >= 0.99) {
        container.style.opacity = "0";
        container.style.visibility = "hidden";
        return;
      }

      const exitAlpha = t <= 0.9 ? 1 : 1 - smoothstep(0.9, 0.98, t);
      const exitTy = t <= 0.9 ? 0 : -16 * smoothstep(0.9, 0.98, t);

      container.style.visibility = exitAlpha <= 0.005 ? "hidden" : "visible";
      container.style.opacity = exitAlpha.toFixed(3);
      container.style.transform = `translate3d(0, ${exitTy.toFixed(2)}px, 0)`;

      const revealProgress = clamp01((t - 0.4) / 0.16);
      for (let i = 0; i < total; i++) {
        const wordEl = wordRefs.current[i];
        if (!wordEl) continue;
        if (reducedMotion) {
          wordEl.style.opacity = "1";
        } else {
          const wStart = (i / total) * 0.76;
          const wAlpha = clamp01((revealProgress - wStart) / 0.24);
          wordEl.style.opacity = wAlpha.toFixed(3);
        }
      }
    };

    update(engine.state.shown);
    return engine.onFrame((shown) => update(shown));
  }, [words, reducedMotion, engine]);

  return (
    <div
      ref={containerRef}
      className={styles.punch}
      data-story-segment="punch"
      data-story-ui
    >
      <p className={`t-punch ${styles.sentence}`}>
        <span className="sr-only">{text}</span>
        <span aria-hidden="true">
          {words.map((word, idx) => (
            <span
              key={idx}
              ref={(el) => {
                wordRefs.current[idx] = el;
              }}
              className={styles.word}
              data-punch-word
            >
              {word}
              {idx < words.length - 1 ? " " : ""}
            </span>
          ))}
        </span>
      </p>
    </div>
  );
}
