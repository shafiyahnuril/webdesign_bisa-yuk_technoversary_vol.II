import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createStoryEngine } from "@/engine/story-engine";
import { StageCanvas } from "./StageCanvas";

const backend = vi.hoisted(() => ({
  render: vi.fn(),
  dispose: vi.fn(),
  update: vi.fn(),
  disposeDirector: vi.fn(),
  create: vi.fn(),
  fail: false,
  lost: undefined as undefined | (() => void),
  flashActive: false,
  setRect: vi.fn(),
  renderFlash: vi.fn(),
}));

vi.mock("@/stage/stage", () => ({
  createStage: (...args: unknown[]) => {
    backend.create(...args);
    if (backend.fail) throw new Error("WebGL tidak tersedia");
    const options = args[2] as { onContextLost?: () => void };
    backend.lost = options.onContextLost;
    return {
      ctx: {
        quality: "low",
        lights: { rim: { intensity: 1 } },
        scene: { environmentIntensity: 1 },
        shared: {
          get: (key: string) =>
            key === "flash"
              ? {
                  isActive: () => backend.flashActive,
                  setRect: backend.setRect,
                  renderPass: backend.renderFlash,
                }
              : undefined,
        },
        size: { w: 1000, h: 800 },
        renderer: {
          info: {
            autoReset: true,
            reset: vi.fn(),
            render: { calls: 1, triangles: 12 },
            memory: { geometries: 1, textures: 1 },
          },
        },
      },
      render: backend.render,
      dispose: backend.dispose,
    };
  },
}));
vi.mock("@/stage/director", () => ({
  SceneDirector: class {
    update = backend.update;
    dispose = backend.disposeDirector;
  },
}));
vi.mock("@/stage/scenes", () => ({ createScenes: () => [] }));

beforeEach(() => {
  vi.clearAllMocks();
  backend.fail = false;
  backend.lost = undefined;
  backend.flashActive = false;
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    callback(performance.now());
    return 1;
  });
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
});

it("menggambar kilas sesudah panggung utama dengan rect yang disimpan", async () => {
  backend.flashActive = true;
  const el = document.createElement("div");
  el.dataset.flashWindow = "";
  document.body.append(el);
  const rect = vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
    x: 40,
    y: 20,
    top: 20,
    left: 40,
    width: 320,
    height: 200,
    right: 360,
    bottom: 220,
    toJSON() {},
  });
  const engine = createStoryEngine();
  const ready = vi.fn();
  const view = render(<StageCanvas engine={engine} onReady={ready} />);
  await waitFor(() => expect(ready).toHaveBeenCalledOnce());
  expect(backend.setRect).toHaveBeenCalledWith({ x: 40, y: 20, width: 320, height: 200 });
  expect(backend.renderFlash).toHaveBeenCalled();
  expect(backend.render.mock.invocationCallOrder[0]).toBeLessThan(
    backend.renderFlash.mock.invocationCallOrder[0]!,
  );
  engine.reset();
  expect(rect).toHaveBeenCalledOnce();
  view.unmount();
  el.remove();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("StageCanvas", () => {
  it("memberi sinyal siap sesudah render dan melepas renderer serta pelanggan", async () => {
    const engine = createStoryEngine();
    const ready = vi.fn();
    const view = render(<StageCanvas engine={engine} onReady={ready} />);
    await waitFor(() => expect(ready).toHaveBeenCalledOnce());
    expect(backend.render).toHaveBeenCalled();
    expect(backend.update).toHaveBeenCalledWith(0, 0);
    engine.reset();
    expect(backend.render).toHaveBeenCalled();
    view.unmount();
    expect(backend.dispose).toHaveBeenCalledOnce();
    expect(backend.disposeDirector).toHaveBeenCalledOnce();
    const frames = backend.render.mock.calls.length;
    engine.reset();
    expect(backend.render).toHaveBeenCalledTimes(frames);
  });

  it("mengirim kegagalan WebGL agar Home dapat berpindah ke panel statis", async () => {
    backend.fail = true;
    const failure = vi.fn();
    const ready = vi.fn();
    render(<StageCanvas onFailure={failure} onReady={ready} />);
    await waitFor(() => expect(failure).toHaveBeenCalledOnce());
    expect(failure.mock.calls[0]?.[0]).toBeInstanceOf(Error);
    expect(ready).not.toHaveBeenCalled();
  });

  it("menangani context loss sekali dan berhenti menggambar setelah kegagalan", async () => {
    const engine = createStoryEngine();
    const failure = vi.fn();
    const ready = vi.fn();
    render(<StageCanvas engine={engine} onFailure={failure} onReady={ready} />);
    await waitFor(() => expect(ready).toHaveBeenCalledOnce());
    backend.lost?.();
    backend.lost?.();
    expect(failure).toHaveBeenCalledOnce();
    const frames = backend.render.mock.calls.length;
    engine.reset();
    expect(backend.render).toHaveBeenCalledTimes(frames);
  });
});
