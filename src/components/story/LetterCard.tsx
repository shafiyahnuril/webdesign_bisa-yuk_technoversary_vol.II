import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import { storyEngine, type StoryEngine } from "@/engine/story-engine";
import { clamp01, segmentAt, type SegId } from "@/engine/timeline";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import styles from "./LetterCard.module.css";

export interface LetterCardProps {
  /** Naskah surat dari COPY (`ch7.letter`..`ch10d.letter`). */
  text: string;
  /** Segmen tempat surat ini muncul ("b7", "b8", "b9", "b10"). */
  segment: Extract<SegId, "b7" | "b8" | "b9" | "b10">;
  /** Rentang waktu lokal `t` saat kata-kata surat mulai muncul dan bertahan. */
  wordRange: readonly [number, number];
  /** Kemiringan kartu dalam derajat (mis. -1.2). Default: -1.2. */
  tiltDeg?: number;
  /** Instance StoryEngine (opsional; default singleton `storyEngine`). */
  engine?: StoryEngine;
  className?: string;
}

/**
 * Kartu surat Babak II ("Surat dari Botol"):
 * - Panel kertas `#F4F8F2` 88%, tinta `#11261B`, kop kecil "Re:" di atas.
 * - Teks Caveat (`--t-letter`) muncul kata demi kata mengikuti `shown`.
 */
export function LetterCard({
  text,
  segment,
  wordRange,
  tiltDeg = -1.2,
  engine = storyEngine,
  className,
}: LetterCardProps) {
  const reducedMotion = useReducedMotion();
  const words = useMemo(() => text.trim().split(/\s+/), [text]);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    if (reducedMotion) {
      wordRefs.current.forEach((el) => {
        if (el) el.style.opacity = "1";
      });
      return;
    }

    const [startT, endT] = wordRange;
    const span = Math.max(0.01, endT - startT);
    const total = Math.max(1, words.length);

    const update = (shown: number) => {
      const { id, t } = segmentAt(shown);
      const progress = id === segment ? clamp01((t - startT) / span) : 0;

      for (let i = 0; i < total; i++) {
        const el = wordRefs.current[i];
        if (!el) continue;
        const wordStart = (i / total) * 0.75;
        const wordOpacity = clamp01((progress - wordStart) / 0.25);
        el.style.opacity = wordOpacity.toFixed(3);
      }
    };

    update(engine.state.shown);
    return engine.onFrame((shown) => update(shown));
  }, [segment, wordRange, words, reducedMotion, engine]);

  const classes = [styles.card, className ?? ""].filter(Boolean).join(" ");

  return (
    <blockquote
      className={classes}
      style={{ "--letter-tilt": `${tiltDeg}deg` } as CSSProperties}
      data-letter-card={segment}
    >
      <p className={styles.mark} aria-hidden="true">
        Re:
      </p>
      <p className={`t-letter ${styles.body}`}>
        <span className="sr-only">{text}</span>
        <span aria-hidden="true">
          {words.map((word, idx) => (
            <span
              key={idx}
              ref={(el) => {
                wordRefs.current[idx] = el;
              }}
              className={styles.word}
              data-letter-word
            >
              {word}
              {idx < words.length - 1 ? " " : ""}
            </span>
          ))}
        </span>
      </p>
    </blockquote>
  );
}
