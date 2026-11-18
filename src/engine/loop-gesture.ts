import { ENGINE } from "@/lib/tokens";
import { isEditableTarget } from "./input";
import type { StoryEngine, StoryScheduler } from "./story-engine";
import { onTick } from "./ticker";

export interface LoopGestureOptions {
  engine: Pick<StoryEngine, "state" | "reset">;
  onPull: (pull: number, shownPull: number) => void;
  onCommit?: () => void;
  reducedMotion?: boolean;
  scheduler?: StoryScheduler;
  root?: HTMLElement;
  now?: () => number;
  raf?: (cb: FrameRequestCallback) => number;
  cancelRaf?: (id: number) => void;
}

export interface LoopGesture {
  readonly pull: number;
  readonly shownPull: number;
  readonly busy: boolean;
  addPull(dy: number): void;
  tick(dt: number): void;
  dispose(): void;
}

const PASSIVE: AddEventListenerOptions = { passive: true };
const SHOWN_THRESHOLD = 0.999;
const ARROW_STEP = 60;
const SMOOTH_AT_60 = 0.35;

export function createLoopGesture(opts: LoopGestureOptions): LoopGesture {
  const { engine, onPull, onCommit } = opts;
  const scheduler = opts.scheduler ?? { add: onTick };
  const now = opts.now ?? (() => performance.now());
  const raf =
    opts.raf ??
    ((cb: FrameRequestCallback) =>
      typeof window !== "undefined" ? window.requestAnimationFrame(cb) : 0);
  const cancelRaf =
    opts.cancelRaf ??
    ((id: number) => {
      if (typeof window !== "undefined") window.cancelAnimationFrame(id);
    });

  const getRoot = (): HTMLElement | undefined =>
    opts.root ?? (typeof document !== "undefined" ? document.documentElement : undefined);

  const isReducedMotion = (): boolean => {
    if (opts.reducedMotion !== undefined) return opts.reducedMotion;
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  };

  let pull = 0;
  let shownPull = 0;
  let lastInput = 0;
  let busy = false;
  let disposed = false;
  let lastTouchY: number | null = null;
  let lastReportedPull = 0;
  let lastReportedShown = 0;
  let pendingRaf1: number | null = null;
  let pendingRaf2: number | null = null;

  const emitIfChanged = (force = false) => {
    if (force || pull !== lastReportedPull || shownPull !== lastReportedShown) {
      lastReportedPull = pull;
      lastReportedShown = shownPull;
      onPull(pull, shownPull);
    }
  };

  const addPull = (dy: number) => {
    if (disposed || busy || engine.state.paused || engine.state.shown < SHOWN_THRESHOLD) return;
    if (!Number.isFinite(dy) || dy <= 0) return;
    pull = Math.min(1, pull + dy * ENGINE.GAIN);
    lastInput = now();
  };

  const commitLoop = () => {
    if (busy || disposed) return;
    busy = true;
    pull = 1;
    shownPull = 1;
    emitIfChanged(true);

    const root = getRoot();
    pendingRaf1 = raf(() => {
      pendingRaf1 = null;
      if (disposed) return;
      root?.classList.add("snap");
      engine.reset();
      pull = 0;
      shownPull = 0;
      emitIfChanged(true);
      onCommit?.();

      pendingRaf2 = raf(() => {
        pendingRaf2 = null;
        root?.classList.remove("snap");
        busy = false;
      });
    });
  };

  const tick = (dt: number) => {
    if (disposed || busy) return;
    if (!Number.isFinite(dt) || dt <= 0) return;

    if (engine.state.paused || engine.state.shown < SHOWN_THRESHOLD) {
      if (pull !== 0 || shownPull !== 0) {
        pull = 0;
        shownPull = 0;
        emitIfChanged();
      }
      return;
    }

    if (pull > 0 && now() - lastInput > ENGINE.REST_DELAY) {
      const decayStep = 1 - Math.pow(1 - ENGINE.DECAY, dt * 60);
      pull = Math.max(0, pull - decayStep);
    }

    const alpha = isReducedMotion() ? 1 : 1 - Math.pow(1 - SMOOTH_AT_60, dt * 60);
    shownPull += (pull - shownPull) * alpha;
    if (pull === 0 && shownPull < 1e-4) {
      shownPull = 0;
    }

    emitIfChanged();

    if (pull >= 1) {
      commitLoop();
    }
  };

  const onWheel = (e: WheelEvent) => addPull(e.deltaY);
  const onTouchStart = (e: TouchEvent) => {
    lastTouchY = e.touches[0]?.clientY ?? null;
  };
  const onTouchMove = (e: TouchEvent) => {
    const y = e.touches[0]?.clientY;
    if (y === undefined) return;
    if (lastTouchY !== null) {
      addPull(lastTouchY - y);
    }
    lastTouchY = y;
  };
  const onTouchEnd = () => {
    lastTouchY = null;
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if (engine.state.paused || isEditableTarget(e.target)) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === "ArrowDown") {
      addPull(ARROW_STEP);
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener("wheel", onWheel, PASSIVE);
    window.addEventListener("touchstart", onTouchStart, PASSIVE);
    window.addEventListener("touchmove", onTouchMove, PASSIVE);
    window.addEventListener("touchend", onTouchEnd, PASSIVE);
    window.addEventListener("touchcancel", onTouchEnd, PASSIVE);
    window.addEventListener("keydown", onKeyDown);
  }

  const stopTick = scheduler.add(tick);

  const dispose = () => {
    if (disposed) return;
    disposed = true;
    stopTick();

    if (typeof window !== "undefined") {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
      window.removeEventListener("keydown", onKeyDown);
    }

    if (pendingRaf1 !== null) {
      cancelRaf(pendingRaf1);
      pendingRaf1 = null;
    }
    if (pendingRaf2 !== null) {
      cancelRaf(pendingRaf2);
      pendingRaf2 = null;
    }
    if (busy) {
      getRoot()?.classList.remove("snap");
      busy = false;
    }
  };

  return {
    get pull() {
      return pull;
    },
    get shownPull() {
      return shownPull;
    },
    get busy() {
      return busy;
    },
    addPull,
    tick,
    dispose,
  };
}
