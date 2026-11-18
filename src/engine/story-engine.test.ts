import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ENGINE } from "@/lib/tokens";
import { INITIAL_STORY_SIGNALS, storySignals } from "./signal";
import { createStoryEngine, storyEngine, type StoryScheduler } from "./story-engine";
import { PUNCH, STARTS, TOTAL_VH } from "./timeline";

function createManualScheduler() {
  const fns = new Set<(dt: number) => void>();
  const scheduler: StoryScheduler = {
    add(fn) {
      fns.add(fn);
      return () => {
        fns.delete(fn);
      };
    },
  };
  const step = (dt: number, count = 1) => {
    for (let i = 0; i < count; i++) {
      fns.forEach((fn) => fn(dt));
    }
  };
  return { scheduler, step, size: () => fns.size };
}

const activeCleanups: Array<() => void> = [];

function mockScrollEnv(scrollHeight = 23400, innerHeight = 1000) {
  let scrollY = 0;
  let restoration: History["scrollRestoration"] = "auto";
  Object.defineProperty(history, "scrollRestoration", {
    get: () => restoration,
    set: (v: History["scrollRestoration"]) => {
      restoration = v;
    },
    configurable: true,
  });
  Object.defineProperty(window, "innerHeight", {
    value: innerHeight,
    configurable: true,
    writable: true,
  });
  Object.defineProperty(document.documentElement, "scrollHeight", {
    value: scrollHeight,
    configurable: true,
    writable: true,
  });
  Object.defineProperty(window, "scrollY", {
    get: () => scrollY,
    configurable: true,
  });
  const maxScroll = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

  const scrollTo = vi.fn((arg1: number | ScrollToOptions, arg2?: number) => {
    const top = typeof arg1 === "number" ? (arg2 ?? 0) : (arg1.top ?? 0);
    scrollY = Math.max(0, Math.min(maxScroll(), top));
  });
  const scrollBy = vi.fn((arg1: number | ScrollToOptions, arg2?: number) => {
    const delta = typeof arg1 === "number" ? (arg2 ?? 0) : (arg1.top ?? 0);
    scrollY = Math.max(0, Math.min(maxScroll(), scrollY + delta));
    window.dispatchEvent(new Event("scroll"));
  });

  vi.stubGlobal("scrollTo", scrollTo);
  vi.stubGlobal("scrollBy", scrollBy);

  const setScrollY = (y: number) => {
    scrollY = Math.max(0, Math.min(maxScroll(), y));
    window.dispatchEvent(new Event("scroll"));
  };

  return { setScrollY, scrollTo, scrollBy, getScrollY: () => scrollY };
}

