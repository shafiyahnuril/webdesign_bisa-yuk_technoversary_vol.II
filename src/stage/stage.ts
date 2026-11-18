import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { Bottle } from "./objects/bottle";
import { ContactShadow } from "./objects/contact-shadow";
import { QualityManager, type QualityConfig, type QualityTier } from "./quality";

export interface StageOptions {
  container?: HTMLElement;
  reducedMotion?: boolean;
  onContextLost?: () => void;
  onContextRestored?: () => void;
  onQualityChange?: (tier: QualityTier, config: QualityConfig) => void;
}

export interface SharedObjectHandle {
  readonly group: THREE.Object3D;
  reset?(): void;
  setQuality?(config: QualityConfig): void;
  dispose?(): void;
}

export interface StageShared {
  bottle: Bottle;
  contactShadow: ContactShadow;
  hand?: SharedObjectHandle;
  water?: SharedObjectHandle;
  particles?: SharedObjectHandle;
  readonly slots: Map<string, SharedObjectHandle>;
  register<T extends SharedObjectHandle>(key: string, handle: T): T;
  get<T extends SharedObjectHandle>(key: string): T | undefined;
}

export interface StageLights {
  key: THREE.DirectionalLight;
  rim: THREE.DirectionalLight;
  fill: THREE.HemisphereLight;
  spot: THREE.SpotLight;
}

export interface StageSize {
  w: number;
  h: number;
  dpr: number;
  aspect: number;
  isPortrait: boolean;
}

export interface StageContext {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
  readonly lights: StageLights;
  readonly shared: StageShared;
  readonly quality: QualityTier;
  readonly qualityConfig: QualityConfig;
  readonly qualityManager: QualityManager;
  readonly size: StageSize;
  readonly uniforms: { uTime: { value: number } };
  readonly env: THREE.Texture;
  reducedMotion: boolean;
  applyResponsiveCamera(baseFov?: number): void;
}

export interface Stage {
  readonly context: StageContext;
  readonly ctx: StageContext;
  render(dt: number): void;
  resize(): void;
  setQuality(tier: QualityTier): void;
  setReducedMotion(reduced: boolean): void;
  pause(): void;
  resume(): void;
  dispose(): void;
}

const DEFAULT_FOV = 35;
const PORTRAIT_FOV = 42;
const PORTRAIT_ASPECT_LIMIT = 0.7;
const PORTRAIT_OFFSET_RATIO = 0.12;

function measureContainer(container: HTMLElement | null, canvas: HTMLCanvasElement) {
  const target = container ?? canvas.parentElement;
  const w = Math.max(1, target?.clientWidth || canvas.clientWidth || window.innerWidth || 1280);
  const h = Math.max(1, target?.clientHeight || canvas.clientHeight || window.innerHeight || 720);
  return { w, h };
}

function buildRoomEnvironment(renderer: THREE.WebGLRenderer): THREE.WebGLRenderTarget {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const target = pmrem.fromScene(room, 0.04);
  room.dispose();
  pmrem.dispose();
  return target;
}

