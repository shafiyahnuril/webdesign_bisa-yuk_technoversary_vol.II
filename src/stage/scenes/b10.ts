import gsap from "gsap";
import * as THREE from "three";
import { CUES, PALETTE } from "@/lib/tokens";
import type { Scene } from "../director";
import { Products } from "../objects/products";
import { Shelf, SHELF_SPECS } from "../objects/shelf";
import { Tumbler, TUMBLER_SPECS } from "../objects/tumbler";
import type { StageContext } from "../stage";
import { clamp01, lerp } from "../util/math";

const C10_ACCENT = new THREE.Color(PALETTE.c10.accent);
const KEY_COLOR = new THREE.Color("#F7FBF5");
const FILL_SKY = new THREE.Color("#E6EEE4");
const FILL_GROUND = new THREE.Color("#7E9E8B");
const LOOK_AT = new THREE.Vector3(-9.6, 1.3, 0);

interface B10RigState {
  camX: number;
  camY: number;
  camZ: number;
  lookX: number;
  lookY: number;
  spot: number;
  dim: number;
  outZoomBoost: number;
  plinthSnap: number;
}

/**
 * Scene B10 ("Surat Terakhir"):
 * Kamera 5 langkah 10a-10e (close tote -> zoom out koleksi -> pan ke plinth ->
 * sorot spot tanpa shadow-map + redup produk x0.45 -> turntable tumbler 0.2 rad/s).
 */
