import { useEffect, useRef } from "react";
import { computeCues } from "@/engine/cues";
import { storyEngine, type StoryEngine } from "@/engine/story-engine";
import { onTick } from "@/engine/ticker";
import type { Stage } from "@/stage/stage";
import type { SceneDirector } from "@/stage/director";
import type { QualityTier } from "@/stage/quality";
import styles from "./StageCanvas.module.css";

export interface StageCanvasProps {
  engine?: StoryEngine;
  reducedMotion?: boolean;
  onReady?: () => void;
  onFailure?: (error: Error) => void;
  onQualityChange?: (tier: QualityTier) => void;
}

/** Satu renderer Home; seluruh frame mengikuti shown dari engine cerita. */
export function StageCanvas({
  engine = storyEngine,
  reducedMotion = false,
  ...callbacks
}: StageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef(callbacks);
  useEffect(() => {
    callbacksRef.current = callbacks;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    let failed = false;
    let cleaned = false;
    let stage: Stage | undefined;
    let director: SceneDirector | undefined;
    let stopFrame: (() => void) | undefined;
    let stopIdle: (() => void) | undefined;
    let readyFrame = 0;
    let pausedTime = 0;
    const teardown = () => {
      if (cleaned) return;
      cleaned = true;
      stopFrame?.();
      stopIdle?.();
      cancelAnimationFrame(readyFrame);
      director?.dispose();
      stage?.dispose();
    };
    const fail = (reason: unknown) => {
      if (cancelled || failed) return;
      failed = true;
      clearTimeout(timeout);
      teardown();
      callbacksRef.current.onFailure?.(
        reason instanceof Error ? reason : new Error(String(reason)),
      );
    };
    const timeout = window.setTimeout(() => fail(new Error("Panggung 3D belum siap")), 4000);

    void Promise.all([
      import("@/stage/stage"),
      import("@/stage/director"),
      import("@/stage/scenes"),
    ])
      .then(([{ createStage }, { SceneDirector }, { createScenes }]) => {
        if (cancelled || failed) return;
        stage = createStage(canvas, undefined, {
          container: canvas.parentElement ?? undefined,
          reducedMotion,
          onContextLost: () => fail(new Error("Konteks WebGL terputus")),
          onQualityChange: (tier) => callbacksRef.current.onQualityChange?.(tier),
        });
        director = new SceneDirector(stage.ctx, createScenes());
        const renderFrame = (shown: number, dt: number) => {
          if (cancelled || failed || document.visibilityState === "hidden") return;
          try {
            const cues = computeCues(shown);
            stage!.ctx.lights.rim.intensity = cues.rim;
            stage!.ctx.scene.environmentIntensity = cues.env;
            director!.update(shown, dt);
            stage!.render(dt);
          } catch (error) {
            fail(error);
          }
        };
        stopFrame = engine.onFrame(renderFrame);
        // Menu menghentikan progres cerita; idle tetap menggunakan ticker GSAP bersama.
        stopIdle = onTick((dt) => {
          if (!engine.state.paused || reducedMotion) return;
          pausedTime += dt;
          if (pausedTime < 1 / 30) return;
          renderFrame(engine.state.shown, Math.min(pausedTime, 1 / 15));
          pausedTime = 0;
        });
        renderFrame(engine.state.shown, 0);
        // ResizeObserver boleh mengosongkan buffer pertama sebelum paint.
        readyFrame = requestAnimationFrame(() => {
          renderFrame(engine.state.shown, 0);
          if (!cancelled && !failed) {
            clearTimeout(timeout);
            canvas.dataset.ready = "true";
            callbacksRef.current.onReady?.();
          }
        });
      })
      .catch(fail);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      teardown();
    };
  }, [engine, reducedMotion]);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
}
