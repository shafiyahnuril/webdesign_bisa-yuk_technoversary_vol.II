import { useEffect, useRef } from "react";
import { computeCues } from "@/engine/cues";
import { storyEngine, type StoryEngine } from "@/engine/story-engine";
import { onTick } from "@/engine/ticker";
import { LENGTHS_VH, ORDER, chapterAt, segmentAt } from "@/engine/timeline";
import type { DebugOverlay } from "@/lib/debug";
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
    let overlay: DebugOverlay | undefined;
    let inspectFrame: ((shown: number, dt: number) => void) | undefined;
    let captureProgress: number | null = null;
    const teardown = () => {
      if (cleaned) return;
      cleaned = true;
      stopFrame?.();
      stopIdle?.();
      cancelAnimationFrame(readyFrame);
      director?.dispose();
      stage?.dispose();
      overlay?.dispose();
      if (import.meta.env.DEV) {
        delete document.documentElement.dataset.capture;
        delete document.documentElement.dataset.captureReady;
        delete document.documentElement.dataset.captureProgress;
        delete window.__REBOTTLE_CAPTURE_SEGMENTS__;
      }
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
      .then(async ([{ createStage }, { SceneDirector }, { createScenes }]) => {
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
            const progress = captureProgress ?? shown;
            const delta = captureProgress === null ? dt : 0;
            const cues = computeCues(progress);
            stage!.ctx.lights.rim.intensity = cues.rim;
            stage!.ctx.scene.environmentIntensity = cues.env;
            director!.update(progress, delta);
            stage!.render(delta);
            inspectFrame?.(progress, delta);
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
        if (import.meta.env.DEV) {
          const debug = await import("@/lib/debug");
          if (cancelled || failed) return;
          const flags = debug.getDevFlags();
          overlay = debug.createDebugOverlay(flags.debug);
          captureProgress = flags.freeze;
          if (flags.capture) document.documentElement.dataset.capture = flags.capture;
          inspectFrame = (shown, dt) => {
            const info = stage!.ctx.renderer.info;
            overlay!.update({
              shown,
              target: engine.state.target,
              chapter: chapterAt(shown),
              t: segmentAt(shown).t,
              fps: dt > 0 ? 1 / dt : 0,
              tier: stage!.ctx.quality,
              calls: info.render.calls,
              triangles: info.render.triangles,
              geometries: info.memory.geometries,
              textures: info.memory.textures,
            });
            if (flags.capture) {
              debug.publishCaptureState(
                shown,
                ORDER.map((id) => ({ id, length: LENGTHS_VH[id] })),
              );
            }
          };
          if (captureProgress !== null) {
            engine.preview?.(captureProgress);
            engine.pause();
          }
        }
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

  return <canvas ref={canvasRef} className={styles.canvas} data-capture-stage="" aria-hidden="true" />;
}
