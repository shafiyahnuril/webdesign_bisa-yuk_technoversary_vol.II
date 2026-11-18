import { beforeAll, describe, expect, it, vi } from "vitest";
import * as THREE from "three";
import { Bottle, type BottleQualitySpec } from "../objects/bottle";
import { ContactShadow } from "../objects/contact-shadow";
import type { SharedObjectHandle, StageContext } from "../stage";
import { createB9Scene, type ProcessStationsHandle } from "./b9";

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

describe("Scene B9 (Hidup Baru, Tapi...)", () => {
  beforeAll(() => {
    installCanvas2dMock();
  });

  it("mengekspos posisi 4 stasiun, menggeser kamera dari -1 ke +19, mencacah botol lalu menampilkan tote", () => {
    const ctx = makeTestContext();
    const b9 = createB9Scene();
    b9.build(ctx);

    const stationSlot = ctx.shared.get<ProcessStationsHandle>("stations");
    expect(stationSlot).toBeDefined();
    const positions = stationSlot!.getStationPositions();
    expect(positions.map((p) => p.x)).toEqual([0, 6, 12, 18]);

    b9.enter();
    b9.update(0, 0.7411, 0.016);
    expect(ctx.camera.position.x).toBeCloseTo(-1, 2);
    expect(ctx.shared.bottle.group.visible).toBe(true);

    b9.update(0.5, 0.785, 0.016);
    expect(ctx.shared.bottle.group.visible).toBe(false);

    b9.update(0.95, 0.825, 0.016);
    expect(ctx.camera.position.x).toBeGreaterThan(15);

    // Mundur ke awal mengembalikan botol terlihat & scaleY = 1
    b9.update(0, 0.7411, 0.016);
    expect(ctx.shared.bottle.group.visible).toBe(true);
    expect(ctx.shared.bottle.group.scale.y).toBeCloseTo(1, 3);

    b9.exit();
    b9.dispose();
    ctx.shared.bottle.dispose();
    ctx.shared.contactShadow.dispose();
  });
});