export function createStage(
  canvas: HTMLCanvasElement,
  qualityOrManager?: QualityTier | QualityManager,
  opts: StageOptions = {},
): Stage {
  const qualityManager =
    qualityOrManager instanceof QualityManager
      ? qualityOrManager
      : new QualityManager(qualityOrManager);
  const initialConfig = qualityManager.config;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: initialConfig.antialias,
    powerPreference: "high-performance",
    stencil: false,
    depth: true,
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.localClippingEnabled = true;
  renderer.shadowMap.enabled = false;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  let envTarget = buildRoomEnvironment(renderer);
  scene.environment = envTarget.texture;
  scene.environmentIntensity = 0.6;

  const initialDim = measureContainer(opts.container ?? null, canvas);
  const initialDpr = Math.min(window.devicePixelRatio || 1, initialConfig.dprCap);
  const size: StageSize = {
    w: initialDim.w,
    h: initialDim.h,
    dpr: initialDpr,
    aspect: initialDim.w / initialDim.h,
    isPortrait: initialDim.w / initialDim.h < PORTRAIT_ASPECT_LIMIT,
  };

  const camera = new THREE.PerspectiveCamera(DEFAULT_FOV, size.aspect, 0.1, 200);
  camera.position.set(0, 1.05, 7.2);
  camera.lookAt(0, 1.05, 0);

  const key = new THREE.DirectionalLight(0xeaf4ff, 2.2);
  key.position.set(-4, 6, 5);
  const rim = new THREE.DirectionalLight(0x8fd3ff, 3.0);
  rim.position.set(4.5, 3.5, -4);
  const fill = new THREE.HemisphereLight(0x8fb0cc, 0x0a1226, 0.35);
  const spot = new THREE.SpotLight(0xffffff, 0);
  spot.position.set(14, 7, 4);
  scene.add(key, key.target, rim, rim.target, fill, spot, spot.target);

  const lights: StageLights = { key, rim, fill, spot };
  const uniforms = { uTime: { value: 0 } };

  const bottle = new Bottle(scene, initialConfig);
  const contactShadow = new ContactShadow(scene);
  const slots = new Map<string, SharedObjectHandle>();

  const shared: StageShared = {
    bottle,
    contactShadow,
    slots,
    register<T extends SharedObjectHandle>(keyName: string, handle: T): T {
      slots.set(keyName, handle);
      if (keyName === "hand") shared.hand = handle;
      else if (keyName === "water") shared.water = handle;
      else if (keyName === "particles") shared.particles = handle;
      return handle;
    },
    get<T extends SharedObjectHandle>(keyName: string): T | undefined {
      return slots.get(keyName) as T | undefined;
    },
  };

  const applyResponsiveCamera = (baseFov = DEFAULT_FOV) => {
    const aspect = size.aspect;
    size.isPortrait = aspect < PORTRAIT_ASPECT_LIMIT;
    camera.aspect = aspect;
    if (size.isPortrait) {
      camera.fov = PORTRAIT_FOV;
      camera.setViewOffset(
        size.w,
        size.h,
        0,
        Math.round(size.h * PORTRAIT_OFFSET_RATIO),
        size.w,
        size.h,
      );
    } else {
      camera.fov = baseFov;
      camera.clearViewOffset();
    }
    camera.updateProjectionMatrix();
  };

  const context: StageContext = {
    renderer,
    scene,
    camera,
    lights,
    shared,
    get quality() {
      return qualityManager.tier;
    },
    get qualityConfig() {
      return qualityManager.config;
    },
    qualityManager,
    size,
    uniforms,
    get env() {
      return envTarget.texture;
    },
    reducedMotion: opts.reducedMotion ?? false,
    applyResponsiveCamera,
  };

  let paused = false;
  let contextLost = false;
  let disposed = false;

  const applyQualityConfig = (cfg: QualityConfig) => {
    const nextDpr = Math.min(window.devicePixelRatio || 1, cfg.dprCap);
    size.dpr = nextDpr;
    renderer.setPixelRatio(nextDpr);
    renderer.setSize(size.w, size.h, false);
    bottle.setQuality(cfg);
    slots.forEach((slot) => slot.setQuality?.(cfg));
  };

  const resize = () => {
    if (disposed) return;
    const dim = measureContainer(opts.container ?? null, canvas);
    const cfg = qualityManager.config;
    size.w = dim.w;
    size.h = dim.h;
    size.dpr = Math.min(window.devicePixelRatio || 1, cfg.dprCap);
    size.aspect = dim.w / dim.h;
    renderer.setPixelRatio(size.dpr);
    renderer.setSize(size.w, size.h, false);
    applyResponsiveCamera(camera.fov === PORTRAIT_FOV ? DEFAULT_FOV : camera.fov);
  };

  resize();

  const unsubscribeQuality = qualityManager.subscribe((tier, cfg) => {
    if (disposed) return;
    applyQualityConfig(cfg);
    opts.onQualityChange?.(tier, cfg);
  });

  const targetEl = opts.container ?? canvas.parentElement;
  let observer: ResizeObserver | null = null;
  if (typeof ResizeObserver !== "undefined" && targetEl) {
    observer = new ResizeObserver(() => resize());
    observer.observe(targetEl);
  }
  const onWindowResize = () => resize();
  window.addEventListener("resize", onWindowResize);

  const onContextLost = (event: Event) => {
    event.preventDefault();
    contextLost = true;
    opts.onContextLost?.();
  };

  const onContextRestored = () => {
    contextLost = false;
    envTarget.dispose();
    envTarget = buildRoomEnvironment(renderer);
    scene.environment = envTarget.texture;
    resize();
    opts.onContextRestored?.();
  };

  canvas.addEventListener("webglcontextlost", onContextLost);
  canvas.addEventListener("webglcontextrestored", onContextRestored);

  return {
    context,
    ctx: context,
    render(dt: number) {
      if (disposed || paused || contextLost) return;
      if (!context.reducedMotion && dt > 0) {
        uniforms.uTime.value += dt;
      }
      qualityManager.recordFrame(dt);
      bottle.syncLiquidClip();
      renderer.render(scene, camera);
    },
    resize,
    setQuality(tier: QualityTier) {
      qualityManager.setTier(tier);
    },
    setReducedMotion(reduced: boolean) {
      context.reducedMotion = reduced;
    },
    pause() {
      paused = true;
    },
    resume() {
      paused = false;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      observer?.disconnect();
      window.removeEventListener("resize", onWindowResize);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
      unsubscribeQuality();
      bottle.dispose();
      contactShadow.dispose();
      slots.forEach((slot) => slot.dispose?.());
      slots.clear();
      envTarget.dispose();
      renderer.dispose();
    },
  };
}
