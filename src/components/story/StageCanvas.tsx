import { useEffect, useRef } from "react";
import { computeCues } from "@/engine/cues";
import { storyEngine, type StoryEngine } from "@/engine/story-engine";
import { onTick } from "@/engine/ticker";
import { LENGTHS_VH, ORDER, chapterAt, segmentAt, smoothstep } from "@/engine/timeline";
import type { DebugOverlay } from "@/lib/debug";
import type { Stage } from "@/stage/stage";
import type { SceneDirector } from "@/stage/director";
import type { QualityTier } from "@/stage/quality";
import type { FlashPass } from "@/stage/scenes/flash";
import type { ProcessStationsHandle } from "@/stage/scenes/b9";
import type { Vector3 } from "three";
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
    engine.setReady?.(false);
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
    let flashElement: HTMLElement | null = null;
    let flashWasActive = false;
    let rectDirty = true;
    let previousSegment = "";
    let stationLabels: HTMLElement[] = [];
    let projected: Vector3 | undefined;
    let rectObserver: ResizeObserver | undefined;
    let flashBase: { right: number; top: number; width: number; height: number } | undefined;
    const invalidateRect = () => {
      rectDirty = true;
    };
    window.addEventListener("resize", invalidateRect, { passive: true });
    const teardown = () => {
      if (cleaned) return;
      cleaned = true;
      stopFrame?.();
      stopIdle?.();
      window.removeEventListener("resize", invalidateRect);
      rectObserver?.disconnect();
      cancelAnimationFrame(readyFrame);
      director?.dispose();
      stage?.dispose();
      engine.setReady?.(true);
      overlay?.dispose();
      if (import.meta.env.DEV) {
        if (window.__REBOTTLE_RUNTIME__?.stage === stage) delete window.__REBOTTLE_RUNTIME__;
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
        callbacksRef.current.onQualityChange?.(stage.ctx.quality);
        stage.ctx.renderer.info.autoReset = false;
        const renderFrame = (shown: number, dt: number) => {
          if (cancelled || failed || document.visibilityState === "hidden") return;
          try {
            const progress = captureProgress ?? shown;
            const delta = captureProgress === null ? dt : 0;
            const segment = segmentAt(progress).id;
            if (segment !== previousSegment) {
              previousSegment = segment;
              stationLabels = [...document.querySelectorAll<HTMLElement>("[data-station-index]")];
              flashElement = document.querySelector<HTMLElement>("[data-flash-window]");
              rectDirty = true;
            }
            const cues = computeCues(progress);
            stage!.ctx.lights.rim.intensity = cues.rim;
            stage!.ctx.scene.environmentIntensity = cues.env;
            director!.update(progress, delta);
            stage!.ctx.renderer.info.reset();
            stage!.render(delta);
            const flash = stage!.ctx.shared.get<FlashPass>("flash");
            const flashActive = flash?.isActive() ?? false;
            if (flash && flashActive && flashElement) {
              const t = segmentAt(progress).t;
              const alpha =
                segment === "b7"
                  ? Math.min(smoothstep(0.4, 0.46, t), 1 - smoothstep(0.66, 0.7, t))
                  : 1;
              const scale = 0.8 + 0.2 * alpha;
              flash.setOpacity?.(alpha);
              if (!flashWasActive) rectDirty = true;
              if (rectDirty) {
                const rect = flashElement.getBoundingClientRect();
                const canvasRect = canvas.getBoundingClientRect();
                flashBase = {
                  right: rect.right - canvasRect.left,
                  top: rect.top - canvasRect.top,
                  width: rect.width / scale,
                  height: rect.height / scale,
                };
                rectDirty = false;
                if (!rectObserver && typeof ResizeObserver !== "undefined") {
                  rectObserver = new ResizeObserver(invalidateRect);
                  rectObserver.observe(flashElement);
                }
              }
              if (flashBase)
                flash.setRect({
                  x: flashBase.right - flashBase.width * scale,
                  y: flashBase.top,
                  width: flashBase.width * scale,
                  height: flashBase.height * scale,
                });
              flash.renderPass();
            }
            flashWasActive = flashActive;
            if (segment === "b9" && stationLabels.length > 0) {
              const stations = stage!.ctx.shared.get<ProcessStationsHandle>("stations");
              if (stations) {
                const { camera, size } = stage!.ctx;
                camera.updateMatrixWorld();
                projected ??= camera.position.clone();
                stations.getStationPositions().forEach((position, index) => {
                  const label = stationLabels.find(
                    (el) => Number(el.dataset.stationIndex) === index,
                  );
                  if (!label) return;
                  projected!.set(position.x, position.y, position.z).project(camera);
                  const { x, y, z } = projected!;
                  const px = ((x + 1) * size.w) / 2;
                  const minPy = size.w <= 768 ? 138 : 116;
                  const py = Math.max(minPy, ((1 - y) * size.h) / 2);
                  label.style.visibility = z >= -1 && z <= 1 && Math.abs(x) <= 1.2 ? "" : "hidden";
                  label.style.transform = `translate3d(${px.toFixed(2)}px,${py.toFixed(2)}px,0) translate(-50%,-100%)`;
                });
              }
            }
            inspectFrame?.(progress, delta);
          } catch (error) {
            fail(error);
          }
        };
        stopFrame = engine.onFrame(renderFrame, 10);
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
          if (flags.debug) window.__REBOTTLE_RUNTIME__ = { engine, stage, director };
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
            engine.setReady?.(true);
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

  return (
    <canvas ref={canvasRef} className={styles.canvas} data-capture-stage="" aria-hidden="true" />
  );
}