export function createB10Scene(): Scene {
  let ctx: StageContext | null = null;
  let shelf: Shelf | null = null;
  let products: Products | null = null;
  let tumbler: Tumbler | null = null;
  let tl: gsap.core.Timeline | null = null;
  let turnAngle = 0;

  const state: B10RigState = {
    camX: -9.6,
    camY: 1.4,
    camZ: 6.2,
    lookX: -9.6,
    lookY: 1.3,
    spot: 0,
    dim: 1,
    outZoomBoost: 0,
    plinthSnap: 0,
  };

  const resetState = () => {
    state.camX = -9.6;
    state.camY = 1.4;
    state.camZ = 6.2;
    state.lookX = -9.6;
    state.lookY = 1.3;
    state.spot = 0;
    state.dim = 1;
    state.outZoomBoost = 0;
    state.plinthSnap = 0;
  };

  return {
    id: "b10",

    build(stageCtx: StageContext) {
      ctx = stageCtx;
      shelf = new Shelf(stageCtx.scene);
      products = new Products(stageCtx.scene, SHELF_SPECS.topY);
      tumbler = new Tumbler(stageCtx.scene, stageCtx.quality === "low" ? 24 : 48);

      shelf.group.visible = false;
      products.group.visible = false;
      tumbler.group.visible = false;

      resetState();
      tl = gsap.timeline({ paused: true, defaults: { ease: "power2.inOut" } });
      tl.addLabel("a", 0)
        // 10b (0.14 -> 0.28): zoom out seluruh koleksi
        .to(
          state,
          { camX: 0, camY: 2.2, camZ: 19, lookX: 0, lookY: 1.4, outZoomBoost: 1, duration: 0.14 },
          0.14,
        )
        // 10c (0.28 -> 0.42): pan kanan menuju ujung rak + plinth
        .to(
          state,
          { camX: 12, camY: 1.6, camZ: 10, lookX: 12, lookY: 1.2, outZoomBoost: 0, duration: 0.14 },
          0.28,
        )
        // 10d (0.42 -> 0.72): zoom in ke tumbler, sorot spot 0->3, redup produk -> 0.45
        .to(
          state,
          {
            camX: 14,
            camY: 1.3,
            camZ: 5.5,
            lookX: 14,
            lookY: 1.2,
            spot: 3,
            plinthSnap: 1,
            duration: 0.3,
          },
          0.42,
        )
        .to(state, { dim: 0.45, duration: 0.2 }, 0.42)
        // 10e (0.72 -> 1.00): tahan durasi total tepat = 1.0
        .to(state, { plinthSnap: 1, duration: 0.28 }, 0.72);
    },

    enter() {
      if (!ctx || !shelf || !products || !tumbler || !tl) return;
      const { bottle, contactShadow } = ctx.shared;
      const water = ctx.shared.get("water");
      if (water) water.group.visible = false;
      const particles = ctx.shared.get("particles");
      if (particles) particles.group.visible = false;
      const hand = ctx.shared.get("hand");
      if (hand) hand.group.visible = false;
      const flash = ctx.shared.get("flash") as
        { setActive?: (active: boolean) => void } | undefined;
      flash?.setActive?.(false);

      const isPortrait = ctx.size.isPortrait;
      const plinthX = isPortrait ? TUMBLER_SPECS.portraitX : TUMBLER_SPECS.desktopX;

      turnAngle = 0;
      bottle.reset();
      bottle.group.visible = false;

      shelf.reset();
      shelf.group.visible = true;

      products.reset();
      products.setCompactMode(isPortrait);
      products.group.visible = true;

      tumbler.reset();
      tumbler.setQuality(ctx.qualityConfig);
      tumbler.setPlacementX(plinthX);
      tumbler.group.visible = true;

      contactShadow.reset();
      contactShadow.setPosition(plinthX, 0.002, 0);
      contactShadow.setScale(1.15);
      contactShadow.setOpacity(0.28);
      contactShadow.setVisible(true);

      ctx.lights.key.color.copy(KEY_COLOR);
      ctx.lights.key.intensity = 2.0;
      ctx.lights.rim.color.copy(C10_ACCENT);
      ctx.lights.rim.intensity = CUES.c10.rim;
      ctx.lights.fill.color.copy(FILL_SKY);
      ctx.lights.fill.groundColor.copy(FILL_GROUND);
      ctx.lights.fill.intensity = 0.55;

      ctx.lights.spot.color.set("#FFFFFF");
      ctx.lights.spot.intensity = 0;
      ctx.lights.spot.angle = 0.32;
      ctx.lights.spot.penumbra = 0.6;
      ctx.lights.spot.castShadow = false;
      ctx.lights.spot.position.set(plinthX, 7, 4);
      ctx.lights.spot.target.position.set(plinthX, 1.2, 0);
      ctx.lights.spot.target.updateMatrixWorld();

      ctx.scene.environmentIntensity = CUES.c10.env;
      ctx.scene.fog = null;

      tl.progress(0);
      ctx.applyResponsiveCamera(35);
      ctx.camera.position.set(state.camX, state.camY, state.camZ);
      LOOK_AT.set(state.lookX, state.lookY, 0);
      ctx.camera.lookAt(LOOK_AT);
    },

    update(t: number, _p: number, dt: number) {
      if (!ctx || !shelf || !products || !tumbler || !tl) return;
      const { bottle, contactShadow } = ctx.shared;
      const water = ctx.shared.get("water");
      if (water) water.group.visible = false;
      const particles = ctx.shared.get("particles");
      if (particles) particles.group.visible = false;
      const hand = ctx.shared.get("hand");
      if (hand) hand.group.visible = false;

      const isPortrait = ctx.size.isPortrait;
      const plinthX = isPortrait ? TUMBLER_SPECS.portraitX : TUMBLER_SPECS.desktopX;

      bottle.group.visible = false;
      shelf.group.visible = true;
      products.group.visible = true;
      products.setCompactMode(isPortrait);
      tumbler.group.visible = true;
      tumbler.setQuality(ctx.qualityConfig);
      tumbler.setPlacementX(plinthX);

      tl.progress(clamp01(t));

      products.setDim(state.dim);
      ctx.lights.spot.intensity = state.spot;
      ctx.lights.spot.castShadow = false;
      ctx.lights.spot.position.set(plinthX, 7, 4);
      ctx.lights.spot.target.position.set(plinthX, 1.2, 0);
      ctx.lights.spot.target.updateMatrixWorld();

      if (t >= 0.72) {
        if (!ctx.reducedMotion && dt > 0) {
          turnAngle += 0.2 * dt;
        }
      } else {
        turnAngle = 0;
      }
      tumbler.setTurnAngle(turnAngle);

      contactShadow.setPosition(plinthX, 0.002, 0);
      contactShadow.setScale(1.15);
      contactShadow.setOpacity(0.28);
      contactShadow.setVisible(true);

      const camX = isPortrait ? lerp(state.camX, plinthX, state.plinthSnap) : state.camX;
      const lookX = isPortrait ? lerp(state.lookX, plinthX, state.plinthSnap) : state.lookX;
      const camZ = state.camZ + (isPortrait ? state.outZoomBoost * 2 : 0);

      ctx.applyResponsiveCamera(35);
      ctx.camera.position.set(camX, state.camY, camZ);
      LOOK_AT.set(lookX, state.lookY, 0);
      ctx.camera.lookAt(LOOK_AT);
    },

    exit() {
      if (!ctx) return;
      turnAngle = 0;
      ctx.lights.spot.intensity = 0;
      products?.setDim(1);
      tumbler?.setTurnAngle(0);
      if (shelf) shelf.group.visible = false;
      if (products) products.group.visible = false;
      if (tumbler) tumbler.group.visible = false;
    },

    dispose() {
      tl?.kill();
      tl = null;
      shelf?.dispose();
      products?.dispose();
      tumbler?.dispose();
      shelf = null;
      products = null;
      tumbler = null;
      ctx = null;
    },
  };
}
