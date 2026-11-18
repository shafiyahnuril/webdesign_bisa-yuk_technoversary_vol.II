import { ENGINE } from "@/lib/tokens";
import { applyCues } from "./cues";
import { attachStoryInput } from "./input";
import { applyPalette } from "./palette";
import { storySignals } from "./signal";
import { onTick } from "./ticker";
import {
  PUNCH,
  TOTAL_VH,
  babakAt,
  chapterAt,
  clamp01,
  temperatureAt,
  viewAt,
  type StoryView,
} from "./timeline";

export interface StoryState {
  target: number;
  shown: number;
  paused: boolean;
  chapter: number;
  view: StoryView;
}

export interface StoryScheduler {
  add(fn: (dt: number) => void): () => void;
}

export interface CreateStoryEngineOptions {
  maxSpeedVh?: number;
  chase?: number;
  scheduler?: StoryScheduler;
  domRoot?: HTMLElement;
}

export interface StoryEngine {
  readonly state: Readonly<StoryState>;
  mount(root: HTMLElement): void;
  unmount(): void;
  pause(): void;
  resume(): void;
  reset(): void;
  onFrame(fn: (shown: number, dt: number) => void): () => void;
  onChapter(fn: (chapter: number, view: StoryState["view"]) => void): () => void;
  setViewportCache(): void;
}

const DEFAULT_SCHEDULER: StoryScheduler = {
  add: onTick,
};

function getViewportHeight(): number {
  return window.visualViewport?.height ?? window.innerHeight;
}

function safeScrollToTop(top: number): void {
  if (typeof window === "undefined" || typeof window.scrollTo !== "function") return;
  try {
    window.scrollTo({ top, left: 0, behavior: "instant" });
  } catch {
    window.scrollTo(0, top);
  }
}

