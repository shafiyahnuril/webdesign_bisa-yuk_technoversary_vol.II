import { beforeAll, describe, expect, it, vi } from "vitest";
import * as THREE from "three";
import { createB2Scene } from "./b2";
import { Bottle, type BottleQualitySpec } from "../objects/bottle";
import { ContactShadow } from "../objects/contact-shadow";
import type { SharedObjectHandle, StageContext } from "../stage";

const HIGH_SPEC: BottleQualitySpec = {
  bottleSegments: 48,
  bottleShards: { radial: 12, bands: 4 },
  crackSize: 1024,
  transmission: true,
};

function installCanvas2dMock() {
  const noop = () => {};
  const fakeGradient = { addColorStop: noop };
  const fakeCtx = {
    lineCap: "round",
    lineJoin: "round",
    lineWidth: 1,
    strokeStyle: "",
    fillStyle: "",
    font: "",
    textBaseline: "middle",
    beginPath: noop,
    moveTo: noop,
    lineTo: noop,
    stroke: noop,
    fill: noop,
    fillRect: noop,
    fillText: noop,
    save: noop,
    restore: noop,
    translate: noop,
    scale: noop,
    createRadialGradient: () => fakeGradient,
    createImageData: (w: number, h: number) => ({
      width: w,
      height: h,
      data: new Uint8ClampedArray(w * h * 4),
    }),
    putImageData: noop,
  } as unknown as CanvasRenderingContext2D;

  vi.stubGlobal(
    "Path2D",
    class Path2DMock {
      constructor() {}
    },
  );
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(((id: string) =>
    id === "2d" ? fakeCtx : null) as HTMLCanvasElement["getContext"]);
}

function makeTestContext(aspect = 16 / 9): StageContext {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, aspect, 0.1, 200);
  const bottle = new Bottle(scene, HIGH_SPEC);
  const contactShadow = new ContactShadow(scene);
  const slots = new Map<string, SharedObjectHandle>();

  const shared: StageContext["shared"] = {
    bottle,
    contactShadow,
    slots,
    register<T extends SharedObjectHandle>(key: string, handle: T): T {
      slots.set(key, handle);
      if (key === "hand") shared.hand = handle;
      return handle;
    },
    get<T extends SharedObjectHandle>(key: string): T | undefined {
      return slots.get(key) as T | undefined;
    },
  };

  return {
    renderer: {} as THREE.WebGLRenderer,
    scene,
    camera,
    lights: {
      key: new THREE.DirectionalLight(0xeaf4ff, 2.2),
      rim: new THREE.DirectionalLight(0x9cc6ea, 2.8),
      fill: new THREE.HemisphereLight(0x8fb0cc, 0x0a1226, 0.35),
      spot: new THREE.SpotLight(0xffffff, 0),
    },
    shared,
    quality: "high",
    qualityConfig: {
      ...HIGH_SPEC,
      tier: "high",
      dprCap: 2,
      particles: 2400,
      waterSegments: 160,
      caustics: true,
      canvasShimmer: true,
      meltFilter: true,
      flashScissor: true,
      windowAtlas: true,
      antialias: true,
    },
    qualityManager: {} as StageContext["qualityManager"],
    size: { w: 1600, h: 900, dpr: 1, aspect, isPortrait: false },
    uniforms: { uTime: { value: 0 } },
    env: new THREE.Texture(),
    reducedMotion: false,
    applyResponsiveCamera: vi.fn(),
  };
}

describe("Scene B2 (Sekali Pakai)", () => {
  beforeAll(() => {
    installCanvas2dMock();
  });

  it("mendaftarkan hand di shared slot, menggenggam, memiringkan botol minum 85%->3%, dan melempar parabola", () => {
    const ctx = makeTestContext();
    const b2 = createB2Scene();
    b2.build(ctx);
    expect(ctx.shared.get("hand")).toBeDefined();
    expect(ctx.shared.get("hand")?.group.visible).toBe(false);

    b2.enter();
    b2.update(0, 0.0625, 0.016);
    expect(ctx.shared.bottle.group.parent).toBe(ctx.scene);
    expect(ctx.shared.bottle.getParams().level).toBeCloseTo(0.85, 3);

    // Fase minum tengah (t = 0.52 -> cairan 3%)
    b2.update(0.37, 0.09, 0.016);
    expect(ctx.shared.bottle.group.parent).not.toBe(ctx.scene);
    expect(ctx.shared.bottle.getParams().level).toBeLessThan(0.5);

    b2.update(0.52, 0.1, 0.016);
    expect(ctx.shared.bottle.getParams().level).toBeCloseTo(0.03, 3);

    // Fase lempar (t = 0.90 -> lepas dan terlempar ke kiri bawah)
    b2.update(0.9, 0.135, 0.016);
    expect(ctx.shared.bottle.group.parent).toBe(ctx.scene);
    expect(ctx.shared.bottle.group.position.x).toBeCloseTo(-4.2, 1);
    expect(ctx.shared.bottle.group.position.y).toBeCloseTo(-3.4, 1);

    // Mundur ke awal tidak menyisakan bekas
    b2.update(0.05, 0.066, 0.016);
    expect(ctx.shared.bottle.group.parent).toBe(ctx.scene);
    expect(ctx.shared.bottle.getParams().level).toBeCloseTo(0.85, 3);

    b2.exit();
    b2.dispose();
    ctx.shared.bottle.dispose();
    ctx.shared.contactShadow.dispose();
    ctx.shared.hand?.dispose?.();
  });
});
