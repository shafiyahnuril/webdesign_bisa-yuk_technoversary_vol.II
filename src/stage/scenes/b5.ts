import * as THREE from "three";
import { CUES, PALETTE } from "@/lib/tokens";
import type { Scene } from "../director";
import { ensureParticles, type Particles } from "../objects/particles";
import { ensureWaterSystem, type WaterSystem } from "../objects/water";
import type { StageContext } from "../stage";
import { clamp01, degToRad, easeHeavyIn, lerp, smoothstep } from "../util/math";

const C5_BG = new THREE.Color(PALETTE.c5.bg);
const C6_BG = new THREE.Color(PALETTE.c6.bg);
const C5_ACCENT = new THREE.Color(PALETTE.c5.accent);
const C6_ACCENT = new THREE.Color(PALETTE.c6.accent);
const KEY_COLOR = new THREE.Color("#EAF4FF");
const FILL_SKY = new THREE.Color("#8098C2");
const FILL_GROUND = new THREE.Color("#0A1226");

/**
 * Scene B5 ("Terurai"): air malam tenang (mode 2), tanpa matahari, kamera mengorbit 40° (20° portrait),
 * retak tumbuh (0..0.35), tahan napas (0.35..0.50), botol pecah + partikel mikroplastik keluar (0.50..0.80),
 * lalu partikel menyebar dan kamera turun ke bawah air (0.80..1.00).
 */
