import * as THREE from "three";
import { CUES, PALETTE } from "@/lib/tokens";
import type { Scene } from "../director";
import { createClayMaterial } from "../materials/clay";
import { ensureWaterSystem, type WaterSystem } from "../objects/water";
import type { StageContext } from "../stage";
import { disposeObject } from "../util/dispose";
import { clamp01, easeInOutQuad, lerp, smoothstep } from "../util/math";
import { createRng, rngRange } from "../util/rng";

const C4_BG = new THREE.Color(PALETTE.c4.bg);
const C5_BG = new THREE.Color(PALETTE.c5.bg);
const C4_ACCENT = new THREE.Color(PALETTE.c4.accent);
const C5_ACCENT = new THREE.Color(PALETTE.c5.accent);
const CORAL_HEALTHY = new THREE.Color("#5E8FB8");
const CORAL_BLEACHED = new THREE.Color("#E6EAF2");
const KEY_COLOR = new THREE.Color("#EAF4FF");
const FILL_SKY = new THREE.Color("#86A8D0");
const FILL_GROUND = new THREE.Color("#0A1226");

interface CoralRefs {
  group: THREE.Group;
  branchMat: THREE.MeshStandardMaterial;
  sphereMat: THREE.MeshStandardMaterial;
}

function createColdSun(parent: THREE.Object3D): {
  sunMesh: THREE.Mesh;
  haloMesh: THREE.Mesh;
  haloMat: THREE.MeshBasicMaterial;
  sunMat: THREE.MeshBasicMaterial;
} {
  const sunGeom = new THREE.CircleGeometry(2.2, 64);
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

  const haloGeom = new THREE.CircleGeometry(4.4, 48);
  const haloMat = new THREE.MeshBasicMaterial({
    color: "#F4FAFF",
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

function createPier(parent: THREE.Object3D): THREE.Group {
  const pierGroup = new THREE.Group();
  pierGroup.name = "O-PIER";

  const postPositions: readonly [number, number][] = [
    [2.15, -1.2],
    [3.25, -1.2],
    [2.3, -2.5],
    [3.4, -2.5],
  ];

  const postGeom = new THREE.CylinderGeometry(0.12, 0.12, 4.0, 12);
  const postMat = createClayMaterial({ color: "#5C6B7D", roughness: 0.8 });
  const posts = new THREE.InstancedMesh(postGeom, postMat, 4);
  posts.name = "O-PIER-POSTS";

  const tickHeights = [-1.5, -1.0, -0.5, 0.0, 0.5, 1.0, 1.5];
  const tickGeom = new THREE.CylinderGeometry(0.128, 0.128, 0.045, 12);
  const tickMat = createClayMaterial({ color: "#E6EAF2", roughness: 0.7 });
  const ticks = new THREE.InstancedMesh(
    tickGeom,
    tickMat,
    postPositions.length * tickHeights.length,
  );
  ticks.name = "O-PIER-TICKS";

  const mat4 = new THREE.Matrix4();
  const pos = new THREE.Vector3();
  const quat = new THREE.Quaternion();
  const scale = new THREE.Vector3(1, 1, 1);

  let tickIdx = 0;
  for (let i = 0; i < postPositions.length; i++) {
    const [px, pz] = postPositions[i]!;
    pos.set(px, -0.2, pz);
    mat4.compose(pos, quat, scale);
    posts.setMatrixAt(i, mat4);

    for (const ty of tickHeights) {
      pos.set(px, ty, pz);
      mat4.compose(pos, quat, scale);
      ticks.setMatrixAt(tickIdx++, mat4);
    }
  }
  posts.instanceMatrix.needsUpdate = true;
  ticks.instanceMatrix.needsUpdate = true;

  const deckGeom = new THREE.BoxGeometry(1.75, 0.16, 1.85);
  const deckMat = createClayMaterial({ color: "#4D5C6E", roughness: 0.84 });
  const deck = new THREE.Mesh(deckGeom, deckMat);
  deck.position.set(2.78, 1.68, -1.85);

  pierGroup.add(posts, ticks, deck);
  parent.add(pierGroup);
  return pierGroup;
}

function createCoralReef(parent: THREE.Object3D, clusterCount: number): CoralRefs {
  const coralGroup = new THREE.Group();
  coralGroup.name = "O-CORAL";
  coralGroup.userData.clusterCount = clusterCount;

  const rng = createRng(404);

  interface BranchTransform {
    pos: THREE.Vector3;
    quat: THREE.Quaternion;
    scale: THREE.Vector3;
  }
  interface SphereTransform {
    pos: THREE.Vector3;
    scale: number;
  }

  const branchItems: BranchTransform[] = [];
  const sphereItems: SphereTransform[] = [];
  const euler = new THREE.Euler();

  for (let c = 0; c < clusterCount; c++) {
    const cx = lerp(-5.2, 5.2, c / Math.max(1, clusterCount - 1)) + rngRange(rng, -0.45, 0.45);
    const cz = rngRange(rng, -2.6, 2.2);
    const cy = -4.0;

    const branchesInCluster = 5 + Math.floor(rng() * 5);
    for (let b = 0; b < branchesInCluster; b++) {
      const angle = (b / branchesInCluster) * Math.PI * 2 + rngRange(rng, -0.3, 0.3);
      const tilt = rngRange(rng, 0.15, 0.55);
      const height = rngRange(rng, 0.75, 1.9);
      const thickness = rngRange(rng, 0.8, 1.25);

      euler.set(Math.cos(angle) * tilt, angle, Math.sin(angle) * tilt);
      const quat = new THREE.Quaternion().setFromEuler(euler);
      const pos = new THREE.Vector3(
        cx + Math.sin(angle) * 0.25,
        cy + height * 0.45,
        cz + Math.cos(angle) * 0.25,
      );
      branchItems.push({
        pos,
        quat,
        scale: new THREE.Vector3(thickness, height, thickness),
      });
    }

    for (let s = 0; s < 3; s++) {
      sphereItems.push({
        pos: new THREE.Vector3(
          cx + rngRange(rng, -0.38, 0.38),
          cy + rngRange(rng, 0.25, 1.05),
          cz + rngRange(rng, -0.38, 0.38),
        ),
        scale: rngRange(rng, 0.75, 1.4),
      });
    }
  }

  const branchGeom = new THREE.CylinderGeometry(0.035, 0.11, 1.0, 8, 1);
  const branchMat = createClayMaterial({ color: "#5E8FB8", roughness: 0.75 });
  const branches = new THREE.InstancedMesh(branchGeom, branchMat, branchItems.length);
  branches.name = "O-CORAL-BRANCHES";

  const sphereGeom = new THREE.SphereGeometry(0.13, 6, 5);
  const sphereMat = createClayMaterial({ color: "#5E8FB8", roughness: 0.75 });
  const spheres = new THREE.InstancedMesh(sphereGeom, sphereMat, sphereItems.length);
  spheres.name = "O-CORAL-SPHERES";

  const mat4 = new THREE.Matrix4();
  const identityQuat = new THREE.Quaternion();
  const sVec = new THREE.Vector3();

  for (let i = 0; i < branchItems.length; i++) {
    const item = branchItems[i]!;
    mat4.compose(item.pos, item.quat, item.scale);
    branches.setMatrixAt(i, mat4);
  }
  branches.instanceMatrix.needsUpdate = true;

  for (let i = 0; i < sphereItems.length; i++) {
    const item = sphereItems[i]!;
    sVec.setScalar(item.scale);
    mat4.compose(item.pos, identityQuat, sVec);
    spheres.setMatrixAt(i, mat4);
  }
  spheres.instanceMatrix.needsUpdate = true;

  coralGroup.add(branches, spheres);
  parent.add(coralGroup);
  return { group: coralGroup, branchMat, sphereMat };
}

/**
 * Scene B4 ("Lautan"): laut terbuka 3 gelombang Gerstner yang makin besar,
 * matahari putih dingin, dermaga dengan kenaikan air 0.3, penyelaman kamera tanpa pop,
 * dan pemutihan terumbu karang (#5E8FB8 -> #E6EAF2).
 */
export function createB4Scene(): Scene {
  let ctx: StageContext | null = null;
  let water: WaterSystem | null = null;
  let localGroup: THREE.Group | null = null;
  let sun: ReturnType<typeof createColdSun> | null = null;
  let pier: THREE.Group | null = null;
  let coral: CoralRefs | null = null;

  const fog = new THREE.FogExp2(PALETTE.c4.bg, CUES.c4.fog);
  const lookAt = new THREE.Vector3();
  const waveNormal = new THREE.Vector3();
  const upVec = new THREE.Vector3(0, 1, 0);
  const tiltQuat = new THREE.Quaternion();
  const swayEuler = new THREE.Euler();
  const swayQuat = new THREE.Quaternion();
  const sunDir = new THREE.Vector3(8, 6, -30).normalize();

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
      coral = createCoralReef(localGroup, clusterCount);
      localGroup.visible = false;
    },

    enter() {
      if (!ctx || !water || !localGroup) return;
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

    update(t: number) {
      if (!ctx || !water || !localGroup || !sun || !pier || !coral) return;
      const uTime = ctx.reducedMotion ? 0 : ctx.uniforms.uTime.value;
      const { bottle, contactShadow } = ctx.shared;
      contactShadow.setVisible(false);
      localGroup.visible = true;

      // Gelombang laut: amplitudo 0.12 -> 0.50 dan kecepatan 1x -> 2.2x pada t 0.12..0.48
      const stormUp = smoothstep(0.12, 0.48, t);
      const calmDive = smoothstep(0.65, 1.0, t);
      const amplitude = lerp(lerp(0.12, 0.5, stormUp), 0.24, calmDive * 0.5);
      const speed = lerp(1.0, 2.2, stormUp);
      const waveTime = uTime + t * 8.0;

      // Kamera menyelam: y 1.2 -> -1.4 pada t 0.48..0.78
      const diveK = easeInOutQuad(clamp01((t - 0.48) / 0.3));
      const deepK = smoothstep(0.78, 1.0, t);
      const sway = ctx.reducedMotion ? 0 : Math.sin(uTime * 1.9 + t * 12) * 0.01;
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
        lookY = lerp(-2.35, -1.2, deepK);
      }

      ctx.applyResponsiveCamera(35);
      ctx.camera.position.set(camX, camY, camZ);
      lookAt.set(0, lookY, 0);
      ctx.camera.lookAt(lookAt);

      // Permukaan air di posisi kamera untuk transisi mulus tanpa lompatan
      water.group.visible = true;
      water.group.position.set(0, 0, 0);
      water.setMode("sea");
      const surfaceAtCam = water.sampleHeightAndNormal(camX, camZ).y;
      const underwater = smoothstep(surfaceAtCam + 0.18, surfaceAtCam - 0.18, camY);

      // Redup lembut ~0.15s di tepat batas menembus air + peralihan ke c5
      const crossWidth = 0.22;
      const crossDip = Math.exp(-Math.pow((camY - surfaceAtCam) / crossWidth, 2));
      const cueMix = smoothstep(0.7, 1.0, t);

      fog.color.lerpColors(C4_BG, C5_BG, cueMix);
      fog.density = lerp(CUES.c4.fog, 0.042, underwater);
      fog.density = lerp(fog.density, CUES.c5.fog + 0.015, cueMix);
      ctx.scene.fog = fog;

      water.setParams({
        time: waveTime,
        amplitude,
        speed,
        turbid: 0.45,
        underwater,
        opacity: 1,
        sunDir,
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

      // Karang memutih #5E8FB8 -> #E6EAF2 lewat uBleach (0 -> 1)
      const bleach = smoothstep(0.5, 0.78, t);
      coral.group.visible = t >= 0.35;
      coral.branchMat.color.lerpColors(CORAL_HEALTHY, CORAL_BLEACHED, bleach);
      coral.sphereMat.color.lerpColors(CORAL_HEALTHY, CORAL_BLEACHED, bleach);
      coral.branchMat.roughness = lerp(0.74, 0.88, bleach);
      coral.sphereMat.roughness = lerp(0.74, 0.88, bleach);

      // Botol mengapung mengikuti ketinggian + normal ombak Gerstner
      const bottleX = -0.35 + Math.sin(t * Math.PI) * 0.25;
      const bottleZ = 0.15;
      const waveSample = water.sampleHeightAndNormal(bottleX, bottleZ, waveNormal);

      bottle.group.visible = true;
      bottle.group.position.set(bottleX, waveSample.y - 0.1, bottleZ);
      tiltQuat.setFromUnitVectors(upVec, waveNormal);
      swayEuler.set(0.18 * Math.sin(waveTime * 0.6), t * 1.1, 1.38);
      swayQuat.setFromEuler(swayEuler).premultiply(tiltQuat);
      bottle.group.quaternion.copy(swayQuat);

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
      if (localGroup) localGroup.visible = false;
      if (water) water.setParams({ underwater: 0 });
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
