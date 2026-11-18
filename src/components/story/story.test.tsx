import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createStoryEngine } from "@/engine/story-engine";
import { PALETTE } from "@/lib/tokens";
import {
  reportStoryWebGLFailure,
  resetStoryWebGLFailure,
} from "@/hooks/useStoryMode";
import HomePage from "@/routes/HomePage";
import { StaticStory } from "./StaticStory";
import { StoryStage } from "./StoryStage";

interface MockObserverRecord {
  callback: IntersectionObserverCallback;
  observed: Set<Element>;
}

const observers: MockObserverRecord[] = [];

class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = "0px";
  readonly scrollMargin: string = "0px";
  readonly thresholds: ReadonlyArray<number> = [0, 0.25, 0.4, 0.6, 0.85];
  private record: MockObserverRecord;

  constructor(callback: IntersectionObserverCallback) {
    this.record = { callback, observed: new Set() };
    observers.push(this.record);
  }

  observe(target: Element): void {
    this.record.observed.add(target);
  }

  unobserve(target: Element): void {
    this.record.observed.delete(target);
  }

  disconnect(): void {
    this.record.observed.clear();
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

function triggerIntersection(
  panelIndex: number,
  ratio: number,
  opts?: { targetHeight?: number; intersectHeight?: number; rootHeight?: number },
) {
  for (const obs of observers) {
    for (const el of obs.observed) {
      if ((el as HTMLElement).dataset.panelIndex === String(panelIndex)) {
        const targetHeight = opts?.targetHeight ?? 800;
        const rootHeight = opts?.rootHeight ?? 900;
        const intersectHeight = opts?.intersectHeight ?? targetHeight * ratio;
        const entry = {
          target: el,
          isIntersecting: ratio > 0 || intersectHeight > 0,
          intersectionRatio: ratio,
          boundingClientRect: {
            width: 800,
            height: targetHeight,
            top: 0,
            left: 0,
            bottom: targetHeight,
            right: 800,
            x: 0,
            y: 0,
            toJSON: () => ({}),
          },
          intersectionRect: {
            width: 800,
            height: intersectHeight,
            top: 0,
            left: 0,
            bottom: intersectHeight,
            right: 800,
            x: 0,
            y: 0,
            toJSON: () => ({}),
          },
          rootBounds: {
            width: 1280,
            height: rootHeight,
            top: 0,
            left: 0,
            bottom: rootHeight,
            right: 1280,
            x: 0,
            y: 0,
            toJSON: () => ({}),
          },
          time: performance.now(),
        } as IntersectionObserverEntry;
        obs.callback([entry], {} as IntersectionObserver);
      }
    }
  }
}

describe("StoryStage & StaticStory", () => {
  const originalIO = globalThis.IntersectionObserver;
  const originalGetContext = HTMLCanvasElement.prototype.getContext;
  const originalScrollTo = window.scrollTo;

  beforeEach(() => {
    observers.length = 0;
    globalThis.IntersectionObserver =
      MockIntersectionObserver as unknown as typeof IntersectionObserver;
    window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
    // Mock kapabilitas WebGL eksplisit di unit test tanpa cabang userAgent jsdom di produksi
    Object.defineProperty(window, "WebGLRenderingContext", {
      value: function MockWebGLRenderingContext() {},
      configurable: true,
      writable: true,
    });
    HTMLCanvasElement.prototype.getContext = vi.fn((contextId: string) => {
      if (
        contextId === "webgl2" ||
        contextId === "webgl" ||
        contextId === "experimental-webgl"
      ) {
        return {} as WebGLRenderingContext;
      }
      return null;
    }) as unknown as typeof HTMLCanvasElement.prototype.getContext;

    resetStoryWebGLFailure();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    globalThis.IntersectionObserver = originalIO;
    HTMLCanvasElement.prototype.getContext = originalGetContext;
    window.scrollTo = originalScrollTo;
    resetStoryWebGLFailure();
  });

  it("merender StoryStage tanpa menampilkan teks TODO, {X}, Sekian persen, atau angka 450 yang belum terverifikasi", () => {
    const engine = createStoryEngine();
    const { container, unmount } = render(<StoryStage engine={engine} />);

    // Kontrak DOM untuk integrasi koordinator
    expect(container.querySelector("[data-story-poster]")).not.toBeNull();
    expect(container.querySelector("[data-flash-window]")).not.toBeNull();
    expect(container.querySelectorAll("[data-station-index]").length).toBe(4);
    expect(container.querySelector("[data-scenario-label]")).not.toBeNull();

    const text = container.textContent ?? "";
    expect(text).not.toContain("TODO");
    expect(text).not.toContain("{X}");
    expect(text).not.toContain("Sekian persen");
    expect(text).not.toContain("450");

    unmount();
  });

  it("membuka StaticStory secara berurutan (>=60% selama 1,2 detik tanpa tombol bypass), menyinkronkan palet/data-re, dan mereset saat Mulai dari awal", () => {
    const { container } = render(<StaticStory unlockDelayMs={1200} />);

    // Awal: hanya panel 1 & 2 yang terbuka, tidak ada tombol bypass data-static-unlock-next
    expect(container.querySelectorAll("[data-static-panel]").length).toBe(2);
    expect(container.querySelector("[data-static-unlock-next]")).toBeNull();
    expect(document.documentElement.dataset.re).toBe("off");
    expect(document.documentElement.style.getPropertyValue("--bg-a")).toBe(PALETTE.c1.bg);

    expect(container.textContent).not.toContain("TODO");
    expect(container.textContent).not.toContain("{X}");
    expect(container.textContent).not.toContain("Sekian persen");
    expect(container.textContent).not.toContain("450");
    expect(container.textContent).not.toContain("1,2 detik");

    // Panel 2 terlihat < 60% (0.4): tidak membuka panel 3
    act(() => {
      triggerIntersection(2, 0.4);
      vi.advanceTimersByTime(1500);
    });
    expect(container.querySelectorAll("[data-static-panel]").length).toBe(2);

    // Panel 2 pada landscape tinggi (panel 1000px > viewport 500px, terlihat 350px = 70% dari viewport walau ratio IO 0.35)
    act(() => {
      triggerIntersection(2, 0.35, {
        targetHeight: 1000,
        rootHeight: 500,
        intersectHeight: 350,
      });
      vi.advanceTimersByTime(1200);
    });
    expect(container.querySelectorAll("[data-static-panel]").length).toBe(3);
    expect(document.documentElement.style.getPropertyValue("--bg-a")).toBe(PALETTE.c2.bg);

    // Buka bertahap sampai panel 11 dan pastikan Babak II menyalakan data-re="on" serta palet c7..c10
    for (let idx = 3; idx <= 10; idx += 1) {
      act(() => {
        triggerIntersection(idx, 0.8);
        vi.advanceTimersByTime(1200);
      });
    }
    expect(container.querySelectorAll("[data-static-panel]").length).toBe(11);

    act(() => {
      triggerIntersection(11, 0.85);
    });
    expect(document.documentElement.dataset.re).toBe("on");
    expect(document.documentElement.style.getPropertyValue("--bg-a")).toBe(PALETTE.c10.bg);

    // Setiap panel memiliki atribut data-palette sesuai c1..c10 dan cp0
    const palettes = [...container.querySelectorAll<HTMLElement>("[data-static-panel]")].map(
      (el) => el.dataset.palette,
    );
    expect(palettes).toEqual([
      "c1",
      "c2",
      "c3",
      "c4",
      "c5",
      "c6",
      "cp0",
      "c7",
      "c8",
      "c9",
      "c10",
    ]);

    // Tombol Mulai dari awal mengunci kembali ke 2 panel, mereset palet c1 & data-re="off", dan memindahkan fokus ke judul panel 1
    const restartBtn = screen.getByRole("button", { name: /Mulai dari awal/i });
    act(() => {
      fireEvent.click(restartBtn);
    });
    expect(container.querySelectorAll("[data-static-panel]").length).toBe(2);
    expect(document.documentElement.dataset.re).toBe("off");
    expect(document.documentElement.style.getPropertyValue("--bg-a")).toBe(PALETTE.c1.bg);
    expect(document.activeElement?.id).toBe("static-panel-title-b1");
  });

  it("mengalihkan HomePage ke StaticStory ketika StageCanvas melaporkan kegagalan WebGL", () => {
    const engine = createStoryEngine();
    const { container } = render(
      <HomePage
        engine={engine}
        renderStageCanvas={() => <div data-testid="mock-stage-canvas" />}
      />,
    );

    expect(
      container.querySelector("[data-home-page]")?.getAttribute("data-story-mode"),
    ).toBe("3d");

    act(() => {
      reportStoryWebGLFailure(new Error("Simulated WebGL context loss"));
    });

    expect(
      container.querySelector("[data-home-page]")?.getAttribute("data-story-mode"),
    ).toBe("static");
    expect(container.querySelector("[data-static-story]")).not.toBeNull();
  });
});
