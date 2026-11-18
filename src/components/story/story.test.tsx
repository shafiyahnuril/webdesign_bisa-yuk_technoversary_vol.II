import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createStoryEngine } from "@/engine/story-engine";
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
  readonly thresholds: ReadonlyArray<number> = [0, 0.6, 0.85];
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

function triggerIntersection(panelIndex: number, ratio: number) {
  for (const obs of observers) {
    for (const el of obs.observed) {
      if ((el as HTMLElement).dataset.panelIndex === String(panelIndex)) {
        const entry = {
          target: el,
          isIntersecting: ratio > 0,
          intersectionRatio: ratio,
          boundingClientRect: el.getBoundingClientRect(),
          intersectionRect: el.getBoundingClientRect(),
          rootBounds: null,
          time: performance.now(),
        } as IntersectionObserverEntry;
        obs.callback([entry], {} as IntersectionObserver);
      }
    }
  }
}

describe("StoryStage & StaticStory", () => {
  const originalIO = globalThis.IntersectionObserver;

  beforeEach(() => {
    observers.length = 0;
    globalThis.IntersectionObserver =
      MockIntersectionObserver as unknown as typeof IntersectionObserver;
    resetStoryWebGLFailure();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    globalThis.IntersectionObserver = originalIO;
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

  it("membuka StaticStory secara berurutan setelah panel aktif terlihat >=60% selama 1,2 detik dan mereset saat Mulai dari awal", () => {
    const { container } = render(<StaticStory unlockDelayMs={1200} />);

    // Awal: hanya panel 1 & 2 yang terbuka
    expect(container.querySelectorAll("[data-static-panel]").length).toBe(2);
    expect(container.textContent).not.toContain("TODO");
    expect(container.textContent).not.toContain("{X}");
    expect(container.textContent).not.toContain("Sekian persen");
    expect(container.textContent).not.toContain("450");

    // Panel 2 terlihat < 60% (0.4): tidak membuka panel 3
    act(() => {
      triggerIntersection(2, 0.4);
      vi.advanceTimersByTime(1500);
    });
    expect(container.querySelectorAll("[data-static-panel]").length).toBe(2);

    // Panel 2 terlihat >= 60% (0.75) selama 1200ms -> membuka panel 3
    act(() => {
      triggerIntersection(2, 0.75);
      vi.advanceTimersByTime(1200);
    });
    expect(container.querySelectorAll("[data-static-panel]").length).toBe(3);

    // Buka bertahap sampai panel 11
    for (let idx = 3; idx <= 10; idx += 1) {
      act(() => {
        triggerIntersection(idx, 0.8);
        vi.advanceTimersByTime(1200);
      });
    }
    expect(container.querySelectorAll("[data-static-panel]").length).toBe(11);

    // Tombol Mulai dari awal mengunci kembali ke 2 panel dan memindahkan fokus ke judul panel 1
    const restartBtn = screen.getByRole("button", { name: /Mulai dari awal/i });
    act(() => {
      fireEvent.click(restartBtn);
    });
    expect(container.querySelectorAll("[data-static-panel]").length).toBe(2);
    expect(document.activeElement?.id).toBe("static-panel-title-b1");
  });

  it("mengalihkan HomePage ke StaticStory ketika StageCanvas melaporkan kegagalan WebGL", () => {
    const engine = createStoryEngine();
    const { container } = render(<HomePage engine={engine} />);

    act(() => {
      reportStoryWebGLFailure(new Error("Simulated WebGL context loss"));
    });

    expect(
      container.querySelector('[data-home-page]')?.getAttribute("data-story-mode"),
    ).toBe("static");
    expect(container.querySelector("[data-static-story]")).not.toBeNull();
  });
});
