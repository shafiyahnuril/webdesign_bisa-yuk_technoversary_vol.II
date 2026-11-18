import { useEffect, useRef } from "react";
import { COPY } from "@/content/copy";
import { storyEngine, type StoryEngine } from "@/engine/story-engine";
import { clamp01 } from "@/engine/timeline";
import styles from "./ScenarioLabel.module.css";

export interface ScenarioLabelProps {
  /** Instance StoryEngine (opsional; default singleton `storyEngine`). */
  engine?: StoryEngine;
}

/**
 * Label skenario wajib di hero Babak I:
 * "Skenario jika pola konsumsi plastik terus berlanjut."
 * Menghilang halus saat gulir dimulai (`shown > 0.004`).
 */
export function ScenarioLabel({ engine = storyEngine }: ScenarioLabelProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = (shown: number) => {
      const fade = clamp01(1 - shown / 0.004);
      el.style.opacity = fade.toFixed(3);
      el.style.visibility = fade <= 0.01 ? "hidden" : "visible";
    };

    update(engine.state.shown);
    return engine.onFrame((shown) => update(shown));
  }, [engine]);

  return (
    <div ref={ref} className={styles.wrap} data-story-ui>
      <p className={styles.label} data-scenario-label>
        {COPY["hero.scenario"]}
      </p>
    </div>
  );
}
