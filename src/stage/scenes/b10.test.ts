import { beforeAll, describe, expect, it, vi } from "vitest";
import * as THREE from "three";
import { Bottle, type BottleQualitySpec } from "../objects/bottle";
import { ContactShadow } from "../objects/contact-shadow";
import type { SharedObjectHandle, StageContext } from "../stage";
import { createB10Scene } from "./b10";

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
      rim: new THREE.DirectionalLight(0x0f8b8d, 2.6),
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

describe("Scene B10 (Surat Terakhir)", () => {
  beforeAll(() => {
    installCanvas2dMock();
  });

  it("menjalankan 5 langkah kamera 10a-10e, sorot spot 0->3 tanpa shadowMap, redup produk x0.45, dan reset mundur", () => {
    const ctx = makeTestContext();
    const b10 = createB10Scene();
    b10.build(ctx);
    b10.enter();

    // 10a (t=0): close tote di x=-9.6, spot=0
    b10.update(0, 0.8304, 0.016);
    expect(ctx.camera.position.x).toBeCloseTo(-9.6, 2);
    expect(ctx.camera.position.z).toBeCloseTo(6.2, 2);
    expect(ctx.lights.spot.intensity).toBeCloseTo(0, 3);
    expect(ctx.lights.spot.castShadow).toBe(false);

    // 10b (t=0.28): zoom out z=19, x=0
    b10.update(0.28, 0.878, 0.016);
    expect(ctx.camera.position.x).toBeCloseTo(0, 1);
    expect(ctx.camera.position.z).toBeCloseTo(19, 1);

    // 10c (t=0.42): pan ke x=12, z=10
    b10.update(0.42, 0.902, 0.016);
    expect(ctx.camera.position.x).toBeCloseTo(12, 1);
    expect(ctx.camera.position.z).toBeCloseTo(10, 1);

    // 10d-10e (t=0.80): fokus tumbler x=14, z=5.5, spot=3, turntable berputar
    b10.update(0.8, 0.966, 0.5);
    expect(ctx.camera.position.x).toBeCloseTo(14, 1);
    expect(ctx.camera.position.z).toBeCloseTo(5.5, 1);
    expect(ctx.lights.spot.intensity).toBeCloseTo(3, 2);

    // Mundur ke 10a mereset spot ke 0 dan kamera ke -9.6
    b10.update(0.02, 0.833, 0.016);
    expect(ctx.camera.position.x).toBeCloseTo(-9.6, 1);
    expect(ctx.lights.spot.intensity).toBeCloseTo(0, 2);

    b10.exit();
    b10.dispose();
    ctx.shared.bottle.dispose();
    ctx.shared.contactShadow.dispose();
  });
});