export function createStoryEngine(opts: CreateStoryEngineOptions = {}): StoryEngine {
  const maxSpeedVh = opts.maxSpeedVh ?? ENGINE.MAX_SPEED_VH;
  const chase = opts.chase ?? ENGINE.CHASE;
  const maxRate = maxSpeedVh / TOTAL_VH;
  const scheduler = opts.scheduler ?? DEFAULT_SCHEDULER;

  const state: StoryState = {
    target: 0,
    shown: 0,
    paused: false,
    chapter: 1,
    view: "1",
  };

  const frameSubs = new Set<(shown: number, dt: number) => void>();
  const chapterSubs = new Set<(chapter: number, view: StoryState["view"]) => void>();

  let mounted = false;
  let maxScroll = 0;
  let tabHidden = false;
  let justResumedFromHidden = false;
  let createdScroller: HTMLElement | null = null;
  let prevScrollRestoration: History["scrollRestoration"] | null = null;
  let stopInput: (() => void) | null = null;
  let stopTick: (() => void) | null = null;
  let lastDiscreteKey = "";

  const getDomRoot = (): HTMLElement | undefined =>
    opts.domRoot ?? (typeof document !== "undefined" ? document.documentElement : undefined);

  const syncRe = (p: number, domRoot: HTMLElement | undefined): boolean => {
    const on = p >= PUNCH.to;
    if (domRoot) {
      const nextAttr = on ? "on" : "off";
      if (domRoot.dataset.re !== nextAttr) {
        domRoot.dataset.re = nextAttr;
      }
    }
    return on;
  };

  const syncDiscrete = (forceEmit = false) => {
    const chapter = chapterAt(state.shown);
    const view = viewAt(state.shown);
    const re = state.shown >= PUNCH.to;
    const paused = state.paused;
    const chapterChanged = chapter !== state.chapter || view !== state.view;

    state.chapter = chapter;
    state.view = view;

    const key = `${chapter}|${view}|${re ? 1 : 0}|${paused ? 1 : 0}`;
    if (forceEmit || key !== lastDiscreteKey) {
      lastDiscreteKey = key;
      storySignals.set({
        shown: state.shown,
        chapter,
        babak: babakAt(state.shown),
        temp: temperatureAt(state.shown),
        re,
        paused,
      });
    }

    if (forceEmit || chapterChanged) {
      chapterSubs.forEach((fn) => fn(chapter, view));
    }
  };

  const renderFrame = (shown: number, dt: number, forceDiscrete = false) => {
    const domRoot = getDomRoot();
    applyPalette(shown, domRoot);
    applyCues(shown, domRoot);
    syncRe(shown, domRoot);
    syncDiscrete(forceEmitFlag(forceDiscrete));
    frameSubs.forEach((fn) => fn(shown, dt));
  };

  function forceEmitFlag(v: boolean): boolean {
    return v;
  }

  const setViewportCache = () => {
    if (typeof document === "undefined" || typeof window === "undefined") return;
    const innerH = getViewportHeight();
    const scrollH = document.documentElement.scrollHeight;
    maxScroll = Math.max(0, scrollH - innerH);
  };

  const readScrollTarget = () => {
    if (state.paused) return;
    if (maxScroll <= 0) {
      state.target = 0;
      return;
    }
    state.target = clamp01(window.scrollY / maxScroll);
  };

  const handleResize = () => {
    const preservedTarget = state.target;
    setViewportCache();
    if (maxScroll > 0) {
      safeScrollToTop(preservedTarget * maxScroll);
    }
    renderFrame(state.shown, 0);
  };

  const tick = (rawDt: number) => {
    if (!mounted || state.paused || tabHidden) return;
    if (!Number.isFinite(rawDt) || rawDt <= 0) return;

    let dt = rawDt;
    if (justResumedFromHidden) {
      justResumedFromHidden = false;
      dt = Math.min(rawDt, 1 / 60);
    }

    const diff = state.target - state.shown;
    const eased = diff * (1 - Math.exp(-chase * dt));
    const cap = maxRate * dt;
    const step = Math.max(-cap, Math.min(cap, eased));
    let next = clamp01(state.shown + step);
    if (Math.abs(state.target - next) < 1e-5) next = state.target;

    state.shown = next;
    renderFrame(next, dt);
  };

  const reset = () => {
    state.target = 0;
    state.shown = 0;
    safeScrollToTop(0);
    renderFrame(0, 0, true);
  };

  const unmount = () => {
    stopInput?.();
    stopInput = null;
    stopTick?.();
    stopTick = null;

    if (createdScroller) {
      createdScroller.remove();
      createdScroller = null;
    }

    if (prevScrollRestoration !== null && typeof history !== "undefined" && "scrollRestoration" in history) {
      history.scrollRestoration = prevScrollRestoration;
      prevScrollRestoration = null;
    }

    mounted = false;
    tabHidden = false;
    justResumedFromHidden = false;
  };

  const mount = (root: HTMLElement) => {
    if (mounted) unmount();

    mounted = true;
    tabHidden = typeof document !== "undefined" ? document.hidden : false;
    justResumedFromHidden = false;
    state.target = 0;
    state.shown = 0;
    state.paused = false;

    if (typeof history !== "undefined" && "scrollRestoration" in history) {
      prevScrollRestoration = history.scrollRestoration;
      history.scrollRestoration = "manual";
    }

    root.style.setProperty("--total-vh", String(TOTAL_VH));
    const existingScroller = root.querySelector<HTMLElement>("[data-scroller]");
    if (existingScroller) {
      existingScroller.style.height = `calc((var(--total-vh) + 100) * 1dvh)`;
    } else {
      const scroller = document.createElement("div");
      scroller.setAttribute("data-story-scroller", "");
      scroller.setAttribute("aria-hidden", "true");
      scroller.style.height = `calc((var(--total-vh) + 100) * 1dvh)`;
      scroller.style.width = "100%";
      scroller.style.pointerEvents = "none";
      root.appendChild(scroller);
      createdScroller = scroller;
    }

    safeScrollToTop(0);
    setViewportCache();

    stopInput = attachStoryInput({
      onScroll: readScrollTarget,
      onScrollBy(deltaPx) {
        if (state.paused || typeof window === "undefined" || typeof window.scrollBy !== "function") return;
        window.scrollBy({ top: deltaPx, behavior: "auto" });
      },
      onResize: handleResize,
      onVisibilityChange(hidden) {
        if (hidden) {
          tabHidden = true;
        } else {
          if (tabHidden) justResumedFromHidden = true;
          tabHidden = false;
        }
      },
      onPageShow(persisted) {
        if (persisted) reset();
      },
      isPaused: () => state.paused,
      getViewportHeight,
    });

    stopTick = scheduler.add(tick);
    renderFrame(0, 0, true);
  };

  const pause = () => {
    if (state.paused) return;
    state.paused = true;
    syncDiscrete(false);
  };

  const resume = () => {
    if (!state.paused) return;
    state.paused = false;
    syncDiscrete(false);
  };

  const onFrame = (fn: (shown: number, dt: number) => void) => {
    frameSubs.add(fn);
    return () => {
      frameSubs.delete(fn);
    };
  };

  const onChapter = (fn: (chapter: number, view: StoryState["view"]) => void) => {
    chapterSubs.add(fn);
    return () => {
      chapterSubs.delete(fn);
    };
  };

  return {
    state,
    mount,
    unmount,
    pause,
    resume,
    reset,
    onFrame,
    onChapter,
    setViewportCache,
  };
}

export const storyEngine = createStoryEngine();
