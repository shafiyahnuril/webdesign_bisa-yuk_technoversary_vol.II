import { useEffect, useRef } from "react";
import { createLoopGesture } from "@/engine/loop-gesture";
import { storyEngine, type StoryEngine } from "@/engine/story-engine";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import styles from "./LoopDome.module.css";

export interface LoopDomeProps {
  /** Instance StoryEngine (opsional; default singleton `storyEngine`). */
  engine?: StoryEngine;
  /** Callback saat perubahan pull melewati/turun dari ambang 0.05 (untuk menyembunyikan petunjuk `(Terus gulir)`). */
  onPullHintChange?: (hideHint: boolean) => void;
  /** Callback saat loop penuh berhasil di-commit (`engine.reset()`). */
  onCommit?: () => void;
}

/**
 * Setengah lingkaran biru hero (`#0B2B80`, `z-index: 50`) yang naik dari bawah layar
 * saat pengunjung menarik penuh di akhir Bab 10 (`shown >= 0.999`).
 * Menggunakan `createLoopGesture` aktual dari `src/engine/loop-gesture.ts` (berbagi ticker GSAP,
 * tanpa membuat `requestAnimationFrame` loop kedua).
 */
export function LoopDome({
  engine = storyEngine,
  onPullHintChange,
  onCommit,
}: LoopDomeProps) {
  const domeRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotion();
  const hintCallbackRef = useRef(onPullHintChange);
  const commitCallbackRef = useRef(onCommit);

  useEffect(() => {
    hintCallbackRef.current = onPullHintChange;
    commitCallbackRef.current = onCommit;
  }, [onPullHintChange, onCommit]);

  useEffect(() => {
    const domeEl = domeRef.current;
    if (!domeEl) return;

    let lastHideHint = false;

    const gesture = createLoopGesture({
      engine,
      reducedMotion,
      onPull(_pull, shownPull) {
        domeEl.style.setProperty("--pull", shownPull.toFixed(4));
        const shouldHide = shownPull > 0.05;
        if (shouldHide !== lastHideHint) {
          lastHideHint = shouldHide;
          hintCallbackRef.current?.(shouldHide);
        }
      },
      onCommit() {
        lastHideHint = false;
        hintCallbackRef.current?.(false);
        commitCallbackRef.current?.();
      },
    });

    return () => {
      gesture.dispose();
    };
  }, [engine, reducedMotion]);

  return (
    <div
      ref={domeRef}
      className={styles.dome}
      aria-hidden="true"
      data-loop-dome
      data-story-ui
    />
  );
}
