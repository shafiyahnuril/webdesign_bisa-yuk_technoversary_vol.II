import { beforeAll, describe, expect, it, vi } from "vitest";
import * as THREE from "three";
import { Bottle, type BottleQualitySpec } from "../objects/bottle";
import { ContactShadow } from "../objects/contact-shadow";
import type { SharedObjectHandle, StageContext } from "../stage";
import { createB7Scene } from "./b7";
import { createFlashPass, type FlashPass } from "./flash";

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

function makeMockRenderer() {
  const calls: string[] = [];
  const renderer = {
    autoClear: true,
    setViewport: vi.fn(() => calls.push("setViewport")),
    setScissor: vi.fn(() => calls.push("setScissor")),
    setScissorTest: vi.fn((v: boolean) => calls.push(`setScissorTest:${String(v)}`)),
    clearDepth: vi.fn(() => calls.push("clearDepth")),
    render: vi.fn(() => calls.push("render")),
  };
  return { renderer: renderer as unknown as THREE.WebGLRenderer, mock: renderer, calls };
}

function makeTestContext(renderer: THREE.WebGLRenderer, aspect = 16 / 9): StageContext {
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
    renderer,
    scene,
    camera,
    lights: {
      key: new THREE.DirectionalLight(0xeaf4ff, 2.2),
      rim: new THREE.DirectionalLight(0x9fe6d0, 2.6),
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

beforeAll(() => {
  installCanvas2dMock();
});

describe("FlashPass (jendela kilas scissor B7c)", () => {
  it("memakai renderer yang sama dengan scissor test dan mengembalikan viewport/autoclear/scissortest setelah render", () => {
    const { renderer, mock } = makeMockRenderer();
    const ctx = makeTestContext(renderer);
    const flash = createFlashPass(ctx);

    flash.setRect({ x: 960, y: 80, width: 544, height: 416 });
    flash.setActive(true);
    flash.renderPass(0.5);

    expect(mock.setScissorTest).toHaveBeenNthCalledWith(1, true);
    expect(mock.setScissorTest).toHaveBeenLastCalledWith(false);
    expect(mock.setViewport).toHaveBeenLastCalledWith(0, 0, 1600, 900);
    expect(mock.clearDepth).toHaveBeenCalledTimes(1);
    expect(mock.render).toHaveBeenCalledTimes(1);
    expect(renderer.autoClear).toBe(true);

    flash.dispose();
    ctx.shared.bottle.dispose();
    ctx.shared.contactShadow.dispose();
  });
});

describe("Scene B7 (Di Tempat yang Benar)", () => {

  it("mengantarkan botol ke tempat sampah Plastik (-2.0), mengaktifkan kilas 7c, dan mereset bersih saat mundur", () => {
    const { renderer } = makeMockRenderer();
    const ctx = makeTestContext(renderer);
    const b7 = createB7Scene();
    b7.build(ctx);

    expect(ctx.shared.get("flash")).toBeDefined();
    b7.enter();

    // 7a: tangan memegang botol tegak di kanan
    b7.update(0.05, 0.601, 0.016);
    expect(ctx.shared.bottle.group.parent).not.toBe(ctx.scene);

    // 7b: botol dilepas masuk ke tempat sampah Plastik (-2.0)
    b7.update(0.38, 0.622, 0.016);
    expect(ctx.shared.bottle.group.parent).toBe(ctx.scene);
    expect(ctx.shared.bottle.group.position.x).toBeCloseTo(-2.0, 1);

    // 7c: jendela kilas aktif di [0.40, 0.70]
    b7.update(0.55, 0.632, 0.016);
    const flashHandle = ctx.shared.get<FlashPass>("flash");
    expect(flashHandle?.isActive()).toBe(true);

    // 7d -> akhir: kilas nonaktif, tempat sampah turun -0.3
    b7.update(1.0, 0.66, 0.016);
    expect(flashHandle?.isActive()).toBe(false);

    // Mundur ke awal tidak menyisakan bekas
    b7.update(0.04, 0.6, 0.016);
    expect(ctx.shared.bottle.group.parent).not.toBe(ctx.scene);

    b7.exit();
    b7.dispose();
    ctx.shared.bottle.dispose();
    ctx.shared.contactShadow.dispose();
    ctx.shared.hand?.dispose?.();
  });
});
