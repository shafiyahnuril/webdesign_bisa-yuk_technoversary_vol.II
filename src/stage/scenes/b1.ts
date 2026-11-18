import * as THREE from "three";
import { CUES, PALETTE } from "@/lib/tokens";
import type { Scene } from "../director";
import type { StageContext } from "../stage";
import { clamp01, degToRad, easeInOutQuad, lerp, smoothstep } from "../util/math";

const C1_ACCENT = new THREE.Color(PALETTE.c1.accent);
const C2_ACCENT = new THREE.Color(PALETTE.c2.accent);
const KEY_COLOR = new THREE.Color("#EAF4FF");
const FILL_SKY = new THREE.Color("#8FB0CC");
const FILL_GROUND = new THREE.Color("#0A1226");
const LOOK_AT = new THREE.Vector3(0, 1.05, 0);

const CAM_HERO_Z = 7.2;
const CAM_CLOSE_Z = 6.6;
const CAM_BASE_Y = 1.05;
const TILT_DOWN_OFFSET = Math.tan(degToRad(2)) * CAM_CLOSE_Z;

/**
 * Scene B1 / Hero ("Lahir"):
 * Hanya Bottle + ContactShadow bersama. Frame 0 (t=0) cocok dengan poster provisional.
 */
export function createB1Scene(): Scene {
  let ctx: StageContext | null = null;
  let idleTime = 0;

  return {
    id: "b1",

    build(stageCtx: StageContext) {
      ctx = stageCtx;
    },

    enter() {
      if (!ctx) return;
      idleTime = 0;
      const { bottle, contactShadow, shared } = { ...ctx.shared, shared: ctx.shared };
      const water = shared.get("water");
      if (water) water.group.visible = false;
      const particles = shared.get("particles");
      if (particles) particles.group.visible = false;
      const hand = shared.get("hand");
      if (hand) hand.group.visible = false;
      const flash = shared.get("flash") as { setActive?: (active: boolean) => void } | undefined;
      flash?.setActive?.(false);

      bottle.reset();
      bottle.setIdle(0, false);

      contactShadow.reset();
      contactShadow.setPosition(0, 0.002, 0);
      contactShadow.setScale(1.35);
      contactShadow.setOpacity(0.35);
      contactShadow.setVisible(true);

      ctx.lights.key.color.copy(KEY_COLOR);
      ctx.lights.key.intensity = 2.2;
      ctx.lights.rim.color.copy(C1_ACCENT);
      ctx.lights.rim.intensity = CUES.c1.rim;
      ctx.lights.fill.color.copy(FILL_SKY);
      ctx.lights.fill.groundColor.copy(FILL_GROUND);
      ctx.lights.fill.intensity = 0.35;
      ctx.lights.spot.intensity = 0;
      ctx.scene.environmentIntensity = CUES.c1.env;
      ctx.scene.fog = null;

      ctx.applyResponsiveCamera(35);
      ctx.camera.position.set(0, CAM_BASE_Y, CAM_HERO_Z);
      LOOK_AT.set(0, CAM_BASE_Y, 0);
      ctx.camera.lookAt(LOOK_AT);
    },

    update(t: number, _p: number, dt: number) {
      if (!ctx) return;
      const { bottle, contactShadow } = ctx.shared;
      const water = ctx.shared.get("water");
      if (water) water.group.visible = false;
      const particles = ctx.shared.get("particles");
      if (particles) particles.group.visible = false;
      const hand = ctx.shared.get("hand");
      if (hand) hand.group.visible = false;
      const plateauX = ctx.size.isPortrait ? 0.55 : 1.4;

      if (!ctx.reducedMotion && dt > 0) {
        idleTime += dt;
      }

      let x = 0;
      let rotY = 0;
      let camZ = CAM_HERO_Z;
      let lookY = CAM_BASE_Y;

      if (t <= 0.06) {
        x = 0;
        rotY = 0;
        camZ = CAM_HERO_Z;
      } else if (t <= 0.28) {
        const k = easeInOutQuad(clamp01((t - 0.06) / 0.22));
        x = lerp(0, plateauX, k);
        rotY = lerp(0, Math.PI * 0.9, k);
        camZ = lerp(CAM_HERO_Z, CAM_CLOSE_Z, k);
      } else if (t <= 0.66) {
        const k = clamp01((t - 0.28) / 0.38);
        x = plateauX;
        rotY = lerp(Math.PI * 0.9, Math.PI * 1.15, k);
        camZ = CAM_CLOSE_Z;
      } else if (t <= 0.72) {
        const k = easeInOutQuad(clamp01((t - 0.66) / 0.06));
        x = lerp(plateauX, 0.6, k);
        rotY = lerp(Math.PI * 1.15, Math.PI * 1.2, k);
        camZ = CAM_CLOSE_Z;
      } else {
        const k = smoothstep(0.72, 1.0, t);
        x = 0.6;
        rotY = Math.PI * 1.2;
        camZ = CAM_CLOSE_Z;
        lookY = lerp(CAM_BASE_Y, CAM_BASE_Y - TILT_DOWN_OFFSET, k);
      }

      bottle.group.visible = true;
      bottle.group.position.set(x, 0, 0);
      bottle.group.rotation.set(0, rotY, 0);

      const idleEnabled = !ctx.reducedMotion && idleTime > 0;
      bottle.setIdle(idleTime, idleEnabled, t < 0.06 ? 1 : 0.35);

      const cueMix = smoothstep(0.7, 1.0, t);
      const turbid = lerp(CUES.c1.turbid, CUES.c2.turbid, cueMix);
      bottle.setParams({
        turbid,
        crack: 0,
        breakAmt: 0,
        dirt: 0,
        opacity: 1,
        level: 0.85,
      });

      contactShadow.setPosition(x, 0.002, 0);
      contactShadow.setOpacity(0.35);
      contactShadow.setVisible(true);

      ctx.lights.rim.intensity = lerp(CUES.c1.rim, CUES.c2.rim, cueMix);
      ctx.lights.rim.color.lerpColors(C1_ACCENT, C2_ACCENT, cueMix);
      ctx.scene.environmentIntensity = lerp(CUES.c1.env, CUES.c2.env, cueMix);

      ctx.applyResponsiveCamera(35);
      ctx.camera.position.set(0, CAM_BASE_Y, camZ);
      LOOK_AT.set(0, lookY, 0);
      ctx.camera.lookAt(LOOK_AT);
    },

    exit() {
      if (!ctx) return;
      ctx.shared.bottle.setIdle(0, false);
    },

    dispose() {
      // Objek bersama (bottle, contactShadow) dimiliki Stage, bukan scene B1.
      ctx = null;
    },
  };
}