export function createB5Scene(): Scene {
  let ctx: StageContext | null = null;
  let water: WaterSystem | null = null;
  let particles: Particles | null = null;

  const fog = new THREE.FogExp2(PALETTE.c5.bg, CUES.c5.fog);
  const lookAt = new THREE.Vector3();

  return {
    id: "b5",

    build(stageCtx: StageContext) {
      ctx = stageCtx;
      water = ensureWaterSystem(stageCtx);
      particles = ensureParticles(stageCtx);
    },

    enter() {
      if (!ctx || !water || !particles) return;
      const hand = ctx.shared.get("hand");
      if (hand) hand.group.visible = false;
      const flash = ctx.shared.get("flash") as
        { setActive?: (active: boolean) => void } | undefined;
      flash?.setActive?.(false);

      ctx.shared.bottle.detach();
      ctx.shared.bottle.setIdle(0, false);
      ctx.shared.contactShadow.setVisible(false);

      water.group.visible = true;
      water.group.position.set(0, -0.35, 0);
      water.setMode("night");

      particles.group.visible = false;
      particles.group.position.set(0, 0.05, 0);

      ctx.lights.key.color.copy(KEY_COLOR);
      ctx.lights.rim.position.set(4.5, 3.5, -4);
      ctx.lights.fill.color.copy(FILL_SKY);
      ctx.lights.fill.groundColor.copy(FILL_GROUND);
      ctx.lights.spot.intensity = 0;
      ctx.scene.fog = fog;
    },

    update(t: number) {
      if (!ctx || !water || !particles) return;
      const uTime = ctx.reducedMotion ? 0 : ctx.uniforms.uTime.value;
      const { bottle, contactShadow } = ctx.shared;
      const hand = ctx.shared.get("hand");
      if (hand) hand.group.visible = false;
      contactShadow.setVisible(false);

      // Orbit kamera: radius 4, 0 -> 40° (20° portrait) lalu turun ke bawah permukaan air pada 0.80..1.00
      const maxDeg = ctx.size.isPortrait ? 20 : 40;
      const theta = lerp(0, degToRad(maxDeg), clamp01(t / 0.85));
      const dipK = smoothstep(0.8, 1.0, t);
      const camX = 4.0 * Math.sin(theta);
      const camZ = 4.0 * Math.cos(theta);
      const camY = lerp(1.2, -0.6, dipK);

      ctx.applyResponsiveCamera(35);
      ctx.camera.position.set(camX, camY, camZ);
      lookAt.set(0, lerp(1.0, 0.35, dipK), 0);
      ctx.camera.lookAt(lookAt);

      // Air malam tenang (amplitudo 0.18) di y = -0.35
      const waveTime = uTime + t * 3.5;
      water.group.visible = true;
      water.group.position.set(0, -0.35, 0);
      water.setMode("night");
      const underwater = smoothstep(-0.2, -0.5, camY);

      const cueMix = smoothstep(0.7, 1.0, t);
      fog.color.lerpColors(C5_BG, C6_BG, cueMix);
      fog.density = lerp(CUES.c5.fog, 0.05, dipK);
      ctx.scene.fog = fog;

      water.setParams({
        time: waveTime,
        amplitude: 0.18,
        speed: 0.85,
        turbid: 0.55,
        underwater,
        opacity: 1 - dipK * 0.45,
        sunIntensity: 0,
        fogColor: fog.color,
        fogDensity: fog.density,
      });

      // Fase retak -> tahan -> pecah -> sebar
      const crack = smoothstep(0.0, 0.35, t);
      const holdPulse = t > 0.35 && t < 0.5 ? Math.sin(((t - 0.35) / 0.15) * Math.PI) * 0.35 : 0;

      let breakAmt = 0;
      if (t >= 0.5) {
        const bNorm = clamp01((t - 0.5) / 0.3);
        // Cepat meledak (ease-heavy-in) lalu melambat seperti gerak lambat
        breakAmt = lerp(easeHeavyIn(bNorm), smoothstep(0.5, 0.8, t), 0.55);
      }
      const bottleOpacity = 1 - smoothstep(0.8, 1.0, t) * 0.85;

      // Getar mikro ±0.01 saat retak tumbuh (dimatikan pada reducedMotion)
      const vibAmp =
        !ctx.reducedMotion && t < 0.36 ? 0.01 * crack * (1 - smoothstep(0.32, 0.36, t)) : 0;
      const vibX = Math.sin(t * 95 + uTime * 28) * vibAmp;
      const vibZ = Math.cos(t * 83 + uTime * 24) * vibAmp;

      bottle.group.visible = bottleOpacity > 0.002;
      bottle.group.position.set(vibX, 0.05, vibZ);
      bottle.group.rotation.set(0, t * 0.25, 0);
      bottle.setParams({
        turbid: lerp(CUES.c5.turbid, CUES.c6.turbid, cueMix),
        crack,
        breakAmt,
        level: 0.03,
        dirt: 0.35,
        opacity: bottleOpacity,
      });

      // Partikel mikroplastik muncul saat botol pecah (t >= 0.50)
      const pBreak = smoothstep(0.5, 0.8, t) * 0.72 + smoothstep(0.8, 1.0, t) * 0.28;
      const pFade = smoothstep(0.49, 0.55, t);
      particles.group.visible = pFade > 0.002;
      particles.group.position.set(0, 0.05, 0);
      particles.setParams({
        breakAmt: pBreak,
        flow: 0,
        settle: 0,
        time: uTime + t * 5.0,
        fade: pFade,
        sizeScale: Math.min(ctx.size.dpr, 2),
      });

      // Pencahayaan rim #8098C2 intensitas 1.6 + denyut di fase tahan
      ctx.lights.key.intensity = lerp(1.8, 1.4, dipK);
      ctx.lights.fill.intensity = lerp(0.28, 0.22, dipK);
      ctx.lights.rim.color.lerpColors(C5_ACCENT, C6_ACCENT, cueMix);
      ctx.lights.rim.intensity = lerp(CUES.c5.rim, CUES.c6.rim, cueMix) + holdPulse;
      ctx.lights.spot.intensity = 0;
      ctx.scene.environmentIntensity = lerp(CUES.c5.env, CUES.c6.env, cueMix);
    },

    exit() {
      if (water) {
        water.setParams({ underwater: 0 });
        water.group.visible = false;
      }
      if (particles) {
        particles.group.visible = false;
      }
      if (ctx) {
        ctx.scene.fog = null;
      }
    },

    dispose() {
      // B5 hanya menggunakan objek bersama (bottle, water, particles).
      water = null;
      particles = null;
      ctx = null;
    },
  };
}