describe("story-engine & input", () => {
  beforeEach(() => {
    storySignals.set(INITIAL_STORY_SIGNALS);
    document.documentElement.removeAttribute("data-re");
  });

  afterEach(() => {
    while (activeCleanups.length > 0) {
      activeCleanups.pop()?.();
    }
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("mengekspor createStoryEngine dan singleton storyEngine", () => {
    expect(typeof createStoryEngine).toBe("function");
    expect(storyEngine).toBeDefined();
    expect(typeof storyEngine.mount).toBe("function");
    expect(typeof storyEngine.setViewportCache).toBe("function");
  });

  it("pratinjau DEV menyamakan target, shown, palet, dan pelanggan untuk capture deterministik", () => {
    mockScrollEnv();
    const { scheduler } = createManualScheduler();
    const root = document.createElement("div");
    const domRoot = document.createElement("div");
    const engine = createStoryEngine({ scheduler, domRoot });
    engine.mount(root);
    activeCleanups.push(() => engine.unmount());
    const frame = vi.fn();
    engine.onFrame(frame);
    engine.preview?.(STARTS.b7);
    expect(engine.state.shown).toBe(STARTS.b7);
    expect(engine.state.target).toBe(STARTS.b7);
    expect(engine.state.view).toBe("2");
    expect(domRoot.dataset.re).toBe("on");
    expect(frame).toHaveBeenLastCalledWith(STARTS.b7, 0);
    engine.unmount();
  });

  it("mount menyiapkan tinggi scroller dvh, history manual, dan init render 0", () => {
    mockScrollEnv(23400, 1000);
    const { scheduler } = createManualScheduler();
    const domRoot = document.createElement("div");
    const root = document.createElement("div");
    document.body.appendChild(root);

    const engine = createStoryEngine({ scheduler, domRoot });
    const frameSpy = vi.fn();
    engine.onFrame(frameSpy);
    engine.mount(root);
    activeCleanups.push(() => {
      engine.unmount();
      root.remove();
    });

    expect(history.scrollRestoration).toBe("manual");
    expect(root.style.getPropertyValue("--total-vh")).toBe(String(TOTAL_VH));
    const scroller = root.querySelector<HTMLElement>("[data-story-scroller]");
    expect(scroller).not.toBeNull();
    expect(scroller?.style.height).toContain("1dvh");
    expect(frameSpy).toHaveBeenCalledWith(0, 0);
    expect(domRoot.dataset.re).toBe("off");
    expect(domRoot.style.getPropertyValue("--bg-a")).not.toBe("");

    engine.unmount();
    expect(root.querySelector("[data-story-scroller]")).toBeNull();
    root.remove();
  });

  it("menahan target sampai visual siap tanpa melepaskan jeda menu", () => {
    const env = mockScrollEnv();
    const { scheduler, step } = createManualScheduler();
    const engine = createStoryEngine({ scheduler });
    engine.mount(document.createElement("div"));
    activeCleanups.push(() => engine.unmount());
    engine.setReady?.(false);
    env.setScrollY(22400);
    expect(engine.state.target).toBe(0.02);
    step(1, 10);
    expect(engine.state.shown).toBeLessThanOrEqual(0.02);
    engine.pause();
    engine.setReady?.(true);
    expect(engine.state.paused).toBe(true);
    engine.resume();
    expect(engine.state.target).toBe(1);
  });

  it("mengurutkan DOM, renderer, lalu audio tanpa bergantung urutan pemasangan komponen", () => {
    const engine = createStoryEngine();
    const calls: string[] = [];
    engine.onFrame(() => calls.push("audio"), 20);
    engine.onFrame(() => calls.push("renderer"), 10);
    engine.onFrame(() => calls.push("dom"));
    engine.reset();
    expect(calls).toEqual(["dom", "renderer", "audio"]);
  });

  it("memasang listener wheel/touch/scroll dengan passive: true", () => {
    mockScrollEnv(23400, 1000);
    const addSpy = vi.spyOn(window, "addEventListener");
    const { scheduler } = createManualScheduler();
    const root = document.createElement("div");
    const engine = createStoryEngine({ scheduler });

    engine.mount(root);

    for (const type of ["scroll", "wheel", "touchstart", "touchmove"]) {
      const call = addSpy.mock.calls.find(([evt]) => evt === type);
      expect(call).toBeDefined();
      expect(call?.[2]).toEqual({ passive: true });
    }

    engine.unmount();
  });

  it("ratchet membatasi laju <= MAX_RATE dua arah secara identik pada 60/120/144 Hz", () => {
    const maxRate = ENGINE.MAX_SPEED_VH / TOTAL_VH;

    const runRates = (hz: number) => {
      const env = mockScrollEnv(23400, 1000);
      const { scheduler, step } = createManualScheduler();
      const root = document.createElement("div");
      const engine = createStoryEngine({ scheduler, domRoot: document.createElement("div") });
      engine.mount(root);

      // Gulir instan ke akhir (target = 1)
      env.setScrollY(22400);
      expect(engine.state.target).toBe(1);

      const dt = 1 / hz;
      let prev = 0;
      for (let i = 0; i < hz; i++) {
        step(dt);
        const delta = engine.state.shown - prev;
        expect(delta).toBeLessThanOrEqual(maxRate * dt + 1e-9);
        expect(delta).toBeGreaterThanOrEqual(0);
        prev = engine.state.shown;
      }
      const after1sForward = engine.state.shown;
      expect(after1sForward).toBeLessThanOrEqual(maxRate + 1e-6);

      // Gulir balik ke awal dari posisi target 0
      env.setScrollY(0);
      prev = engine.state.shown;
      for (let i = 0; i < hz / 2; i++) {
        step(dt);
        const delta = prev - engine.state.shown;
        expect(delta).toBeLessThanOrEqual(maxRate * dt + 1e-9);
        prev = engine.state.shown;
      }

      engine.unmount();
      return after1sForward;
    };

    const f60 = runRates(60);
    const f120 = runRates(120);
    const f144 = runRates(144);
    expect(Math.abs(f60 - f120)).toBeLessThan(0.002);
    expect(Math.abs(f60 - f144)).toBeLessThan(0.002);
  });

  it("mencegat Home/End/Ctrl+Home/Ctrl+End, PageDown/Space menggulir 1 layar, dan mengabaikan target editable", () => {
    const env = mockScrollEnv(23400, 1000);
    const { scheduler } = createManualScheduler();
    const root = document.createElement("div");
    const engine = createStoryEngine({ scheduler, domRoot: document.createElement("div") });
    engine.mount(root);

    for (const opts of [
      { key: "Home" },
      { key: "End" },
      { key: "Home", ctrlKey: true },
      { key: "End", ctrlKey: true },
    ]) {
      const ev = new KeyboardEvent("keydown", { ...opts, cancelable: true });
      window.dispatchEvent(ev);
      expect(ev.defaultPrevented).toBe(true);
      expect(env.getScrollY()).toBe(0);
    }

    const pgDown = new KeyboardEvent("keydown", { key: "PageDown", cancelable: true });
    window.dispatchEvent(pgDown);
    expect(pgDown.defaultPrevented).toBe(true);
    expect(env.scrollBy).toHaveBeenCalledWith({ top: 900, behavior: "auto" });

    const space = new KeyboardEvent("keydown", { key: " ", code: "Space", cancelable: true });
    window.dispatchEvent(space);
    expect(space.defaultPrevented).toBe(true);
    expect(env.getScrollY()).toBe(1800);

    // Tombol Space pada <button> tidak dicegat
    const btn = document.createElement("button");
    document.body.appendChild(btn);
    const btnSpace = new KeyboardEvent("keydown", { key: " ", code: "Space", cancelable: true });
    btn.dispatchEvent(btnSpace);
    expect(btnSpace.defaultPrevented).toBe(false);
    btn.remove();

    // Input/textarea/contentEditable diabaikan
    const input = document.createElement("input");
    const editable = document.createElement("div");
    editable.setAttribute("contenteditable", "true");
    document.body.append(input, editable);

    const inputEnd = new KeyboardEvent("keydown", { key: "End", cancelable: true, bubbles: true });
    input.dispatchEvent(inputEnd);
    expect(inputEnd.defaultPrevented).toBe(false);

    const editableSpace = new KeyboardEvent("keydown", {
      key: " ",
      cancelable: true,
      bubbles: true,
    });
    editable.dispatchEvent(editableSpace);
    expect(editableSpace.defaultPrevented).toBe(false);

    input.remove();
    editable.remove();
    engine.unmount();
  });

  it("pause/resume/reset dan clamping target/shown [0, 1]", () => {
    const env = mockScrollEnv(23400, 1000);
    const { scheduler, step } = createManualScheduler();
    const root = document.createElement("div");
    const domRoot = document.createElement("div");
    const engine = createStoryEngine({ scheduler, domRoot });
    engine.mount(root);

    env.setScrollY(50000);
    expect(engine.state.target).toBe(1);

    engine.pause();
    expect(engine.state.paused).toBe(true);
    step(1 / 60, 10);
    expect(engine.state.shown).toBe(0);

    engine.resume();
    expect(engine.state.paused).toBe(false);
    step(1 / 60, 20);
    expect(engine.state.shown).toBeGreaterThan(0);

    engine.reset();
    expect(engine.state.shown).toBe(0);
    expect(engine.state.target).toBe(0);
    expect(env.getScrollY()).toBe(0);
    expect(domRoot.dataset.re).toBe("off");

    engine.unmount();
  });

  it("tab hidden tidak melompat dan resize mempertahankan progress shown", () => {
    const env = mockScrollEnv(23400, 1000);
    const { scheduler, step } = createManualScheduler();
    const root = document.createElement("div");
    const engine = createStoryEngine({ scheduler, domRoot: document.createElement("div") });
    engine.mount(root);

    env.setScrollY(11200); // target = 0.5
    step(1, 5); // maju hingga sekitar 0.15625
    const beforeHide = engine.state.shown;

    // Tab hidden
    Object.defineProperty(document, "hidden", { value: true, configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));
    step(10); // dt 10 detik saat hidden tidak boleh memajukan shown
    expect(engine.state.shown).toBe(beforeHide);

    // Tab kembali visible: frame pertama tidak melompat dengan dt besar
    Object.defineProperty(document, "hidden", { value: false, configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));
    step(5);
    const afterResume = engine.state.shown;
    expect(afterResume - beforeHide).toBeLessThan(0.01);

    // Resize: scrollHeight berubah (mis. viewport berubah dari 1000 ke 500 -> scrollHeight 11700)
    Object.defineProperty(window, "innerHeight", { value: 500, configurable: true });
    Object.defineProperty(document.documentElement, "scrollHeight", {
      value: 11700,
      configurable: true,
    });
    window.dispatchEvent(new Event("resize"));
    expect(engine.state.shown).toBe(afterResume);
    expect(engine.state.target).toBeCloseTo(0.5, 4);

    engine.unmount();
  });

  it("StrictMode mount ulang membersihkan semua listener tanpa kebocoran", () => {
    mockScrollEnv(23400, 1000);
    const { scheduler, size } = createManualScheduler();
    const root = document.createElement("div");
    const engine = createStoryEngine({ scheduler, domRoot: document.createElement("div") });

    engine.mount(root);
    expect(size()).toBe(1);
    engine.unmount();
    expect(size()).toBe(0);

    engine.mount(root);
    expect(size()).toBe(1);
    engine.unmount();
    expect(size()).toBe(0);
  });

  it("storySignals hanya emit saat perubahan diskrit chapter/view/re/paused (0 update per frame)", () => {
    const env = mockScrollEnv(23400, 1000);
    const { scheduler, step } = createManualScheduler();
    const root = document.createElement("div");
    const domRoot = document.createElement("div");
    const engine = createStoryEngine({ scheduler, domRoot });

    const sigSpy = vi.fn();
    const unsubSig = storySignals.subscribe(sigSpy);
    const chapterSpy = vi.fn();
    const unsubCh = engine.onChapter(chapterSpy);

    engine.mount(root);
    sigSpy.mockClear();
    chapterSpy.mockClear();

    // Bergerak hanya di dalam Bab 1 (shown < STARTS.b2) -> 0 signal emit!
    env.setScrollY(Math.floor(22400 * (STARTS.b2 * 0.5)));
    step(1 / 60, 15);
    expect(engine.state.shown).toBeGreaterThan(0);
    expect(engine.state.shown).toBeLessThan(STARTS.b2);
    expect(sigSpy).not.toHaveBeenCalled();
    expect(chapterSpy).not.toHaveBeenCalled();

    // Lewati batas ke Bab 2 -> tepat 1 signal emit dan 1 onChapter
    env.setScrollY(Math.ceil(22400 * (STARTS.b2 + 0.01)));
    step(1, 2);
    expect(engine.state.chapter).toBe(2);
    expect(sigSpy).toHaveBeenCalledTimes(1);
    expect(chapterSpy).toHaveBeenCalledWith(2, "1");

    // Lewati hingga PUNCH.to -> view="2", re=true, chapter=7
    env.setScrollY(Math.ceil(22400 * (PUNCH.to + 0.01)));
    for (let i = 0; i < 30; i++) step(1);
    expect(engine.state.view).toBe("2");
    expect(storySignals.get().re).toBe(true);
    expect(domRoot.dataset.re).toBe("on");

    unsubSig();
    unsubCh();
    engine.unmount();
  });
});
