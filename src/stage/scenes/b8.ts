import * as THREE from "three";
import { CUES, PALETTE } from "@/lib/tokens";
import type { Scene } from "../director";
import { Conveyor } from "../objects/conveyor";
import type { StageContext } from "../stage";
import { clamp01, easeInOutQuad, lerp, smoothstep } from "../util/math";

const C8_ACCENT = new THREE.Color(PALETTE.c8.accent);
const C9_ACCENT = new THREE.Color(PALETTE.c9.accent);
const KEY_COLOR = new THREE.Color("#F1FAF7");
const FILL_SKY = new THREE.Color("#B9F3C9");
const FILL_GROUND = new THREE.Color("#143B37");
const LOOK_AT = new THREE.Vector3(-4.5, 0.9, 0);

/**
 * Scene B8 ("Perjalanan Kedua"):
 * Tracking side-shot menyusuri sabuk pemilahan, memvisualisasikan botol teman yang hilang,
 * membersihkan botol di lorong cuci (uTurbid 0.25 -> 0), dan masuk hopper PET.
 */
export function createB8Scene(): Scene {
  let ctx: StageContext | null = null;
  let conveyor: Conveyor | null = null;

  return {
    id: "b8",

    build(stageCtx: StageContext) {
      ctx = stageCtx;
      conveyor = new Conveyor(
        stageCtx.scene,
        stageCtx.size.isPortrait || stageCtx.quality === "low",
      );
      conveyor.group.visible = false;
    },

    enter() {
      if (!ctx || !conveyor) return;
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

      conveyor.setCompactMode(ctx.size.isPortrait || ctx.quality === "low");
      conveyor.reset();
      conveyor.group.visible = true;

      bottle.reset();
      bottle.group.visible = true;
      bottle.setIdle(0, false);
      bottle.setParams({
        turbid: 0.25,
        dirt: 0.35,
        crack: 0,
        breakAmt: 0,
        opacity: 1,
        level: 0,
      });

      contactShadow.reset();
      contactShadow.setVisible(false);

      ctx.lights.key.color.copy(KEY_COLOR);
      ctx.lights.key.intensity = 2.2;
      ctx.lights.rim.color.copy(C8_ACCENT);
      ctx.lights.rim.intensity = CUES.c8.rim;
      ctx.lights.fill.color.copy(FILL_SKY);
      ctx.lights.fill.groundColor.copy(FILL_GROUND);
      ctx.lights.fill.intensity = 0.45;
      ctx.lights.spot.intensity = 0;
      ctx.scene.environmentIntensity = CUES.c8.env;
      ctx.scene.fog = null;

      ctx.applyResponsiveCamera(35);
      ctx.camera.position.set(-5, 1.5, 6.2);
      LOOK_AT.set(-4.5, 0.9, 0);
      ctx.camera.lookAt(LOOK_AT);
    },

    update(t: number) {
      if (!ctx || !conveyor) return;
      const { bottle } = ctx.shared;
      const water = ctx.shared.get("water");
      if (water) water.group.visible = false;
      const particles = ctx.shared.get("particles");
      if (particles) particles.group.visible = false;
      const hand = ctx.shared.get("hand");
      if (hand) hand.group.visible = false;

      conveyor.setCompactMode(ctx.size.isPortrait || ctx.quality === "low");
      conveyor.group.visible = true;
      conveyor.update(t);

      // Posisi botol menyusuri sabuk: jatuh corong -> pemilahan -> lorong cuci -> hopper
      let bx = -8.6;
      let by = 2.7;
      let rotZ = 0;

      if (t <= 0.12) {
        const k = easeInOutQuad(clamp01(t / 0.12));
        bx = lerp(-8.6, -6.5, k);
        by = lerp(2.7, 0.82, k);
      } else if (t <= 0.86) {
        const k = clamp01((t - 0.12) / 0.74);
        bx = lerp(-6.5, 6.4, k);
        by = 0.82;
      } else {
        const k = easeInOutQuad(clamp01((t - 0.86) / 0.14));
        bx = lerp(6.4, 8.6, k);
        by = lerp(0.82, 1.65, Math.sin(k * Math.PI * 0.5)) - k * 0.9;
        rotZ = lerp(0, -0.35, k);
      }

      bottle.group.visible = t < 0.98;
      bottle.group.position.set(bx, by, 0);
      bottle.group.rotation.set(0, t * 0.8, rotZ);

      // Kekeruhan 0.25 -> 0 saat melewati lorong cuci [0.56..0.86]
      const washK = smoothstep(0.56, 0.86, t);
      const turbid = lerp(0.25, 0, washK);
      const dirt = lerp(0.35, 0, washK);
      bottle.setParams({
        turbid,
        dirt,
        crack: 0,
        breakAmt: 0,
        opacity: 1,
        level: 0,
      });

      // Sorot rim berdenyut di t=0.22..0.38 dan c8->c9 di 0.90..1.00
      const highlightPulse = Math.sin(clamp01((t - 0.2) / 0.18) * Math.PI) * 0.9;
      const cueMix = smoothstep(0.9, 1.0, t);
      ctx.lights.rim.intensity = lerp(CUES.c8.rim + highlightPulse, CUES.c9.rim, cueMix);
      ctx.lights.rim.color.lerpColors(C8_ACCENT, C9_ACCENT, cueMix);
      ctx.scene.environmentIntensity = lerp(CUES.c8.env, CUES.c9.env, cueMix);

      const camX = -5 + 10 * clamp01(t);
      ctx.applyResponsiveCamera(35);
      ctx.camera.position.set(camX, 1.5, 6.2);
      LOOK_AT.set(camX + 0.5, 0.9, 0);
      ctx.camera.lookAt(LOOK_AT);
    },

    exit() {
      if (conveyor) conveyor.group.visible = false;
    },

    dispose() {
      conveyor?.dispose();
      conveyor = null;
      ctx = null;
    },
  };
}
