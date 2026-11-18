import * as THREE from "three";
import { CUES, PALETTE } from "@/lib/tokens";
import type { Scene } from "../director";
import { FishSchool } from "../objects/fish";
import { ensureParticles, type Particles } from "../objects/particles";
import { PlateSet } from "../objects/plate";
import type { StageContext } from "../stage";
import { clamp01, easeInOutQuad, lerp, smoothstep } from "../util/math";

const C6_BG = new THREE.Color(PALETTE.c6.bg);
const CP0_BG = new THREE.Color(PALETTE.cp0.bg);
const C6_ACCENT = new THREE.Color(PALETTE.c6.accent);
const CP0_ACCENT = new THREE.Color(PALETTE.cp0.accent);
const KEY_COLOR = new THREE.Color("#EAF4FF");
const FILL_SKY = new THREE.Color("#8A96C8");
const FILL_GROUND = new THREE.Color("#05080F");

/**
 * Scene B6 ("Kembali ke Kita"):
 * t 0..0.30 partikel mengalir ke 3 ikan, t 0.30..0.45 match-cut ikan -> filet,
 * t 0.45..0.70 kamera naik top-down + piring naik + partikel mengendap di filet (>=50% ruang negatif),
 * t 0.90..1.00 fade out menuju punchline.
 */
