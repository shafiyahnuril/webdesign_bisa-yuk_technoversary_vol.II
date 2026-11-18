import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { COPY } from "@/content/copy";
import type { StoryEngine, StoryState } from "@/engine/story-engine";
import { AudioToggle } from "./AudioToggle";

function installFakeAudioContext(options: { rejectResume?: boolean } = {}) {
  const createdContexts: FakeAudioContext[] = [];
  const fakeParam = {
    value: 0,
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    setTargetAtTime: vi.fn(),
    cancelScheduledValues: vi.fn(),
  };
  const fakeNode = () => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
    gain: { ...fakeParam },
    frequency: { ...fakeParam },
    Q: { ...fakeParam },
    threshold: { ...fakeParam },
    ratio: { ...fakeParam },
    attack: { ...fakeParam },
    release: { ...fakeParam },
    detune: { ...fakeParam },
    type: "sine",
    start: vi.fn(),
    stop: vi.fn(),
    loop: false,
    buffer: null,
  });
  class FakeAudioContext {
    state = "running";
    currentTime = 0;
    sampleRate = 44100;
    destination = {};
    resume = vi.fn(async () => {
      if (options.rejectResume) {
        throw new Error("NotAllowedError");
      }
      this.state = "running";
    });
    suspend = vi.fn(async () => {
      this.state = "suspended";
    });
    close = vi.fn(async () => {
      this.state = "closed";
    });
    createBuffer = vi.fn(() => ({ getChannelData: () => new Float32Array(128) }));
    createGain = vi.fn(fakeNode);
    createBiquadFilter = vi.fn(fakeNode);
    createDynamicsCompressor = vi.fn(fakeNode);
    createOscillator = vi.fn(fakeNode);
    createBufferSource = vi.fn(fakeNode);
    constructor() {
      createdContexts.push(this);
    }
  }
  vi.stubGlobal("AudioContext", FakeAudioContext);
  return createdContexts;
}

function makeFakeStoryEngine(initialPaused = false): {
  engine: StoryEngine;
  emitFrame(shown: number, dt: number): void;
  setPaused(paused: boolean): void;
} {
  const frameListeners = new Set<(shown: number, dt: number) => void>();
  const state: StoryState = {
    target: 0,
    shown: 0,
    paused: initialPaused,
    chapter: 1,
    view: "1",
  };
  const engine: StoryEngine = {
    state,
    mount: vi.fn(),
    unmount: vi.fn(),
    pause: vi.fn(() => {
      state.paused = true;
    }),
    resume: vi.fn(() => {
      state.paused = false;
    }),
    reset: vi.fn(),
    onFrame(fn) {
      frameListeners.add(fn);
      return () => frameListeners.delete(fn);
    },
    onChapter: vi.fn(() => () => {}),
    setViewportCache: vi.fn(),
  };
  return {
    engine,
    emitFrame(shown, dt) {
      state.shown = shown;
      frameListeners.forEach((fn) => fn(shown, dt));
    },
    setPaused(paused) {
      state.paused = paused;
    },
  };
}

function RouteControls() {
  const navigate = useNavigate();
  return (
    <div>
      <button type="button" onClick={() => navigate("/")}>
        ke-home
      </button>
      <button type="button" onClick={() => navigate("/about")}>
        ke-about
      </button>
    </div>
  );
}

describe("AudioToggle", () => {
  beforeEach(() => {
    installFakeAudioContext();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("tampil dalam keadaan mati secara default, toggle saat diklik, dan membersihkan subscription saat unmount", async () => {
    const fake = makeFakeStoryEngine();
    const { unmount } = render(
      <MemoryRouter initialEntries={["/"]}>
        <AudioToggle engine={fake.engine} />
      </MemoryRouter>,
    );

    const btn = screen.getByRole("button", { name: COPY["audio.on"] });
    expect(btn.getAttribute("aria-pressed")).toBe("false");

    fireEvent.click(btn);

    await waitFor(() => {
      expect(btn.getAttribute("aria-pressed")).toBe("true");
      expect(btn.getAttribute("aria-label")).toBe(COPY["audio.off"]);
    });

    // Frame engine meneruskan shown & paused
    fake.setPaused(true);
    fake.emitFrame(0.25, 0.12);

    fireEvent.click(btn);
    await waitFor(() => {
      expect(btn.getAttribute("aria-pressed")).toBe("false");
      expect(btn.getAttribute("aria-label")).toBe(COPY["audio.on"]);
    });

    unmount();
  });

  it("senyap saat pindah rute non-Home, tidak autoplay jika belum diaktifkan, dan lanjut saat kembali ke Home bila sebelumnya aktif", async () => {
    const contexts = installFakeAudioContext();
    const fake = makeFakeStoryEngine();
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AudioToggle engine={fake.engine} />
        <RouteControls />
        <Routes>
          <Route path="/" element={<div>Home</div>} />
          <Route path="/about" element={<div>About</div>} />
        </Routes>
      </MemoryRouter>,
    );

    // Pindah rute sebelum user klik -> tidak membuat AudioContext
    fireEvent.click(screen.getByText("ke-about"));
    fireEvent.click(screen.getByText("ke-home"));
    expect(contexts).toHaveLength(0);

    // Aktifkan di Home -> pindah ke About (tetap hidup, tidak close, preferensi terjaga) -> kembali ke Home
    const toggle = screen.getByRole("button", { name: COPY["audio.on"] });
    fireEvent.click(toggle);
    await waitFor(() => {
      expect(toggle.getAttribute("aria-pressed")).toBe("true");
    });
    expect(contexts).toHaveLength(1);

    fireEvent.click(screen.getByText("ke-about"));
    expect(contexts[0]!.close).not.toHaveBeenCalled();
    expect(toggle.getAttribute("aria-pressed")).toBe("true");

    // Kembali ke Home tetap memakai konteks yang sama dan tidak membuat instance baru
    fireEvent.click(screen.getByText("ke-home"));
    expect(contexts).toHaveLength(1);
  });

  it("mengembalikan tombol ke mati secara aman bila AudioContext.resume ditolak", async () => {
    installFakeAudioContext({ rejectResume: true });
    const fake = makeFakeStoryEngine();
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AudioToggle engine={fake.engine} />
      </MemoryRouter>,
    );

    const btn = screen.getByRole("button", { name: COPY["audio.on"] });
    fireEvent.click(btn);

    await waitFor(() => {
      expect(btn.getAttribute("aria-pressed")).toBe("false");
      expect(btn.getAttribute("aria-label")).toBe(COPY["audio.on"]);
    });
  });

  it("tidak merender tombol bila browser tidak mendukung AudioContext", () => {
    vi.stubGlobal("AudioContext", undefined);
    const fake = makeFakeStoryEngine();
    const { container } = render(
      <MemoryRouter initialEntries={["/"]}>
        <AudioToggle engine={fake.engine} />
      </MemoryRouter>,
    );
    expect(container.firstChild).toBeNull();
  });
});
