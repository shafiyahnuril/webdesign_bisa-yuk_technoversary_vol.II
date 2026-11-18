import { beforeAll, describe, expect, it, vi } from "vitest";
import * as THREE from "three";
import { Bottle, type BottleQualitySpec } from "../objects/bottle";
import { ContactShadow } from "../objects/contact-shadow";
import type { SharedObjectHandle, StageContext } from "../stage";
import { createB8Scene } from "./b8";

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
      rim: new THREE.DirectionalLight(0xb9f3c9, 2.6),
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

describe("Scene B8 (Perjalanan Kedua)", () => {
  beforeAll(() => {
    installCanvas2dMock();
  });

  it("melakukan tracking kamera -5..+5, membersihkan kekeruhan botol di lorong cuci, dan reset bersih saat mundur", () => {
    const ctx = makeTestContext();
    const b8 = createB8Scene();
    b8.build(ctx);
    b8.enter();

    b8.update(0, 0.6607, 0.016);
    expect(ctx.camera.position.x).toBeCloseTo(-5, 3);
    expect(ctx.camera.position.y).toBeCloseTo(1.5, 3);
    expect(ctx.camera.position.z).toBeCloseTo(6.2, 3);
    expect(ctx.shared.bottle.getParams().turbid).toBeCloseTo(0.25, 3);

    // Setelah lorong cuci (t = 0.86) botol bersih
    b8.update(0.86, 0.729, 0.016);
    expect(ctx.shared.bottle.getParams().turbid).toBeCloseTo(0, 3);
    expect(ctx.camera.position.x).toBeCloseTo(-5 + 10 * 0.86, 3);

    // Mundur kembali ke awal mengembalikan kekeruhan
    b8.update(0.05, 0.664, 0.016);
    expect(ctx.shared.bottle.getParams().turbid).toBeCloseTo(0.25, 2);

    b8.exit();
    b8.dispose();
    ctx.shared.bottle.dispose();
    ctx.shared.contactShadow.dispose();
  });
});