export function createB6Scene(): Scene {
  let ctx: StageContext | null = null;
  let particles: Particles | null = null;
  let school: FishSchool | null = null;
  let plate: PlateSet | null = null;

  const fog = new THREE.FogExp2(PALETTE.c6.bg, 0.05);
  const lookAt = new THREE.Vector3();
  const attractTargets: [THREE.Vector3, THREE.Vector3, THREE.Vector3] = [
    new THREE.Vector3(),
    new THREE.Vector3(),
    new THREE.Vector3(),
  ];

  return {
    id: "b6",

    build(stageCtx: StageContext) {
      ctx = stageCtx;
      particles = ensureParticles(stageCtx);
      school = new FishSchool(stageCtx.scene, stageCtx.size.isPortrait);
      plate = new PlateSet(stageCtx.scene);
      school.group.visible = false;
      plate.group.visible = false;
    },

    enter() {
      if (!ctx || !particles || !school || !plate) return;

      // Pastikan seluruh state milik scene sebelumnya bersih saat jump langsung atau mundur
      const water = ctx.shared.get("water");
      if (water) water.group.visible = false;
      const hand = ctx.shared.get("hand");
      if (hand) hand.group.visible = false;
      const flash = ctx.shared.get("flash") as
        { setActive?: (active: boolean) => void } | undefined;
      flash?.setActive?.(false);
      ctx.shared.bottle.detach();
      ctx.shared.bottle.group.visible = false;
      ctx.shared.contactShadow.setVisible(false);

      particles.group.visible = true;
      school.group.visible = true;
      plate.group.visible = false;

      ctx.lights.key.color.copy(KEY_COLOR);
      ctx.lights.fill.color.copy(FILL_SKY);
      ctx.lights.fill.groundColor.copy(FILL_GROUND);
      ctx.lights.spot.intensity = 0;
      ctx.scene.fog = fog;
    },

    update(t: number) {
      if (!ctx || !particles || !school || !plate) return;
      const uTime = ctx.reducedMotion ? 0 : ctx.uniforms.uTime.value;

      // Pastikan air, tangan, & botol bersama tetap tersembunyi di B6
      const water = ctx.shared.get("water");
      if (water) water.group.visible = false;
      const hand = ctx.shared.get("hand");
      if (hand) hand.group.visible = false;
      ctx.shared.bottle.group.visible = false;
      ctx.shared.contactShadow.setVisible(false);

      // Posisi piring plateau: kanan pada desktop (ruang negatif >= 50%), atas-tengah pada portrait
      const plateauX = ctx.size.isPortrait ? 0 : 1.35;
      const plateauZ = ctx.size.isPortrait ? -0.45 : 0;

      // Kamera: bawah air (0, 0.2, 5) -> naik & menunduk top-down (0, 6.5, 0.01) pada t 0.45..0.70
      const riseK = easeInOutQuad(clamp01((t - 0.45) / 0.25));
      const sway = ctx.reducedMotion ? 0 : Math.sin(uTime * 1.4 + t * 8) * 0.01 * (1 - riseK);
      const camX = sway;
      const camY = lerp(0.2, 6.5, riseK);
      const camZ = lerp(5.0, 0.01, riseK);
      const lookY = lerp(0.4, 0.0, riseK);

      ctx.applyResponsiveCamera(35);
      ctx.camera.position.set(camX, camY, camZ);
      lookAt.set(0, lookY, 0);
      ctx.camera.lookAt(lookAt);

      // Ikan & match cut t 0.30..0.45
      const swimTime = uTime + t * 6.0;
      const matchCutAlign = smoothstep(0.3, 0.43, t);
      school.update(swimTime, matchCutAlign);
      school.getAttractTargets(attractTargets);

      const fishOpacity = 1 - smoothstep(0.38, 0.48, t);
      school.setOpacity(fishOpacity);

      // Piring naik dari y -2 -> 0 (t 0.40..0.68) sambil bergeser ke posisi plateau kanan
      const plateRise = easeInOutQuad(clamp01((t - 0.4) / 0.28));
      const plateY = lerp(-2.0, 0.0, plateRise);
      const plateX = lerp(0, plateauX, riseK);
      const plateZ = lerp(0, plateauZ, riseK);
      plate.plateRoot.position.set(plateX, plateY, plateZ);

      const fadeOut = 1 - smoothstep(0.9, 1.0, t);
      const plateFadeIn = smoothstep(0.36, 0.46, t);
      const tableFadeIn = smoothstep(0.45, 0.7, t);
      plate.setOpacity(plateFadeIn * fadeOut);
      plate.setTableOpacity(tableFadeIn * fadeOut);
      plate.setFilletGlow(smoothstep(0.7, 0.9, t));

      // Partikel: t 0..0.30 flow ke mulut 3 ikan -> t 0.45..0.70 mengendap ke atas filet
      const flowAmt = smoothstep(0.0, 0.3, t);
      const settleAmt = smoothstep(0.45, 0.7, t);
      const trackPlate = smoothstep(0.45, 0.62, t);

      particles.group.visible = fadeOut > 0.002;
      particles.group.position.set(
        lerp(0, plateX, trackPlate),
        lerp(0, plateY, settleAmt),
        lerp(0, plateZ, trackPlate),
      );
      particles.setParams({
        breakAmt: 1.0,
        flow: flowAmt,
        settle: settleAmt,
        attract: attractTargets,
        time: uTime * 0.8 + t * 4.0,
        fade: fadeOut,
        sizeScale: Math.min(ctx.size.dpr, 2),
      });

      // Pencahayaan & kabut bawah air pekat (#0A1226, density 0.05 -> menipis top-down -> gelap punchline)
      const endMix = smoothstep(0.7, 1.0, t);
      fog.color.lerpColors(C6_BG, CP0_BG, endMix);
      fog.density = lerp(0.05, 0.015, riseK) * fadeOut;
      ctx.scene.fog = fog;

      ctx.lights.key.position.set(lerp(-4, -5.2, riseK), lerp(6, 4.6, riseK), lerp(5, 3.4, riseK));
      ctx.lights.key.intensity = lerp(1.75, 2.35, riseK) * fadeOut;
      ctx.lights.fill.intensity = lerp(0.24, 0.28, riseK) * fadeOut;
      ctx.lights.rim.color.lerpColors(C6_ACCENT, CP0_ACCENT, endMix);
      ctx.lights.rim.intensity = lerp(CUES.c6.rim, CUES.cp0.rim, endMix) * fadeOut;
      ctx.lights.spot.intensity = 0;
      ctx.scene.environmentIntensity =
        lerp(CUES.c6.env * 0.9, CUES.cp0.env * 1.15, endMix) * fadeOut;
    },

    exit() {
      if (school) school.group.visible = false;
      if (plate) plate.group.visible = false;
      if (particles) {
        particles.group.visible = false;
        particles.group.position.set(0, 0, 0);
      }
      if (ctx) {
        ctx.lights.key.position.set(-4, 6, 5);
        ctx.scene.fog = null;
      }
    },

    dispose() {
      // Hanya bebaskan ikan dan piring lokal; particles/bottle/water milik bersama Stage.
      school?.dispose();
      plate?.dispose();
      school = null;
      plate = null;
      particles = null;
      ctx = null;
    },
  };
}
