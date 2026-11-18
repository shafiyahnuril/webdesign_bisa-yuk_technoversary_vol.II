import * as THREE from "three";
import { CUES, PALETTE } from "@/lib/tokens";
import type { Scene } from "../director";
import { CityEnvironment } from "../objects/city";
import { ensureWaterSystem, type WaterSystem } from "../objects/water";
import type { StageContext } from "../stage";
import { BuoyancyController } from "../util/buoyancy";
import { clamp01, degToRad, easeHeavyIn, lerp, smoothstep } from "../util/math";

const C3_BG = new THREE.Color(PALETTE.c3.bg);
const C4_BG = new THREE.Color(PALETTE.c4.bg);
const C3_ACCENT = new THREE.Color(PALETTE.c3.accent);
const C4_ACCENT = new THREE.Color(PALETTE.c4.accent);
const KEY_COLOR = new THREE.Color("#EAF4FF");
const FILL_SKY = new THREE.Color("#8FB0CC");
const FILL_GROUND = new THREE.Color("#0A1226");

/**
 * Scene B3 ("Tersesat"): botol jatuh ke sungai perkotaan, menyusuri tanggul,
 * melewati kolong jembatan (gelap sesaat t~0.49), lalu melebar ke muara.
 */
export function createB3Scene(): Scene {
  let ctx: StageContext | null = null;
  let water: WaterSystem | null = null;
  let city: CityEnvironment | null = null;

  const fog = new THREE.FogExp2(PALETTE.c3.bg, CUES.c3.fog);
  const lookAt = new THREE.Vector3();
  const waveNormal = new THREE.Vector3();
  const keyframeEuler = new THREE.Euler();
  const baseEuler = new THREE.Euler();
  const keyframeQuat = new THREE.Quaternion();
  const baseQuat = new THREE.Quaternion();
  const buoyancy = new BuoyancyController();

  return {
    id: "b3",

    build(stageCtx: StageContext) {
      ctx = stageCtx;
      water = ensureWaterSystem(stageCtx);
      city = new CityEnvironment(stageCtx.scene, stageCtx.qualityConfig, stageCtx.size.isPortrait);
      city.group.visible = false;
    },

    enter() {
      if (!ctx || !water || !city) return;
      buoyancy.reset();
      const hand = ctx.shared.get("hand");
      if (hand) hand.group.visible = false;
      const particles = ctx.shared.get("particles");
      if (particles) particles.group.visible = false;
      const flash = ctx.shared.get("flash") as
        { setActive?: (active: boolean) => void } | undefined;
      flash?.setActive?.(false);

      city.group.visible = true;
      water.group.visible = true;
      water.group.position.set(0, 0, 0);
      water.setMode("river");

      ctx.shared.contactShadow.setVisible(false);
      ctx.shared.bottle.detach();
      ctx.shared.bottle.setIdle(0, false);

      ctx.lights.key.color.copy(KEY_COLOR);
      ctx.lights.fill.color.copy(FILL_SKY);
      ctx.lights.fill.groundColor.copy(FILL_GROUND);
      ctx.lights.spot.intensity = 0;
      ctx.scene.fog = fog;
    },

    update(t: number, _p?: number, dt = 0) {
      if (!ctx || !water || !city) return;
      const uTime = ctx.reducedMotion ? 0 : ctx.uniforms.uTime.value;
      const waveTime = ctx.reducedMotion ? 0 : uTime * 0.65;
      const { bottle, contactShadow } = ctx.shared;
      const hand = ctx.shared.get("hand");
      if (hand) hand.group.visible = false;
      const particles = ctx.shared.get("particles");
      if (particles) particles.group.visible = false;
      contactShadow.setVisible(false);

      // Kamera bergerak sejajar sungai ke kanan: (-6 + 12*t, 0.45, 5.2)
      const camX = -6 + 12 * t;
      ctx.applyResponsiveCamera(35);
      ctx.camera.position.set(camX, 0.45, 5.2);
      lookAt.set(camX + 1.0, 0.6, -2.0);
      ctx.camera.lookAt(lookAt);

      // Transisi muara t 0.72 -> 1.00: sungai (mode 0) melebar ke laut (mode 1)
      const estuaryMix = smoothstep(0.72, 1.0, t);
      water.group.visible = true;
      water.group.position.set(camX * estuaryMix * 0.4, 0, 0);
      water.blendMode("river", "sea", estuaryMix);

      const riverTurbid = clamp01(t / 0.4);
      const waveAmp = lerp(0.04, 0.12, estuaryMix);
      const fogDensity =
        t <= 0.72 ? lerp(0.02, 0.06, clamp01(t / 0.72)) : lerp(0.06, CUES.c4.fog, estuaryMix);

      fog.color.lerpColors(C3_BG, C4_BG, estuaryMix);
      fog.density = fogDensity;
      ctx.scene.fog = fog;

      water.setParams({
        time: waveTime,
        amplitude: waveAmp,
        speed: 1.0,
        turbid: riverTurbid,
        underwater: 0,
        opacity: 1,
        sunIntensity: 0.15,
        fogColor: fog.color,
        fogDensity: fog.density,
      });

      // Kolong jembatan t 0.44..0.54 -> lampu meredup ke 0.4x di puncak t = 0.49
      const underpassProgress = clamp01((t - 0.44) / 0.1);
      const underpassBell = t >= 0.44 && t <= 0.54 ? Math.sin(underpassProgress * Math.PI) : 0;
      const lightScale = lerp(1.0, 0.4, underpassBell);

      const cueMix = smoothstep(0.7, 1.0, t);
      ctx.lights.key.intensity = 2.2 * lightScale;
      ctx.lights.fill.intensity = 0.35 * lightScale;
      ctx.lights.rim.color.lerpColors(C3_ACCENT, C4_ACCENT, cueMix);
      ctx.lights.rim.intensity = lerp(CUES.c3.rim, CUES.c4.rim, cueMix) * lightScale;
      ctx.lights.spot.intensity = 0;
      ctx.scene.environmentIntensity = lerp(CUES.c3.env, CUES.c4.env, cueMix) * lightScale;

      // Botol: jatuh t 0..0.10, transisi mulus ke apung teredam (normal disampling sekali sesudah setParams)
      const bottleX = -4.92 + 10.9 * t;
      const bottleZ = lerp(0.45, 0.15, estuaryMix);
      const waveSample = water.sampleHeightAndNormal(bottleX, bottleZ, waveNormal);

      const dropK = easeHeavyIn(clamp01(t / 0.1));
      const keyframeY = lerp(2.8, waveSample.y - 0.12, dropK);
      keyframeEuler.set(0, t * 1.4, lerp(0.45, 1.32, dropK));
      keyframeQuat.setFromEuler(keyframeEuler);

      baseEuler.set(0, t * 1.4, 1.32);
      baseQuat.setFromEuler(baseEuler);

      const pose = buoyancy.step({
        t,
        dt,
        x: bottleX,
        z: bottleZ,
        waterY: waveSample.y,
        waterNormal: waveNormal,
        baseQuat,
        draft: 0.12,
        maxSubmerge: 0.16,
        maxTiltRad: degToRad(5.0),
        keyframeBlend: smoothstep(0.06, 0.14, t),
        keyframeY,
        keyframeQuat,
      });

      bottle.group.visible = true;
      bottle.group.position.set(bottleX, pose.y, bottleZ);
      bottle.group.quaternion.copy(pose.quat);

      const bottleTurbid =
        t <= 0.72
          ? lerp(0.1, CUES.c3.turbid, clamp01(t / 0.72))
          : lerp(CUES.c3.turbid, CUES.c4.turbid, estuaryMix);
      bottle.setParams({
        turbid: bottleTurbid,
        crack: 0,
        breakAmt: 0,
        level: 0.03,
        dirt: lerp(0.05, 0.3, clamp01(t / 0.7)),
        opacity: 1,
      });

      city.setCompactMode(ctx.size.isPortrait || ctx.quality === "low");
      city.update(t, camX, estuaryMix, water, waveTime);
    },

    exit() {
      buoyancy.reset();
      if (city) city.group.visible = false;
      if (water) water.group.visible = false;
      if (ctx) {
        ctx.scene.fog = null;
      }
    },

    dispose() {
      // Hanya bebaskan objek lokal B3; water/bottle/contactShadow milik bersama Stage.
      city?.dispose();
      city = null;
      water = null;
      ctx = null;
    },
  };
}
