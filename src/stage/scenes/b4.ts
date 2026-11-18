import * as THREE from "three";
import { CUES, PALETTE } from "@/lib/tokens";
import type { Scene } from "../director";
import { CoralReef } from "../objects/coral";
import { createPier } from "../objects/pier";
import { ensureWaterSystem, type WaterSystem } from "../objects/water";
import type { StageContext } from "../stage";
import { disposeObject } from "../util/dispose";
import { BuoyancyController } from "../util/buoyancy";
import { clamp01, degToRad, easeInOutQuad, lerp, smoothstep } from "../util/math";

const C4_BG = new THREE.Color(PALETTE.c4.bg);
const C5_BG = new THREE.Color(PALETTE.c5.bg);
const C4_ACCENT = new THREE.Color(PALETTE.c4.accent);
const C5_ACCENT = new THREE.Color(PALETTE.c5.accent);
const KEY_COLOR = new THREE.Color("#F4F2E9");
const FILL_SKY = new THREE.Color("#9DBCBF");
const FILL_GROUND = new THREE.Color("#163D39");
const UNDERWATER_FOG = new THREE.Color("#173B43");

function createColdSun(parent: THREE.Object3D): {
  sunMesh: THREE.Mesh;
  haloMesh: THREE.Mesh;
  haloMat: THREE.MeshBasicMaterial;
  sunMat: THREE.MeshBasicMaterial;
} {
  const sunGeom = new THREE.CircleGeometry(0.85, 48);
  const sunMat = new THREE.MeshBasicMaterial({
    color: "#F4FAFF",
    transparent: true,
    opacity: 0.92,
    fog: false,
    depthWrite: false,
  });
  const sunMesh = new THREE.Mesh(sunGeom, sunMat);
  sunMesh.name = "O-SUN";
  sunMesh.position.set(8, 6, -30);

  const haloCanvas = document.createElement("canvas");
  haloCanvas.width = haloCanvas.height = 128;
  const haloContext = haloCanvas.getContext("2d");
  if (haloContext) {
    const glow = haloContext.createRadialGradient(64, 64, 0, 64, 64, 64);
    glow.addColorStop(0, "rgba(244,250,255,0.7)");
    glow.addColorStop(0.3, "rgba(244,250,255,0.18)");
    glow.addColorStop(1, "rgba(244,250,255,0)");
    haloContext.fillStyle = glow;
    haloContext.fillRect(0, 0, 128, 128);
  }
  const haloTexture = haloContext ? new THREE.CanvasTexture(haloCanvas) : null;
  if (haloTexture) haloTexture.colorSpace = THREE.SRGBColorSpace;
  const haloGeom = new THREE.CircleGeometry(3.0, 48);
  const haloMat = new THREE.MeshBasicMaterial({
    color: "#F4FAFF",
    map: haloTexture,
    transparent: true,
    opacity: 0.16,
    fog: false,
    depthWrite: false,
  });
  const haloMesh = new THREE.Mesh(haloGeom, haloMat);
  haloMesh.name = "O-SUN-HALO";
  haloMesh.position.set(0, 0, -0.05);
  sunMesh.add(haloMesh);

  parent.add(sunMesh);
  return { sunMesh, haloMesh, haloMat, sunMat };
}

/**
 * Scene B4 ("Lautan"): laut terbuka 3 gelombang Gerstner yang makin besar,
 * matahari putih dingin, dermaga dengan kenaikan air 0.3, penyelaman kamera tanpa pop,
 * dan pemutihan bertahap dari pigmen alami menjadi kerangka kapur.
 */
