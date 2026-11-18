import { describe, expect, it, vi } from "vitest";
import { SceneDirector, type Scene } from "./director";
import { STARTS, type SegId } from "@/engine/timeline";
import type { StageContext } from "./stage";

function makeMockCtx(): {
  ctx: StageContext;
  bottleDispose: ReturnType<typeof vi.fn>;
  shadowDispose: ReturnType<typeof vi.fn>;
} {
  const bottleDispose = vi.fn();
  const shadowDispose = vi.fn();
  const ctx = {
    shared: {
      bottle: { dispose: bottleDispose },
      contactShadow: { dispose: shadowDispose },
      slots: new Map(),
      register: vi.fn(),
      get: vi.fn(),
    },
  } as unknown as StageContext;
  return { ctx, bottleDispose, shadowDispose };
}

function makeSpyScene(id: SegId) {
  const calls: string[] = [];
  const lastUpdate = { t: -1, p: -1, dt: -1 };
  const scene: Scene = {
    id,
    build: vi.fn(() => {
      calls.push("build");
    }),
    enter: vi.fn(() => {
      calls.push("enter");
    }),
    update: vi.fn((t: number, p: number, dt: number) => {
      lastUpdate.t = t;
      lastUpdate.p = p;
      lastUpdate.dt = dt;
    }),
    exit: vi.fn(() => {
      calls.push("exit");
    }),
    dispose: vi.fn(() => {
      calls.push("dispose");
    }),
  };
  return { scene, calls, lastUpdate };
}

describe("SceneDirector", () => {
  it("pramuat ±0.06 tanpa membiarkan tetangga menimpa scene saat ini, lalu lepas > 0.12", () => {
    const { ctx } = makeMockCtx();
    const s1 = makeSpyScene("b1");
    const s2 = makeSpyScene("b2");
    const s5 = makeSpyScene("b5");
    const director = new SceneDirector(ctx, [s1.scene, s2.scene, s5.scene]);

    // p = 0: hanya b1 aktif (b2 mulai di 0.0625, jarak 0.0625 > 0.06)
    director.update(0, 0.016);
    expect(s1.calls).toEqual(["build", "enter"]);
    expect(s1.lastUpdate.t).toBeCloseTo(0, 5);
    expect(s2.calls).toEqual([]);
    expect(s5.calls).toEqual([]);

    // p = 0.02: b2 masuk jendela +0.06 (0.0625 - 0.06 = 0.0025)
    director.update(0.02, 0.016);
    expect(s2.calls).toEqual(["build"]);
    expect(s2.scene.update).not.toHaveBeenCalled();
    expect(director.getActiveSceneIds()).toEqual(["b1"]);

    // b2 sedang berlangsung; b1 keluar tetapi belum melewati jarak pelepasan.
    director.update(0.13, 0.016);
    expect(s2.calls).toEqual(["build", "enter"]);
    expect(s1.calls).toEqual(["build", "enter", "exit"]);
    expect(director.getBuiltSceneIds()).toContain("b1");
    expect(director.getActiveSceneIds()).toEqual(["b2"]);

    // p = 0.25: b1 lewat > 0.12 di belakang -> di-dispose
    director.update(0.25, 0.016);
    expect(s1.calls).toEqual(["build", "enter", "exit", "dispose"]);
    expect(director.getBuiltSceneIds()).not.toContain("b1");
  });

  it("membangun ulang scene (rebuild) saat gulir mundur atau loop ke scene yang sudah di-dispose", () => {
    const { ctx } = makeMockCtx();
    const s1 = makeSpyScene("b1");
    const s5 = makeSpyScene("b5");
    const director = new SceneDirector(ctx, [s1.scene, s5.scene]);

    director.update(0, 0.016);
    director.update(STARTS.b5 + 0.01, 0.016);
    expect(s1.calls).toEqual(["build", "enter", "exit", "dispose"]);
    expect(s5.calls).toEqual(["build", "enter"]);

    // Mundur / loop ke p = 0 -> b1 wajib rebuild dan enter kembali
    director.update(0, 0.016);
    expect(s1.calls).toEqual(["build", "enter", "exit", "dispose", "build", "enter"]);
    expect(s5.calls).toEqual(["build", "enter", "exit", "dispose"]);
  });

  it("mendukung preload tanpa enter dan tidak pernah mendispose objek bersama milik stage", () => {
    const { ctx, bottleDispose, shadowDispose } = makeMockCtx();
    const s1 = makeSpyScene("b1");
    const s2 = makeSpyScene("b2");
    const director = new SceneDirector(ctx, [s1.scene, s2.scene]);

    director.preload("b1");
    expect(s1.calls).toEqual(["build"]);
    expect(director.getActiveSceneIds()).toEqual([]);

    director.update(0, 0.016);
    expect(s1.calls).toEqual(["build", "enter"]);

    director.dispose();
    expect(s1.calls).toEqual(["build", "enter", "exit", "dispose"]);
    expect(s2.calls).toEqual([]);
    expect(bottleDispose).not.toHaveBeenCalled();
    expect(shadowDispose).not.toHaveBeenCalled();
  });
});
