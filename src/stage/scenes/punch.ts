import * as THREE from "three";
import { CUES, PALETTE } from "@/lib/tokens";
import type { Scene } from "../director";
import { ensureParticles, type Particles } from "../objects/particles";
import type { StageContext } from "../stage";
import { clamp01, easeOutExpo, lerp, smoothstep } from "../util/math";

const CP_ACCENT = new THREE.Color(PALETTE.cp1.accent);
const C7_ACCENT = new THREE.Color(PALETTE.c7.accent);
const KEY_COLOR = new THREE.Color("#EAF4FF");
const FILL_SKY = new THREE.Color("#8A96C8");
const FILL_GROUND = new THREE.Color("#05080F");

/**
 * Scene Punchline ("Layar Hening"):
 * t 0..0.08 sisa adegan B6 memudar + lampu turun ke ~8%;
 * t 0.08..0.40 REWIND partikel kembali ke seed botol & serpihan/retak/keruh pulih utuh;
 * t 0.48..0.90 tahan hening dengan botol hantu opacity 0.15;
 * t 0.90..1.00 transisi tenang menuju Bab 7.
 */
export function createPunchScene(): Scene {
  let ctx: StageContext | null = null;
  let particles: Particles | null = null;

  const lookAt = new THREE.Vector3(0, 1.05, 0);

  return {
    id: "punch",

    build(stageCtx: StageContext) {
      ctx = stageCtx;
      particles = ensureParticles(stageCtx);
    },

    enter() {
      if (!ctx || !particles) return;
      const water = ctx.shared.get("water");
      if (water) water.group.visible = false;
      const hand = ctx.shared.get("hand");
      if (hand) hand.group.visible = false;
      const flash = ctx.shared.get("flash") as
        { setActive?: (active: boolean) => void } | undefined;
      flash?.setActive?.(false);

      ctx.shared.bottle.detach();
      ctx.shared.bottle.setIdle(0, false);
      ctx.shared.contactShadow.setVisible(false);

      ctx.lights.key.color.copy(KEY_COLOR);
      ctx.lights.fill.color.copy(FILL_SKY);
      ctx.lights.fill.groundColor.copy(FILL_GROUND);
      ctx.lights.spot.intensity = 0;
      ctx.scene.fog = null;
    },

    update(t: number) {
      if (!ctx || !particles) return;
      const uTime = ctx.reducedMotion ? 0 : ctx.uniforms.uTime.value;
      const { bottle, contactShadow } = ctx.shared;
      const water = ctx.shared.get("water");
      if (water) water.group.visible = false;
      const hand = ctx.shared.get("hand");
      if (hand) hand.group.visible = false;
      contactShadow.setVisible(false);
      ctx.scene.fog = null;

      // Kamera tenang menghadap tengah botol
      const camZ = lerp(5.8, 6.8, smoothstep(0.08, 0.45, t));
      ctx.applyResponsiveCamera(35);
      ctx.camera.position.set(0, 1.05, camZ);
      lookAt.set(0, 1.05, 0);
      ctx.camera.lookAt(lookAt);

      // Pencahayaan redup ke ~8% di awal, lalu naik pelan menuju rim tipis & persiapan c7
      const recover = smoothstep(0.15, 0.55, t);
      const exitToB7 = smoothstep(0.9, 1.0, t);
      ctx.lights.key.intensity = lerp(0.18, 0.42, recover) + exitToB7 * 0.45;
      ctx.lights.fill.intensity = lerp(0.04, 0.14, recover) + exitToB7 * 0.15;
      ctx.lights.rim.color.lerpColors(CP_ACCENT, C7_ACCENT, exitToB7);
      ctx.lights.rim.intensity = lerp(0.24, 0.65, recover) + exitToB7 * 0.8;
      ctx.lights.spot.intensity = 0;
      ctx.scene.environmentIntensity = lerp(CUES.cp1.env, CUES.c7.env, exitToB7);

      if (t <= 0.08) {
        // Fase 0..0.08: sisa partikel melepaskan formasi piring dan siap ditarik mundur
        const preK = clamp01(t / 0.08);
        particles.group.visible = true;
        particles.group.position.set(0, 0, 0);
        particles.setParams({
          breakAmt: 1,
          flow: 0,
          settle: 1 - smoothstep(0, 0.08, t),
          time: uTime * 0.5,
          fade: lerp(0.35, 0.88, preK),
          sizeScale: Math.min(ctx.size.dpr, 2),
        });

        bottle.group.visible = false;
        bottle.group.position.set(0, 0, 0);
        bottle.group.rotation.set(0, 0, 0);
        bottle.setParams({
          breakAmt: 1,
          crack: 1,
          turbid: 0.9,
          dirt: 0.3,
          level: 0.03,
          opacity: 0,
        });
        return;
      }

      if (t <= 0.4) {
        // Fase 0.08..0.40: REWIND ease-out kembali ke botol utuh bening
        const rew = easeOutExpo(clamp01((t - 0.08) / 0.32));
        const pBreak = 1 - rew;
        const pFade = 1 - smoothstep(0.31, 0.4, t);

        particles.group.visible = pFade > 0.002;
        particles.group.position.set(0, 0, 0);
        particles.setParams({
          breakAmt: pBreak,
          flow: 0,
          settle: 0,
          time: uTime * 0.35,
          fade: pFade,
          sizeScale: Math.min(ctx.size.dpr, 2),
        });

        bottle.group.visible = true;
        bottle.group.position.set(0, 0, 0);
        bottle.group.rotation.set(0, lerp(0.5, 0, rew), 0);
        bottle.setParams({
          breakAmt: 1 - rew,
          crack: 1 - rew,
          turbid: lerp(0.9, 0, rew),
          dirt: lerp(0.3, 0, rew),
          level: lerp(0.03, 0.85, smoothstep(0.24, 0.4, t)),
          opacity: lerp(0.12, 0.65, rew),
        });
        return;
      }

      // Fase 0.40..1.00: partikel sudah menyatu hilang; botol utuh bening memudar ke hantu (opacity 0.15)
      particles.group.visible = false;
      particles.group.position.set(0, 0, 0);
      particles.setParams({ breakAmt: 0, flow: 0, settle: 0, fade: 0 });

      const ghostFade = smoothstep(0.45, 0.56, t);
      const endFade = smoothstep(0.9, 1.0, t);
      const opacity = lerp(lerp(0.65, 0.15, ghostFade), 0.05, endFade);

      bottle.group.visible = opacity > 0.002;
      bottle.group.position.set(0, 0, 0);
      bottle.group.rotation.set(0, 0, 0);
      bottle.setParams({
        breakAmt: 0,
        crack: 0,
        turbid: 0,
        dirt: 0,
        level: 0.85,
        opacity,
      });
    },

    exit() {
      if (particles) {
        particles.group.visible = false;
      }
    },

    dispose() {
      // Punchline hanya memakai objek bersama (bottle, particles).
      particles = null;
      ctx = null;
    },
  };
}