export function createB4Scene(): Scene {
  let ctx: StageContext | null = null;
  let water: WaterSystem | null = null;
  let localGroup: THREE.Group | null = null;
  let sun: ReturnType<typeof createColdSun> | null = null;
  let pier: THREE.Group | null = null;
  let coral: CoralReef | null = null;

  const fog = new THREE.FogExp2(PALETTE.c4.bg, CUES.c4.fog);
  const lookAt = new THREE.Vector3();
  const waveNormal = new THREE.Vector3();
  const baseEuler = new THREE.Euler();
  const baseQuat = new THREE.Quaternion();
  const sunDir = new THREE.Vector3(8, 6, -30).normalize();
  const buoyancy = new BuoyancyController();

  return {
    id: "b4",

    build(stageCtx: StageContext) {
      ctx = stageCtx;
      water = ensureWaterSystem(stageCtx);
      localGroup = new THREE.Group();
      localGroup.name = "B4-LOCAL-PROPS";
      stageCtx.scene.add(localGroup);

      const clusterCount =
        stageCtx.qualityConfig.tier === "low" || stageCtx.size.isPortrait ? 8 : 18;
      sun = createColdSun(localGroup);
      pier = createPier(localGroup);
      coral = new CoralReef(localGroup, clusterCount === 8);
      localGroup.visible = false;
    },

    enter() {
      if (!ctx || !water || !localGroup) return;
      buoyancy.reset();
      const hand = ctx.shared.get("hand");
      if (hand) hand.group.visible = false;
      const particles = ctx.shared.get("particles");
      if (particles) particles.group.visible = false;
      const flash = ctx.shared.get("flash") as
        { setActive?: (active: boolean) => void } | undefined;
      flash?.setActive?.(false);

      localGroup.visible = true;
      water.group.visible = true;
      water.group.position.set(0, 0, 0);
      water.setMode("sea");

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
      if (!ctx || !water || !localGroup || !sun || !pier || !coral) return;
      const uTime = ctx.reducedMotion ? 0 : ctx.uniforms.uTime.value;
      const waveTime = ctx.reducedMotion ? 0 : uTime * 0.65;
      const { bottle, contactShadow } = ctx.shared;
      const hand = ctx.shared.get("hand");
      if (hand) hand.group.visible = false;
      const particles = ctx.shared.get("particles");
      if (particles) particles.group.visible = false;
      contactShadow.setVisible(false);
      localGroup.visible = true;

      const compact = ctx.qualityConfig.tier === "low" || ctx.size.isPortrait;
      coral.setCompact(compact);

      // Gelombang laut: amplitudo 0.12 -> 0.50 pada t 0.12..0.48, kecepatan konstan tenang agar fase tidak meloncat saat gulir
      const stormUp = smoothstep(0.12, 0.48, t);
      const calmDive = smoothstep(0.65, 1.0, t);
      const amplitude = lerp(lerp(0.12, 0.5, stormUp), 0.24, calmDive * 0.5);
      const speed = 1.05;

      // Kamera menyelam: y 1.2 -> -1.4 pada t 0.48..0.78; ambient sway hanya berbasis waktu lambat
      const diveK = easeInOutQuad(clamp01((t - 0.48) / 0.3));
      const deepK = smoothstep(0.78, 1.0, t);
      const sway = ctx.reducedMotion ? 0 : Math.sin(uTime * 0.45) * 0.008;
      const camX = sway + lerp(0, -0.15, deepK);
      const camY = lerp(1.2, -1.4, diveK) - deepK * 0.2;
      const camZ = lerp(6.0, 5.2, diveK) - deepK * 0.6;

      // Arah pandang: di atas air (0.9) -> menengok ke atas ke siluet botol di permukaan -> turun ke karang
      let lookY = 0.9;
      if (t > 0.48 && t <= 0.65) {
        const upPhase = smoothstep(0.48, 0.62, t);
        lookY = lerp(0.9, 0.25, upPhase);
      } else if (t > 0.65 && t <= 0.78) {
        const downPhase = smoothstep(0.65, 0.78, t);
        lookY = lerp(0.25, -2.35, downPhase);
      } else if (t > 0.78) {
        const reefView = lerp(-2.35, -2.9, smoothstep(0.78, 0.9, t));
        lookY = lerp(reefView, -1.2, smoothstep(0.95, 1, t));
      }

      ctx.applyResponsiveCamera(35);
      ctx.camera.position.set(camX, camY, camZ);
      lookAt.set(0, lookY, 0);
      ctx.camera.lookAt(lookAt);

      // Perbarui uniform gelombang terlebih dahulu sebelum sampling ketinggian & normal di CPU
      water.group.visible = true;
      water.group.position.set(0, 0, 0);
      water.setMode("sea");
      water.setParams({
        time: waveTime,
        amplitude,
        speed,
        turbid: 0.18,
        opacity: 1,
        sunDir,
      });

      const surfaceAtCam = water.sampleHeightAndNormal(camX, camZ).y;
      const underwater = smoothstep(surfaceAtCam + 0.18, surfaceAtCam - 0.18, camY);

      // Redup lembut ~0.15s di tepat batas menembus air + peralihan ke c5
      const crossWidth = 0.22;
      const crossDip = Math.exp(-Math.pow((camY - surfaceAtCam) / crossWidth, 2));
      const cueMix = smoothstep(0.7, 1.0, t);

      fog.color
        .copy(C4_BG)
        .lerp(UNDERWATER_FOG, underwater * 0.7)
        .lerp(C5_BG, cueMix);
      fog.density = lerp(CUES.c4.fog, 0.042, underwater);
      fog.density = lerp(fog.density, CUES.c5.fog + 0.015, cueMix);
      ctx.scene.fog = fog;

      water.setParams({
        underwater,
        sunIntensity: lerp(0.45, 0.9, stormUp) * (1 - underwater * 0.75),
        fogColor: fog.color,
        fogDensity: fog.density,
      });

      // Cahaya (selalu dingin, makin gelap di bawah air & akhir bab)
      const lightDamp = (1 - crossDip * 0.28) * (1 - underwater * 0.35);
      ctx.lights.key.intensity = 2.2 * lightDamp;
      ctx.lights.fill.intensity = lerp(0.35, 0.24, underwater);
      ctx.lights.rim.color.lerpColors(C4_ACCENT, C5_ACCENT, cueMix);
      ctx.lights.rim.intensity = lerp(CUES.c4.rim, CUES.c5.rim, cueMix) * lightDamp;
      ctx.lights.spot.intensity = 0;
      ctx.scene.environmentIntensity =
        lerp(CUES.c4.env, CUES.c5.env, cueMix) * (1 - underwater * 0.25);

      // Matahari putih dingin (#F4FAFF)
      sun.sunMesh.visible = underwater < 0.92;
      sun.sunMat.opacity = 0.92 * (1 - underwater);
      sun.haloMat.opacity = lerp(0.16, 0.42, clamp01(t / 0.48)) * (1 - underwater);

      // Dermaga: 4 tiang kanan, garis air naik 0.3 unit (tiang turun relatif 0.3)
      const pierRise = smoothstep(0.12, 0.48, t);
      pier.position.set(0, -0.3 * pierRise, 0);
      pier.visible = true;

      // Terumbu karang dibiarkan tetap berwarna alami hingga akhir adegan.
      coral.group.visible = t >= 0.35;
      coral.setBleach(0);

      // Botol mengapung dengan buoyancy teredam mengikuti ketinggian + normal ombak (±5° dari base)
      const bottleX = -0.35 + Math.sin(t * Math.PI) * 0.25;
      const bottleZ = 0.15;
      const waveSample = water.sampleHeightAndNormal(bottleX, bottleZ, waveNormal);

      baseEuler.set(0, t * 1.1, 1.38);
      baseQuat.setFromEuler(baseEuler);
      const pose = buoyancy.step({
        t,
        dt,
        x: bottleX,
        z: bottleZ,
        waterY: waveSample.y,
        waterNormal: waveNormal,
        baseQuat,
        draft: 0.1,
        maxSubmerge: 0.14,
        maxTiltRad: degToRad(5.0),
      });

      bottle.group.visible = true;
      bottle.group.position.set(bottleX, pose.y, bottleZ);
      bottle.group.quaternion.copy(pose.quat);

      bottle.setParams({
        turbid: lerp(CUES.c4.turbid, CUES.c5.turbid, cueMix),
        crack: 0,
        breakAmt: 0,
        level: 0.03,
        dirt: 0.3,
        opacity: 1,
      });
    },

    exit() {
      buoyancy.reset();
      if (localGroup) localGroup.visible = false;
      if (water) {
        water.setParams({ underwater: 0 });
        water.group.visible = false;
      }
      if (ctx) {
        ctx.scene.fog = null;
      }
    },

    dispose() {
      if (localGroup) {
        localGroup.removeFromParent();
        disposeObject(localGroup);
        localGroup = null;
      }
      sun = null;
      pier = null;
      coral = null;
      water = null;
      ctx = null;
    },
  };
}
