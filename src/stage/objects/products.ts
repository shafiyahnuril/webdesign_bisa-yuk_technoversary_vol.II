import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import {
  makeBrushedMetalSet,
  makeCeramicGlazeSet,
  makeFabricPbrSet,
  makeWoodGrainSet,
  type PbrTextureSet,
} from "../textures/pbr-maps";
import { clamp01 } from "../util/math";

export type ProductId = "tote" | "tee" | "backpack" | "rug" | "bench" | "pot" | "fleece";

export interface ProductSpec {
  readonly id: ProductId;
  readonly name: string;
  readonly width: number;
  readonly height: number;
  readonly depth: number;
  readonly color: string;
  readonly x: number;
  readonly portraitVisible: boolean;
}

export const PRODUCT_SPECS: Record<ProductId, ProductSpec> = {
  tote: {
    id: "tote",
    name: "Tote bag",
    width: 2.6,
    height: 2.8,
    depth: 0.7,
    color: "#2A7F78",
    x: -9.6,
    portraitVisible: true,
  },
  tee: {
    id: "tee",
    name: "Kaus",
    width: 3.0,
    height: 3.0,
    depth: 0.3,
    color: "#579E82",
    x: -6.4,
    portraitVisible: true,
  },
  backpack: {
    id: "backpack",
    name: "Ransel",
    width: 2.6,
    height: 3.4,
    depth: 1.3,
    color: "#335B78",
    x: -3.2,
    portraitVisible: false,
  },
  rug: {
    id: "rug",
    name: "Karpet gulung",
    width: 1.1,
    height: 3.2,
    depth: 1.1,
    color: "#7EB2A0",
    x: 0,
    portraitVisible: true,
  },
  bench: {
    id: "bench",
    name: "Bangku taman",
    width: 3.4,
    height: 1.6,
    depth: 1.2,
    color: "#9E7858",
    x: 3.2,
    portraitVisible: true,
  },
  pot: {
    id: "pot",
    name: "Pot tanaman",
    width: 1.6,
    height: 1.8,
    depth: 1.6,
    color: "#5E8B7B",
    x: 6.4,
    portraitVisible: true,
  },
  fleece: {
    id: "fleece",
    name: "Jaket fleece",
    width: 3.0,
    height: 3.4,
    depth: 0.4,
    color: "#3F7A73",
    x: 9.6,
    portraitVisible: false,
  },
};

export const PRODUCT_ORDER: readonly ProductId[] = [
  "tote",
  "tee",
  "backpack",
  "rug",
  "bench",
  "pot",
  "fleece",
];

export const MAX_CLOTH_FLUTTER = 0.004;

export interface ProductHandle {
  readonly id: ProductId;
  readonly group: THREE.Group;
  setDim(factor: number): void;
  updateFlutter?(timeSec: number, enabled: boolean): void;
  reset(): void;
  dispose(): void;
}

interface ColorTrackedMaterial {
  readonly mat: THREE.MeshStandardMaterial;
  readonly base: THREE.Color;
}

interface ClothFlutterTarget {
  readonly geom: THREE.BufferGeometry;
  readonly rest: Float32Array;
  readonly weights: Float32Array;
  readonly amp: number;
  readonly phase: number;
  readonly freq: number;
  displaced: boolean;
}

type BuildHelpers = {
  trackMat: (m: THREE.MeshStandardMaterial) => THREE.MeshStandardMaterial;
  trackGeom: (g: THREE.BufferGeometry) => THREE.BufferGeometry;
  trackSet: (s: PbrTextureSet) => PbrTextureSet;
  trackFlutter: (
    geom: THREE.BufferGeometry,
    weights: Float32Array,
    amp: number,
    phase: number,
    freq: number,
  ) => void;
};

function makeTrackedProduct(
  id: ProductId,
  buildFn: (h: BuildHelpers) => THREE.Group,
): ProductHandle {
  const trackedMats: ColorTrackedMaterial[] = [];
  const geoms: THREE.BufferGeometry[] = [];
  const sets: PbrTextureSet[] = [];
  const flutters: ClothFlutterTarget[] = [];

  const group = buildFn({
    trackMat(m) {
      trackedMats.push({ mat: m, base: m.color.clone() });
      return m;
    },
    trackGeom(g) {
      geoms.push(g);
      return g;
    },
    trackSet(s) {
      sets.push(s);
      return s;
    },
    trackFlutter(geom, weights, amp, phase, freq) {
      const pos = geom.getAttribute("position") as THREE.BufferAttribute | undefined;
      if (!pos) return;
      const rest = new Float32Array(pos.array as ArrayLike<number>);
      flutters.push({
        geom,
        rest,
        weights,
        amp: Math.min(MAX_CLOTH_FLUTTER, Math.max(0, amp)),
        phase,
        freq,
        displaced: false,
      });
    },
  });
  group.name = `Product_${id}`;

  const applyFlutter = (timeSec: number, enabled: boolean) => {
    for (const target of flutters) {
      const pos = target.geom.getAttribute("position") as THREE.BufferAttribute | undefined;
      if (!pos) continue;
      const arr = pos.array as Float32Array;
      const rest = target.rest;

      if (!enabled || timeSec === 0) {
        if (target.displaced) {
          arr.set(rest);
          pos.needsUpdate = true;
          target.displaced = false;
        }
        continue;
      }

      const count = Math.min(target.weights.length, Math.floor(arr.length / 3));
      for (let i = 0; i < count; i++) {
        const w = target.weights[i] ?? 0;
        const idx = i * 3;
        const rx = rest[idx] ?? 0;
        const ry = rest[idx + 1] ?? 0;
        const rz = rest[idx + 2] ?? 0;
        if (w <= 0.001) {
          arr[idx] = rx;
          arr[idx + 1] = ry;
          arr[idx + 2] = rz;
          continue;
        }
        const wave = Math.sin(timeSec * target.freq + ry * 2.1 + rx * 2.8 + target.phase);
        const cross = Math.cos(timeSec * (target.freq * 0.72) + ry * 1.5 - rx * 1.9 + target.phase);
        const dz = wave * target.amp * w;
        const dx = cross * target.amp * 0.32 * w;
        arr[idx] = rx + dx;
        arr[idx + 1] = ry;
        arr[idx + 2] = rz + dz;
      }
      pos.needsUpdate = true;
      target.displaced = true;
    }
  };

  return {
    id,
    group,
    setDim(factor: number) {
      const f = clamp01(factor);
      for (const entry of trackedMats) {
        entry.mat.color.copy(entry.base).multiplyScalar(f);
      }
    },
    updateFlutter(timeSec: number, enabled: boolean) {
      applyFlutter(timeSec, enabled);
    },
    reset() {
      group.visible = true;
      group.scale.set(1, 1, 1);
      group.rotation.set(0, 0, 0);
      for (const entry of trackedMats) {
        entry.mat.color.copy(entry.base);
      }
      applyFlutter(0, false);
    },
    dispose() {
      group.removeFromParent();
      for (const g of geoms) g.dispose();
      for (const entry of trackedMats) entry.mat.dispose();
      for (const s of sets) s.dispose();
    },
  };
}

function buildIndexedGridGeometry(
  uSegs: number,
  vSegs: number,
  evalVertex: (u: number, v: number) => { x: number; y: number; z: number; w: number },
  wrapU = true,
): { geom: THREE.BufferGeometry; weights: Float32Array } {
  const cols = uSegs + 1;
  const rows = vSegs + 1;
  const vertCount = cols * rows;
  const positions = new Float32Array(vertCount * 3);
  const uvs = new Float32Array(vertCount * 2);
  const weights = new Float32Array(vertCount);
  const indices: number[] = [];

  for (let iv = 0; iv <= vSegs; iv++) {
    const v = iv / vSegs;
    for (let iu = 0; iu <= uSegs; iu++) {
      const uEff = wrapU && iu === uSegs ? 0 : iu / uSegs;
      const p = evalVertex(uEff, v);
      const idx = iv * cols + iu;
      positions[idx * 3] = p.x;
      positions[idx * 3 + 1] = p.y;
      positions[idx * 3 + 2] = p.z;
      uvs[idx * 2] = iu / uSegs;
      uvs[idx * 2 + 1] = v;
      weights[idx] = p.w;
    }
  }

  for (let iv = 0; iv < vSegs; iv++) {
    for (let iu = 0; iu < uSegs; iu++) {
      const a = iv * cols + iu;
      const b = a + 1;
      const c = (iv + 1) * cols + iu;
      const d = c + 1;
      indices.push(a, b, c);
      indices.push(b, d, c);
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geom.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return { geom, weights };
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / Math.max(1e-5, edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/**
 * Penyangga rak meja dari baja sikat untuk menggantung kaus & jaket secara fisik ke rak.
 */
function addGarmentStand(
  group: THREE.Group,
  h: BuildHelpers,
  metalMat: THREE.MeshStandardMaterial,
  woodMat: THREE.MeshStandardMaterial,
  opts: {
    standTopY: number;
    hangerCenterY: number;
    shoulderEndY: number;
    shoulderHalfW: number;
    standBackZ: number;
    lowDetail: boolean;
  },
) {
  const segs = opts.lowDetail ? 8 : 14;
  // Pelat dasar bertumpu rata di atas papan rak (y = 0)
  const baseGeom = h.trackGeom(new THREE.CylinderGeometry(0.42, 0.46, 0.036, segs));
  const baseMesh = new THREE.Mesh(baseGeom, metalMat);
  baseMesh.position.set(0, 0.018, opts.standBackZ);

  // Tiang vertikal ramping di belakang garmen
  const poleH = opts.standTopY - 0.14;
  const poleGeom = h.trackGeom(new THREE.CylinderGeometry(0.024, 0.03, poleH, segs));
  const poleMesh = new THREE.Mesh(poleGeom, metalMat);
  poleMesh.position.set(0, poleH * 0.5 + 0.02, opts.standBackZ);

  // Lengan lengkung atas menuju posisi kait hanger di z=0
  const armCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, poleH + 0.01, opts.standBackZ),
    new THREE.Vector3(0, opts.standTopY, opts.standBackZ * 0.55),
    new THREE.Vector3(0, opts.standTopY - 0.03, 0),
  ]);
  const armGeom = h.trackGeom(
    new THREE.TubeGeometry(armCurve, opts.lowDetail ? 8 : 14, 0.022, 6, false),
  );
  const armMesh = new THREE.Mesh(armGeom, metalMat);

  const ringGeom = h.trackGeom(new THREE.TorusGeometry(0.055, 0.016, 6, 10));
  const ringMesh = new THREE.Mesh(ringGeom, metalMat);
  ringMesh.position.set(0, opts.standTopY - 0.05, 0);
  ringMesh.rotation.y = Math.PI * 0.5;

  // Batang hanger kayu berkontur di dalam bahu pakaian
  const sw = opts.shoulderHalfW;
  const hangerCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-sw, opts.shoulderEndY, -0.02),
    new THREE.Vector3(-sw * 0.52, opts.hangerCenterY - 0.06, 0.015),
    new THREE.Vector3(0, opts.hangerCenterY, 0.02),
    new THREE.Vector3(sw * 0.52, opts.hangerCenterY - 0.06, 0.015),
    new THREE.Vector3(sw, opts.shoulderEndY, -0.02),
  ]);
  const hangerGeom = h.trackGeom(
    new THREE.TubeGeometry(hangerCurve, opts.lowDetail ? 10 : 18, 0.032, 6, false),
  );
  const hangerMesh = new THREE.Mesh(hangerGeom, woodMat);

  // Kait kawat dari pusat hanger ke cincin tiang
  const hookCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, opts.hangerCenterY, 0.01),
    new THREE.Vector3(0, opts.hangerCenterY + 0.24, 0.01),
    new THREE.Vector3(0, opts.standTopY - 0.14, 0.03),
    new THREE.Vector3(0, opts.standTopY - 0.06, 0),
  ]);
  const hookGeom = h.trackGeom(new THREE.TubeGeometry(hookCurve, 10, 0.018, 6, false));
  const hookMesh = new THREE.Mesh(hookGeom, metalMat);

  group.add(baseMesh, poleMesh, armMesh, ringMesh, hangerMesh, hookMesh);
}

interface GarmentTorsoSpec {
  hemY: number;
  armpitY: number;
  shoulderY: number;
  neckSideY: number;
  neckFrontDip: number;
  neckBackDip: number;
  hemRx: number;
  waistRx: number;
  chestRx: number;
  shoulderRx: number;
  neckRx: number;
  hemRz: number;
  chestRz: number;
  neckRz: number;
  hemSag: number;
  foldAmp: number;
  foldFreq: number;
  pleatSkew: number;
  flutterAmp: number;
  isJacket: boolean;
}

function evalTorsoPoint(
  spec: GarmentTorsoSpec,
  u: number,
  v: number,
): { x: number; y: number; z: number; w: number } {
  const theta = u * Math.PI * 2;
  const cosT = Math.cos(theta);
  const sinT = Math.sin(theta);
  const absCos = Math.abs(cosT);

  // Profil lebar (x): melebar lembut di hem, sedikit meramping di pinggang, penuh di dada, miring ke kerah
  let rx: number;
  if (v < 0.42) {
    const k = smoothstep(0, 0.42, v);
    rx = THREE.MathUtils.lerp(spec.hemRx, spec.waistRx, k);
  } else if (v < 0.7) {
    const k = smoothstep(0.42, 0.7, v);
    rx = THREE.MathUtils.lerp(spec.waistRx, spec.chestRx, k);
  } else if (v < 0.87) {
    const k = smoothstep(0.7, 0.87, v);
    rx = THREE.MathUtils.lerp(spec.chestRx, spec.shoulderRx, k);
  } else {
    const k = smoothstep(0.87, 1.0, v);
    rx = THREE.MathUtils.lerp(spec.shoulderRx, spec.neckRx, k);
  }

  // Pertahankan volume depan-belakang penuh melalui lubang lengan (v = 0.70..0.86)
  // dan jepit lembut hanya di punggung bahu atas menuju kerah
  let rz = THREE.MathUtils.lerp(spec.hemRz, spec.chestRz, smoothstep(0, 0.65, v));
  if (v > 0.85) {
    const shoulderPinch = smoothstep(0.85, 0.97, v) * smoothstep(0.38, 0.96, absCos);
    rz = THREE.MathUtils.lerp(rz, spec.neckRz, smoothstep(0.86, 1.0, v));
    rz *= 1 - 0.48 * shoulderPinch;
  }

  // Tinggi y dengan lengkung hem gravitasi (tengah lebih berat) & scoop kerah depan/belakang
  const frontFactor = Math.max(0, sinT);
  const backFactor = Math.max(0, -sinT);
  const centerWeight = 1 - absCos * absCos;

  const hemRipple =
    -spec.hemSag * centerWeight +
    spec.foldAmp * 0.24 * Math.sin(spec.foldFreq * theta + 0.5) * (1 - 0.35 * absCos);
  const yBottom = spec.hemY + hemRipple;

  const neckDip =
    (frontFactor * spec.neckFrontDip + backFactor * spec.neckBackDip) *
    smoothstep(0.95, 0.0, absCos);
  const shoulderSlope = smoothstep(0.28, 1.0, absCos) * (spec.neckSideY - spec.shoulderY);
  const yTop = spec.neckSideY - neckDip - shoulderSlope * 0.22;

  let y: number;
  if (v <= 0.72) {
    y = THREE.MathUtils.lerp(yBottom, spec.armpitY, v / 0.72);
  } else if (v <= 0.88) {
    const kv = (v - 0.72) / 0.16;
    const shoulderEdgeY = THREE.MathUtils.lerp(spec.armpitY, spec.shoulderY, kv);
    const centerChestY = THREE.MathUtils.lerp(spec.armpitY, spec.neckSideY - neckDip * 0.75, kv);
    y = THREE.MathUtils.lerp(centerChestY, shoulderEdgeY, smoothstep(0.22, 0.95, absCos));
  } else {
    const kv = (v - 0.88) / 0.12;
    const shoulderBaseY = THREE.MathUtils.lerp(
      spec.neckSideY - neckDip * 0.75,
      spec.shoulderY,
      smoothstep(0.22, 0.95, absCos),
    );
    y = THREE.MathUtils.lerp(shoulderBaseY, yTop, kv);
  }

  // Lipatan gravitasi vertikal & diagonal dari titik hanger bahu menuju hem bawah
  const gravityMask = Math.pow(1 - v, 1.25);
  const diagPhase = spec.pleatSkew * (1 - v) * Math.sign(cosT || 1);
  const primaryPleat = Math.sin(spec.foldFreq * theta + diagPhase + 0.35);
  const secondaryPleat = Math.sin((spec.foldFreq + 3) * theta - diagPhase * 1.15 + 1.1);
  const faceAmount = 0.38 + 0.62 * Math.abs(sinT);

  // Sedikit tarikan catenary di dada atas antara dua bahu hanger
  const upperDrapeMask = smoothstep(0.42, 0.78, v) * smoothstep(1.0, 0.84, v);
  const catenarySag = -0.022 * upperDrapeMask * centerWeight * Math.abs(sinT);

  // Jaket memiliki bukaan belahan ritsleting tipis di tengah depan agar terbaca berlapis
  let zipValley = 0;
  if (spec.isJacket && sinT > 0.7) {
    const centerFront = smoothstep(0.25, 0.0, absCos);
    zipValley = -0.028 * centerFront * smoothstep(0.08, 0.88, v);
  }

  const foldZ =
    gravityMask * (spec.foldAmp * primaryPleat + spec.foldAmp * 0.42 * secondaryPleat) * faceAmount;
  const foldR = gravityMask * (spec.foldAmp * 0.36 * primaryPleat) * (0.4 + 0.6 * absCos);

  const x = (rx + foldR * 0.55) * cosT;
  let z = (rz + catenarySag) * sinT + foldZ * (sinT >= 0 ? 1 : -1) + zipValley;

  // Sedikit lengkung alami bagian dada depan lebih maju dan punggung lebih relaks
  if (v > 0.15 && v < 0.88) {
    z += 0.018 * Math.sin(Math.PI * ((v - 0.15) / 0.73)) * centerWeight;
  }

  // Bobot micro-flutter: nol di bahu/kerah/ritsleting tengah, naik halus ke hem bawah
  const w = Math.pow(1 - v, 1.65) * (spec.isJacket ? 0.55 + 0.45 * absCos : 0.7 + 0.3 * absCos);

  return { x, y, z, w };
}

function buildDrapedTorsoGeometry(spec: GarmentTorsoSpec, lowDetail: boolean) {
  const uSegs = lowDetail ? 14 : 26;
  const vSegs = lowDetail ? 10 : 18;

  return buildIndexedGridGeometry(uSegs, vSegs, (u, v) => evalTorsoPoint(spec, u, v));
}

interface SleeveSpec {
  side: -1 | 1; // -1 kiri, +1 kanan
  torsoSpec: GarmentTorsoSpec;
  armpitV: number;
  shoulderV: number;
  seamInset: number;
  armholeDepthAngle: number;
  shoulderExitAngle: number;
  length: number;
  droopAngle: number; // radian ke bawah dari horizontal
  elbowBendZ: number;
  baseRy: number;
  cuffRy: number;
  baseRz: number;
  cuffRz: number;
  foldAmp: number;
  gravityDrop: number;
}

function createSleeveEvaluator(spec: SleeveSpec) {
  const evalArmholeAnchor = (phi: number) => {
    const cosP = Math.cos(phi);
    const sinP = Math.sin(phi);
    const vArm = THREE.MathUtils.lerp(spec.armpitV, spec.shoulderV, 0.5 + 0.5 * cosP);
    const thetaBase = spec.side === 1 ? 0 : Math.PI;
    const thetaArm = thetaBase + spec.side * sinP * spec.armholeDepthAngle;
    const uArm = (((thetaArm / (Math.PI * 2)) % 1) + 1) % 1;
    const pt = evalTorsoPoint(spec.torsoSpec, uArm, vArm);
    return new THREE.Vector3(pt.x - spec.side * spec.seamInset, pt.y, pt.z);
  };

  const topAnchor = evalArmholeAnchor(0);
  const botAnchor = evalArmholeAnchor(Math.PI);
  const p0 = new THREE.Vector3().addVectors(topAnchor, botAnchor).multiplyScalar(0.5);

  const dirEnd = new THREE.Vector3(
    spec.side * Math.cos(spec.droopAngle),
    -Math.sin(spec.droopAngle),
    0,
  ).normalize();
  const dirExit = new THREE.Vector3(
    spec.side * Math.cos(spec.shoulderExitAngle),
    -Math.sin(spec.shoulderExitAngle),
    0,
  ).normalize();

  const p3 = new THREE.Vector3(
    p0.x + dirEnd.x * spec.length,
    p0.y + dirEnd.y * spec.length - spec.gravityDrop,
    p0.z + 0.015,
  );
  const p1 = new THREE.Vector3(
    p0.x + dirExit.x * spec.length * 0.36,
    p0.y + dirExit.y * spec.length * 0.36,
    p0.z + 0.012,
  );
  const p2 = new THREE.Vector3()
    .lerpVectors(p1, p3, 0.56)
    .add(new THREE.Vector3(0, 0, spec.elbowBendZ));

  const spineCurve = new THREE.CubicBezierCurve3(p0, p1, p2, p3);

  const evalRing = (u: number, s: number) => {
    const phi = u * Math.PI * 2;
    const cosP = Math.cos(phi);
    const sinP = Math.sin(phi);

    const center = spineCurve.getPoint(s);
    const tangent = spineCurve.getTangent(s).normalize();

    // Basis lokal penampang tegak lurus kurva lengan (up mengarah ke puncak bahu saat cosP = +1)
    const xyLen = Math.max(1e-4, Math.hypot(tangent.x, tangent.y));
    const tx2 = tangent.x / xyLen;
    const ty2 = tangent.y / xyLen;
    const upX = -ty2 * spec.side;
    const upY = tx2 * spec.side;

    const ry = THREE.MathUtils.lerp(spec.baseRy, spec.cuffRy, smoothstep(0, 1, s));
    const rz = THREE.MathUtils.lerp(spec.baseRz, spec.cuffRz, smoothstep(0, 1, s));

    const underarmPinch = Math.max(0, -cosP) * smoothstep(0.08, 0.5, s) * smoothstep(1.0, 0.35, s);
    const crease =
      spec.foldAmp *
      (Math.sin(4 * phi + s * 4.2) * smoothstep(0.14, 0.95, s) +
        0.7 * Math.sin(7 * phi - s * 2.8) * underarmPinch);

    const cylOffsetX = upX * cosP * (ry + crease * 0.45);
    const cylOffsetY = upY * cosP * (ry + crease * 0.45) - 0.016 * s * Math.max(0, -cosP);
    const cylOffsetZ = sinP * (rz + crease);

    // Pada s = 0, titik lengan mengunci tepat ke kontur lubang ketiak-bahu torso, lalu membaur mulus ke silinder lengan
    const anchor = evalArmholeAnchor(phi);
    const anchorOffX = anchor.x - p0.x;
    const anchorOffY = anchor.y - p0.y;
    const anchorOffZ = anchor.z - p0.z;

    const seamBlend = smoothstep(0.0, 0.42, s);
    const offX = THREE.MathUtils.lerp(anchorOffX, cylOffsetX, seamBlend);
    const offY = THREE.MathUtils.lerp(anchorOffY, cylOffsetY, seamBlend);
    const offZ = THREE.MathUtils.lerp(anchorOffZ, cylOffsetZ, seamBlend);

    const w = smoothstep(0.08, 1.0, s) * Math.pow(s, 1.25) * 0.82;
    return {
      x: center.x + offX,
      y: center.y + offY,
      z: center.z + offZ,
      w,
    };
  };

  return { evalRing, spineCurve };
}

function buildDrapedSleeveGeometry(spec: SleeveSpec, lowDetail: boolean) {
  const uSegs = lowDetail ? 10 : 18;
  const vSegs = lowDetail ? 7 : 12;
  const evaluator = createSleeveEvaluator(spec);

  const built = buildIndexedGridGeometry(uSegs, vSegs, (u, s) => evaluator.evalRing(u, s));
  return { ...built, evaluator };
}

/**
 * Tote bag kanvas tenun bervolume lembut (sag gravitasi di perut bawah + mulut tas mengerucut + strap melengkung).
 */
export function createToteProduct(lowDetail = false): ProductHandle {
  return makeTrackedProduct("tote", (h) => {
    const group = new THREE.Group();
    const spec = PRODUCT_SPECS.tote;
    const canvasSet = h.trackSet(makeFabricPbrSet("canvas", 256, 6, 8));

    const uSegs = lowDetail ? 14 : 20;
    const vSegs = lowDetail ? 8 : 14;

    const { geom: bodyGeom, weights: bodyWeights } = buildIndexedGridGeometry(
      uSegs,
      vSegs,
      (u, v) => {
        const theta = u * Math.PI * 2;
        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);

        // Superellipse agar tampak seperti tas kanvas berjahit sudut lembut, bukan kotak kaku
        const sCos = Math.sign(cosT) * Math.pow(Math.abs(cosT), 0.74);
        const sSin = Math.sign(sinT) * Math.pow(Math.abs(sinT), 0.82);

        const halfW = spec.width * 0.5;
        const halfD = spec.depth * 0.5;

        // Perut bawah mengembang akibat beban gravitasi; mulut atas mengerucut ringan di sumbu z
        const belly = Math.sin(Math.PI * Math.pow(v, 0.72));
        const topPinchZ = THREE.MathUtils.lerp(1.06, 0.7, smoothstep(0.58, 1.0, v));
        const sideGussetIn = -0.06 * smoothstep(0.35, 1.0, v) * Math.pow(Math.abs(cosT), 2.4);

        const rx = halfW * (0.94 + 0.08 * belly) + sideGussetIn;
        const rz = halfD * (topPinchZ + 0.22 * belly * (1 - v * 0.4));

        // Ripple & lipatan diagonal kain kanvas
        const ripple =
          0.026 *
          Math.sin(4 * theta + v * 2.2) *
          smoothstep(0.06, 0.85, v) *
          (0.4 + 0.6 * Math.abs(sinT));
        const topEdgeWave =
          v > 0.88 ? -0.045 * (1 - Math.abs(cosT) * Math.abs(cosT)) * smoothstep(0.88, 1, v) : 0;

        const x = (rx + ripple * 0.5) * sCos;
        const z = (rz + ripple) * sSin;
        const y = v * (spec.height - 0.14) + topEdgeWave;
        const w = smoothstep(0.45, 1.0, v) * 0.45;
        return { x, y, z, w };
      },
    );
    h.trackGeom(bodyGeom);
    h.trackFlutter(bodyGeom, bodyWeights, 0.0022, 0.2, 1.15);

    // Jahitan keliman atas melengkung mengikuti mulut tas
    const hemPts: THREE.Vector3[] = [];
    const hemSteps = lowDetail ? 14 : 20;
    for (let i = 0; i <= hemSteps; i++) {
      const t = (i / hemSteps) * Math.PI * 2;
      const cosT = Math.cos(t);
      const sinT = Math.sin(t);
      const sCos = Math.sign(cosT) * Math.pow(Math.abs(cosT), 0.74);
      const sSin = Math.sign(sinT) * Math.pow(Math.abs(sinT), 0.82);
      const rx = spec.width * 0.5 * 0.94 - 0.055 * Math.pow(Math.abs(cosT), 2.4);
      const rz = spec.depth * 0.5 * 0.71;
      const wave = -0.045 * (1 - cosT * cosT);
      hemPts.push(new THREE.Vector3(rx * sCos, spec.height - 0.14 + wave, rz * sSin));
    }
    const hemCurve = new THREE.CatmullRomCurve3(hemPts, true);
    const hemGeom = h.trackGeom(
      new THREE.TubeGeometry(hemCurve, lowDetail ? 16 : 24, 0.048, 5, true),
    );

    // Saku depan bervolume lembut (sedikit cembung mengikuti perut kanvas)
    const { geom: pocketGeom } = buildIndexedGridGeometry(
      lowDetail ? 7 : 12,
      lowDetail ? 5 : 8,
      (u, v) => {
        const px = (u - 0.5) * 1.48;
        const py = 0.52 + v * 1.12;
        const bulge = 0.06 * Math.sin(Math.PI * u) * Math.sin(Math.PI * (0.15 + 0.75 * v));
        const sagDip = -0.03 * Math.sin(Math.PI * u) * smoothstep(0.75, 1.0, v);
        const pz = spec.depth * 0.49 + 0.06 + bulge;
        return { x: px, y: py + sagDip, z: pz, w: 0 };
      },
      false,
    );
    h.trackGeom(pocketGeom);

    // Tali jinjing kanvas melengkung lembut dengan sedikit kecondongan alami
    const makeHandleGeom = (zSign: 1 | -1) => {
      const zBase = zSign * spec.depth * 0.25;
      const lean = zSign * 0.14;
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.62, spec.height - 0.22, zBase),
        new THREE.Vector3(-0.52, spec.height + 0.36, zBase + lean * 0.65),
        new THREE.Vector3(0, spec.height + 0.62, zBase + lean),
        new THREE.Vector3(0.52, spec.height + 0.36, zBase + lean * 0.65),
        new THREE.Vector3(0.62, spec.height - 0.22, zBase),
      ]);
      return h.trackGeom(new THREE.TubeGeometry(curve, lowDetail ? 10 : 16, 0.052, 5, false));
    };

    const bodyMat = h.trackMat(
      new THREE.MeshStandardMaterial({
        color: spec.color,
        map: canvasSet.map ?? null,
        normalMap: canvasSet.normalMap ?? null,
        normalScale: new THREE.Vector2(0.18, 0.18),
        roughnessMap: canvasSet.roughnessMap ?? null,
        roughness: 0.95,
        metalness: 0,
        side: THREE.DoubleSide,
      }),
    );
    const pocketMat = h.trackMat(
      new THREE.MeshStandardMaterial({
        color: "#22655F",
        map: canvasSet.map ?? null,
        normalMap: canvasSet.normalMap ?? null,
        normalScale: new THREE.Vector2(0.16, 0.16),
        roughness: 0.84,
        metalness: 0,
        side: THREE.DoubleSide,
      }),
    );
    const handleMat = h.trackMat(
      new THREE.MeshStandardMaterial({
        color: "#16433F",
        normalMap: canvasSet.normalMap ?? null,
        normalScale: new THREE.Vector2(0.16, 0.16),
        roughness: 0.92,
        metalness: 0,
      }),
    );

    const bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
    const topHem = new THREE.Mesh(hemGeom, handleMat);
    const frontPocket = new THREE.Mesh(pocketGeom, pocketMat);
    const frontHandle = new THREE.Mesh(makeHandleGeom(1), handleMat);
    const backHandle = new THREE.Mesh(makeHandleGeom(-1), handleMat);

    // children[0] dipertahankan sebagai bodyMesh sesuai kontrak tes
    group.add(bodyMesh, topHem, frontPocket, frontHandle, backHandle);
    return group;
  });
}

function createTeeProduct(lowDetail = false): ProductHandle {
  return makeTrackedProduct("tee", (h) => {
    const group = new THREE.Group();
    const cottonSet = h.trackSet(makeFabricPbrSet("cotton", 256, 8, 10));
    const metalSet = h.trackSet(makeBrushedMetalSet(256, 1, 1));
    const woodSet = h.trackSet(makeWoodGrainSet(256, 1, 1));

    const bodyMat = h.trackMat(
      new THREE.MeshStandardMaterial({
        color: PRODUCT_SPECS.tee.color,
        map: cottonSet.map ?? null,
        normalMap: cottonSet.normalMap ?? null,
        normalScale: new THREE.Vector2(0.14, 0.14),
        roughnessMap: cottonSet.roughnessMap ?? null,
        roughness: 0.98,
        metalness: 0,
        side: THREE.DoubleSide,
      }),
    );
    const ribMat = h.trackMat(
      new THREE.MeshStandardMaterial({
        color: "#3F8066",
        map: cottonSet.map ?? null,
        normalMap: cottonSet.normalMap ?? null,
        normalScale: new THREE.Vector2(0.18, 0.18),
        roughness: 0.9,
        metalness: 0,
      }),
    );
    const linerMat = h.trackMat(
      new THREE.MeshStandardMaterial({
        color: "#1F4438",
        roughness: 0.94,
        metalness: 0,
        side: THREE.DoubleSide,
      }),
    );
    const wireMat = h.trackMat(
      new THREE.MeshStandardMaterial({
        color: "#7E8E9E",
        normalMap: metalSet.normalMap ?? null,
        roughness: 0.28,
        metalness: 0.85,
      }),
    );
    const woodMat = h.trackMat(
      new THREE.MeshStandardMaterial({
        color: "#8E6F51",
        map: woodSet.map ?? null,
        normalMap: woodSet.normalMap ?? null,
        roughness: 0.64,
        metalness: 0,
      }),
    );

    const teeTorsoSpec: GarmentTorsoSpec = {
      hemY: 0.22,
      armpitY: 1.88,
      shoulderY: 2.52,
      neckSideY: 2.86,
      neckFrontDip: 0.27,
      neckBackDip: 0.08,
      hemRx: 0.9,
      waistRx: 0.82,
      chestRx: 0.9,
      shoulderRx: 0.82,
      neckRx: 0.34,
      hemRz: 0.25,
      chestRz: 0.23,
      neckRz: 0.14,
      hemSag: 0.062,
      foldAmp: 0.068,
      foldFreq: 4,
      pleatSkew: 0.85,
      flutterAmp: 0.0038,
      isJacket: false,
    };

    const torso = buildDrapedTorsoGeometry(teeTorsoSpec, lowDetail);
    h.trackGeom(torso.geom);
    h.trackFlutter(torso.geom, torso.weights, 0.0038, 0.4, 1.45);
    const torsoMesh = new THREE.Mesh(torso.geom, bodyMat);
    torsoMesh.name = "Product_tee_torso";

    // Lapisan dalam gelap di kerah & bawah agar siluet berongga saat dilihat dari sudut 3/4
    const innerNeckGeom = h.trackGeom(
      new THREE.CylinderGeometry(0.32, 0.36, 0.34, lowDetail ? 10 : 14, 1, true),
    );
    const innerNeck = new THREE.Mesh(innerNeckGeom, linerMat);
    innerNeck.position.set(0, 2.58, -0.01);
    innerNeck.scale.set(1, 1, 0.4);

    // Kerah rib memutar mengikuti lekuk leher
    const collarPts: THREE.Vector3[] = [];
    const collarSteps = lowDetail ? 12 : 20;
    for (let i = 0; i <= collarSteps; i++) {
      const t = (i / collarSteps) * Math.PI * 2;
      const cosT = Math.cos(t);
      const sinT = Math.sin(t);
      const frontF = Math.max(0, sinT);
      const backF = Math.max(0, -sinT);
      const absCos = Math.abs(cosT);
      const dip = (frontF * 0.27 + backF * 0.08) * smoothstep(0.95, 0, absCos);
      collarPts.push(new THREE.Vector3(0.34 * cosT, 2.86 - dip, 0.14 * sinT));
    }
    const collarCurve = new THREE.CatmullRomCurve3(collarPts, true);
    const collarGeom = h.trackGeom(
      new THREE.TubeGeometry(collarCurve, lowDetail ? 14 : 22, 0.038, 5, true),
    );
    const collarMesh = new THREE.Mesh(collarGeom, ribMat);

    // Jahitan lipat bawah (hem seam)
    const hemPts: THREE.Vector3[] = [];
    for (let i = 0; i <= collarSteps; i++) {
      const t = (i / collarSteps) * Math.PI * 2;
      const cosT = Math.cos(t);
      const sinT = Math.sin(t);
      const absCos = Math.abs(cosT);
      const cW = 1 - absCos * absCos;
      const wave = -0.062 * cW + 0.016 * Math.sin(4 * t + 0.5) * (1 - 0.35 * absCos);
      const zFold =
        (0.068 * Math.sin(4 * t + 0.85 * Math.sign(cosT || 1) + 0.35) +
          0.028 * Math.sin(7 * t - 0.98 * Math.sign(cosT || 1) + 1.1)) *
        (0.38 + 0.62 * Math.abs(sinT)) *
        (sinT >= 0 ? 1 : -1);
      hemPts.push(new THREE.Vector3(0.9 * cosT, 0.23 + wave, 0.25 * sinT + zFold));
    }
    const hemCurve = new THREE.CatmullRomCurve3(hemPts, true);
    const hemGeom = h.trackGeom(
      new THREE.TubeGeometry(hemCurve, lowDetail ? 14 : 22, 0.026, 5, true),
    );
    const hemMesh = new THREE.Mesh(hemGeom, ribMat);

    group.add(torsoMesh, innerNeck, collarMesh, hemMesh);

    // Lengan pendek kanan & kiri tersambung utuh di lubang bahu torso
    const buildSleeve = (side: -1 | 1, phase: number) => {
      const s = buildDrapedSleeveGeometry(
        {
          side,
          torsoSpec: teeTorsoSpec,
          armpitV: 0.695,
          shoulderV: 0.875,
          seamInset: 0.032,
          armholeDepthAngle: 0.72,
          shoulderExitAngle: 0.42,
          length: 0.78,
          droopAngle: 0.72,
          elbowBendZ: 0.03,
          baseRy: 0.31,
          cuffRy: 0.23,
          baseRz: 0.19,
          cuffRz: 0.15,
          foldAmp: 0.036,
          gravityDrop: 0.11,
        },
        lowDetail,
      );
      h.trackGeom(s.geom);
      h.trackFlutter(s.geom, s.weights, 0.0034, phase, 1.5);
      const mesh = new THREE.Mesh(s.geom, bodyMat);
      mesh.name = side < 0 ? "Product_tee_sleeve_L" : "Product_tee_sleeve_R";

      const cuffSteps = lowDetail ? 10 : 16;
      const cuffPts: THREE.Vector3[] = [];
      const cuffCenter = new THREE.Vector3();
      for (let i = 0; i < cuffSteps; i++) {
        const pt = s.evaluator.evalRing(i / cuffSteps, 1);
        const v3 = new THREE.Vector3(pt.x, pt.y, pt.z);
        cuffPts.push(v3);
        cuffCenter.add(v3);
      }
      cuffCenter.divideScalar(cuffSteps);

      const cuffCurve = new THREE.CatmullRomCurve3(cuffPts, true);
      const cuffRingGeom = h.trackGeom(
        new THREE.TubeGeometry(cuffCurve, lowDetail ? 12 : 20, 0.022, 5, true),
      );
      const cuffRing = new THREE.Mesh(cuffRingGeom, ribMat);

      const endTan = s.evaluator.spineCurve.getTangent(1).normalize();
      const innerPositions: number[] = [];
      const innerIndices: number[] = [];
      const insetCenter = cuffCenter.clone().addScaledVector(endTan, -0.028);
      innerPositions.push(insetCenter.x, insetCenter.y, insetCenter.z);
      for (let i = 0; i < cuffSteps; i++) {
        const p = cuffPts[i]!;
        const shrunk = new THREE.Vector3()
          .lerpVectors(cuffCenter, p, 0.94)
          .addScaledVector(endTan, -0.022);
        innerPositions.push(shrunk.x, shrunk.y, shrunk.z);
      }
      for (let i = 0; i < cuffSteps; i++) {
        innerIndices.push(0, 1 + i, 1 + ((i + 1) % cuffSteps));
      }
      const cuffInnerGeom = new THREE.BufferGeometry();
      cuffInnerGeom.setAttribute("position", new THREE.Float32BufferAttribute(innerPositions, 3));
      cuffInnerGeom.setIndex(innerIndices);
      cuffInnerGeom.computeVertexNormals();
      h.trackGeom(cuffInnerGeom);
      const cuffInner = new THREE.Mesh(cuffInnerGeom, linerMat);

      group.add(mesh, cuffRing, cuffInner);
    };
    buildSleeve(-1, 1.1);
    buildSleeve(1, 2.3);

    addGarmentStand(group, h, wireMat, woodMat, {
      standTopY: 3.46,
      hangerCenterY: 2.82,
      shoulderEndY: 2.46,
      shoulderHalfW: 0.74,
      standBackZ: -0.34,
      lowDetail,
    });
    return group;
  });
}

function createBackpackProduct(lowDetail = false): ProductHandle {
  return makeTrackedProduct("backpack", (h) => {
    const group = new THREE.Group();
    const spec = PRODUCT_SPECS.backpack;
    const nylonSet = h.trackSet(makeFabricPbrSet("nylon", 256, 2, 2));
    const metalSet = h.trackSet(makeBrushedMetalSet(256, 1, 1));

    const uSegs = lowDetail ? 14 : 20;
    const vSegs = lowDetail ? 10 : 14;

    // Siluet ransel nilon ripstop bervolume lembut (puncak melengkung, dasar penuh, lekuk bahu kain)
    const { geom: bodyGeom, weights: bodyWeights } = buildIndexedGridGeometry(
      uSegs,
      vSegs,
      (u, v) => {
        const theta = u * Math.PI * 2;
        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);

        const sCos = Math.sign(cosT) * Math.pow(Math.abs(cosT), 0.78);
        const sSin = Math.sign(sinT) * Math.pow(Math.abs(sinT), 0.82);

        const domeW = THREE.MathUtils.lerp(1.04, 0.56, Math.pow(v, 2.1));
        const cargoBelly = Math.sin(Math.PI * Math.pow(v, 0.65));
        const frontSlump =
          sinT > 0
            ? 0.14 * Math.sin(Math.PI * smoothstep(0.08, 0.72, v)) * (1 - 0.35 * v)
            : -0.04 * (1 - v);

        const rx = spec.width * 0.5 * domeW * (0.94 + 0.08 * Math.sin(Math.PI * v));
        const rz =
          spec.depth * 0.5 * (0.76 + 0.28 * cargoBelly) * (v > 0.84 ? 1 - (v - 0.84) * 2.2 : 1);

        const gather =
          0.025 *
          Math.sin(5 * theta + v * 1.9) *
          smoothstep(0.15, 0.82, v) *
          smoothstep(1.0, 0.7, v);

        const x = (rx + gather * 0.5) * sCos;
        const z = (rz + gather) * sSin + frontSlump * Math.max(0, sinT);
        const domeY =
          v * (spec.height - 0.22) +
          (v > 0.75 ? 0.22 * (1 - Math.abs(cosT) * 0.45) * ((v - 0.75) / 0.25) : 0);
        const w = smoothstep(0.35, 0.9, v) * (0.3 + 0.7 * Math.abs(sinT));
        return { x, y: domeY, z, w };
      },
    );
    h.trackGeom(bodyGeom);
    h.trackFlutter(bodyGeom, bodyWeights, 0.0014, 0.9, 1.05);

    // Saku depan bervolume bulat + jahitan ritsleting
    const { geom: pocketGeom } = buildIndexedGridGeometry(
      lowDetail ? 10 : 16,
      lowDetail ? 8 : 12,
      (u, v) => {
        const px = (u - 0.5) * 1.66 * (1 - 0.16 * Math.pow(v, 2));
        const py = 0.28 + v * 1.38;
        const bulge = 0.26 * Math.sin(Math.PI * u) * Math.sin(Math.PI * v);
        const pz = spec.depth * 0.44 + 0.08 + bulge;
        return { x: px, y: py, z: pz, w: 0 };
      },
      false,
    );
    h.trackGeom(pocketGeom);

    const buckleGeom = h.trackGeom(new RoundedBoxGeometry(0.42, 0.14, 0.12, 2, 0.03));

    // Tali bahu empuk melengkung berbentuk huruf S yang terhubung ke bagian bawah ransel
    const makeStrapGeom = (side: -1 | 1) => {
      const sx = side * 0.68;
      const bz = -spec.depth * 0.42;
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(sx * 0.72, spec.height - 0.42, bz + 0.04),
        new THREE.Vector3(sx * 1.06, spec.height - 0.78, bz - 0.26),
        new THREE.Vector3(sx * 1.12, spec.height * 0.46, bz - 0.34),
        new THREE.Vector3(sx * 0.96, 0.74, bz - 0.2),
        new THREE.Vector3(sx * 0.88, 0.36, bz + 0.04),
      ]);
      return h.trackGeom(new THREE.TubeGeometry(curve, lowDetail ? 12 : 20, 0.11, 7, false));
    };

    const loopCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.24, spec.height - 0.12, -0.08),
      new THREE.Vector3(-0.18, spec.height + 0.26, -0.1),
      new THREE.Vector3(0, spec.height + 0.34, -0.1),
      new THREE.Vector3(0.18, spec.height + 0.26, -0.1),
      new THREE.Vector3(0.24, spec.height - 0.12, -0.08),
    ]);
    const loopGeom = h.trackGeom(new THREE.TubeGeometry(loopCurve, 12, 0.045, 6, false));

    const bodyMat = h.trackMat(
      new THREE.MeshStandardMaterial({
        color: spec.color,
        map: nylonSet.map ?? null,
        normalMap: nylonSet.normalMap ?? null,
        normalScale: new THREE.Vector2(0.14, 0.14),
        roughnessMap: nylonSet.roughnessMap ?? null,
        roughness: 0.6,
        metalness: 0,
        side: THREE.DoubleSide,
      }),
    );
    const accentMat = h.trackMat(
      new THREE.MeshStandardMaterial({
        color: "#1F374A",
        normalMap: nylonSet.normalMap ?? null,
        normalScale: new THREE.Vector2(0.14, 0.14),
        roughness: 0.84,
        metalness: 0,
        side: THREE.DoubleSide,
      }),
    );
    const buckleMat = h.trackMat(
      new THREE.MeshStandardMaterial({
        color: "#8D9AA8",
        normalMap: metalSet.normalMap ?? null,
        roughness: 0.28,
        metalness: 0.85,
      }),
    );

    const body = new THREE.Mesh(bodyGeom, bodyMat);
    const pocket = new THREE.Mesh(pocketGeom, accentMat);
    const zipBar = new THREE.Mesh(buckleGeom, buckleMat);
    zipBar.position.set(0, 1.56, spec.depth * 0.52 + 0.12);

    const strapL = new THREE.Mesh(makeStrapGeom(-1), accentMat);
    const strapR = new THREE.Mesh(makeStrapGeom(1), accentMat);
    const loop = new THREE.Mesh(loopGeom, accentMat);

    group.add(body, pocket, zipBar, strapL, strapR, loop);
    return group;
  });
}

function createRugProduct(lowDetail = false): ProductHandle {
  return makeTrackedProduct("rug", (h) => {
    const group = new THREE.Group();
    const woolSet = h.trackSet(makeFabricPbrSet("wool", 256, 3, 4));
    const woodSet = h.trackSet(makeWoodGrainSet(256, 1, 1));
    const cottonSet = h.trackSet(makeFabricPbrSet("cotton", 256, 1, 1));

    // Gulungan karpet wol dengan sedikit kompresi empuk di sabuk pengikat tengah
    const rSegs = lowDetail ? 12 : 20;
    const hSegs = lowDetail ? 10 : 16;
    const cylGeom = h.trackGeom(new THREE.CylinderGeometry(0.55, 0.56, 3.2, rSegs, hSegs));
    const pos = cylGeom.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const px = pos.getX(i);
      const py = pos.getY(i) + 1.6; // 0..3.2
      const pz = pos.getZ(i);
      const tieCinch = Math.exp(-Math.pow((py - 1.55) / 0.24, 2));
      const scaleR = 1 - 0.055 * tieCinch + 0.014 * Math.sin(py * 5.2);
      pos.setXYZ(i, px * scaleR, py, pz * scaleR);
    }
    cylGeom.computeVertexNormals();

    const coreGeom = h.trackGeom(new THREE.CylinderGeometry(0.18, 0.18, 3.22, 10));
    const strapGeom = h.trackGeom(new THREE.TorusGeometry(0.525, 0.036, 7, rSegs));

    const bodyMat = h.trackMat(
      new THREE.MeshStandardMaterial({
        color: PRODUCT_SPECS.rug.color,
        map: woolSet.map ?? null,
        normalMap: woolSet.normalMap ?? null,
        normalScale: new THREE.Vector2(0.65, 0.65),
        roughnessMap: woolSet.roughnessMap ?? null,
        roughness: 0.88,
        metalness: 0,
      }),
    );
    const coreMat = h.trackMat(
      new THREE.MeshStandardMaterial({
        color: "#7E6045",
        map: woodSet.map ?? null,
        normalMap: woodSet.normalMap ?? null,
        roughness: 0.72,
      }),
    );
    const strapMat = h.trackMat(
      new THREE.MeshStandardMaterial({
        color: "#2D5A52",
        normalMap: cottonSet.normalMap ?? null,
        roughness: 0.82,
      }),
    );

    const cyl = new THREE.Mesh(cylGeom, bodyMat);
    const core = new THREE.Mesh(coreGeom, coreMat);
    core.position.set(0, 1.6, 0);
    const tieStrap = new THREE.Mesh(strapGeom, strapMat);
    tieStrap.position.set(0, 1.55, 0);
    tieStrap.rotation.x = Math.PI * 0.5;

    group.add(cyl, core, tieStrap);
    return group;
  });
}

function createBenchProduct(): ProductHandle {
  return makeTrackedProduct("bench", (h) => {
    const group = new THREE.Group();
    const woodSet = h.trackSet(makeWoodGrainSet(256, 2, 1));
    const metalSet = h.trackSet(makeBrushedMetalSet(256, 1, 1));

    const seatGeom = h.trackGeom(new RoundedBoxGeometry(3.4, 0.16, 0.52, 2, 0.03));
    const backGeom = h.trackGeom(new RoundedBoxGeometry(3.4, 0.56, 0.16, 2, 0.03));
    const legGeom = h.trackGeom(new THREE.BoxGeometry(0.24, 0.78, 1.08));

    const woodMat = h.trackMat(
      new THREE.MeshStandardMaterial({
        color: "#C29C76",
        map: woodSet.map ?? null,
        normalMap: woodSet.normalMap ?? null,
        normalScale: new THREE.Vector2(0.55, 0.55),
        roughnessMap: woodSet.roughnessMap ?? null,
        roughness: 0.64,
        metalness: 0,
      }),
    );
    const frameMat = h.trackMat(
      new THREE.MeshStandardMaterial({
        color: "#27373E",
        normalMap: metalSet.normalMap ?? null,
        roughnessMap: metalSet.roughnessMap ?? null,
        roughness: 0.38,
        metalness: 0.72,
      }),
    );

    const frontSeat = new THREE.Mesh(seatGeom, woodMat);
    frontSeat.position.set(0, 0.82, 0.28);
    const backSeat = new THREE.Mesh(seatGeom, woodMat);
    backSeat.position.set(0, 0.82, -0.28);
    const backrest = new THREE.Mesh(backGeom, woodMat);
    backrest.position.set(0, 1.32, -0.52);

    const legL = new THREE.Mesh(legGeom, frameMat);
    legL.position.set(-1.35, 0.39, 0);
    const legR = new THREE.Mesh(legGeom, frameMat);
    legR.position.set(1.35, 0.39, 0);

    // Kayu & kaki metal tetap rigid (tanpa flutter), indeks children[0..4] dipertahankan
    group.add(frontSeat, backSeat, backrest, legL, legR);
    return group;
  });
}

function createPotProduct(): ProductHandle {
  return makeTrackedProduct("pot", (h) => {
    const group = new THREE.Group();
    const ceramicSet = h.trackSet(makeCeramicGlazeSet(256));

    const pts = [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(0.5, 0),
      new THREE.Vector2(0.76, 1.45),
      new THREE.Vector2(0.8, 1.72),
      new THREE.Vector2(0.72, 1.8),
      new THREE.Vector2(0.64, 1.8),
      new THREE.Vector2(0.58, 1.45),
      new THREE.Vector2(0, 1.45),
    ];
    const potGeom = h.trackGeom(new THREE.LatheGeometry(pts, 16));
    const soilGeom = h.trackGeom(new THREE.CylinderGeometry(0.62, 0.58, 0.08, 14));
    const leafGeom = h.trackGeom(new THREE.ConeGeometry(0.26, 1.1, 8));

    const potMat = h.trackMat(
      new THREE.MeshStandardMaterial({
        color: PRODUCT_SPECS.pot.color,
        map: ceramicSet.map ?? null,
        normalMap: ceramicSet.normalMap ?? null,
        roughnessMap: ceramicSet.roughnessMap ?? null,
        roughness: 0.42,
        metalness: 0.04,
      }),
    );
    const soilMat = h.trackMat(
      new THREE.MeshStandardMaterial({
        color: "#3B2D22",
        roughness: 0.94,
        metalness: 0,
      }),
    );
    const leafMat = h.trackMat(
      new THREE.MeshStandardMaterial({
        color: "#3A7459",
        roughness: 0.54,
        metalness: 0.02,
      }),
    );

    const potMesh = new THREE.Mesh(potGeom, potMat);
    const soilMesh = new THREE.Mesh(soilGeom, soilMat);
    soilMesh.position.set(0, 1.46, 0);
    group.add(potMesh, soilMesh);

    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const leaf = new THREE.Mesh(leafGeom, leafMat);
      leaf.position.set(Math.cos(angle) * 0.24, 2.0, Math.sin(angle) * 0.24);
      leaf.rotation.z = -Math.cos(angle) * 0.42;
      leaf.rotation.x = Math.sin(angle) * 0.42;
      group.add(leaf);
    }
    return group;
  });
}

function createFleeceProduct(lowDetail = false): ProductHandle {
  return makeTrackedProduct("fleece", (h) => {
    const group = new THREE.Group();
    const fleeceSet = h.trackSet(makeFabricPbrSet("fleece", 256, 6, 8));
    const metalSet = h.trackSet(makeBrushedMetalSet(256, 1, 1));
    const woodSet = h.trackSet(makeWoodGrainSet(256, 1, 1));

    const bodyMat = h.trackMat(
      new THREE.MeshStandardMaterial({
        color: PRODUCT_SPECS.fleece.color,
        map: fleeceSet.map ?? null,
        normalMap: fleeceSet.normalMap ?? null,
        normalScale: new THREE.Vector2(0.18, 0.18),
        roughnessMap: fleeceSet.roughnessMap ?? null,
        roughness: 0.98,
        metalness: 0,
        side: THREE.DoubleSide,
      }),
    );
    const trimMat = h.trackMat(
      new THREE.MeshStandardMaterial({
        color: "#29544F",
        map: fleeceSet.map ?? null,
        normalMap: fleeceSet.normalMap ?? null,
        normalScale: new THREE.Vector2(0.2, 0.2),
        roughness: 0.92,
        metalness: 0,
      }),
    );
    const linerMat = h.trackMat(
      new THREE.MeshStandardMaterial({
        color: "#1B3835",
        roughness: 0.95,
        metalness: 0,
        side: THREE.DoubleSide,
      }),
    );
    const zipMat = h.trackMat(
      new THREE.MeshStandardMaterial({
        color: "#6E808B",
        normalMap: metalSet.normalMap ?? null,
        roughness: 0.3,
        metalness: 0.82,
      }),
    );
    const woodMat = h.trackMat(
      new THREE.MeshStandardMaterial({
        color: "#8A6A4C",
        map: woodSet.map ?? null,
        normalMap: woodSet.normalMap ?? null,
        roughness: 0.65,
        metalness: 0,
      }),
    );

    const fleeceTorsoSpec: GarmentTorsoSpec = {
      hemY: 0.22,
      armpitY: 2.1,
      shoulderY: 2.86,
      neckSideY: 3.16,
      neckFrontDip: 0.16,
      neckBackDip: 0.05,
      hemRx: 0.96,
      waistRx: 0.93,
      chestRx: 1.0,
      shoulderRx: 0.9,
      neckRx: 0.37,
      hemRz: 0.31,
      chestRz: 0.3,
      neckRz: 0.17,
      hemSag: 0.048,
      foldAmp: 0.072,
      foldFreq: 3,
      pleatSkew: 0.65,
      flutterAmp: 0.0022,
      isJacket: true,
    };

    const torso = buildDrapedTorsoGeometry(fleeceTorsoSpec, lowDetail);
    h.trackGeom(torso.geom);
    h.trackFlutter(torso.geom, torso.weights, 0.0022, 1.7, 1.05);
    const body = new THREE.Mesh(torso.geom, bodyMat);
    body.name = "Product_fleece_torso";

    // Kerah berdiri jaket fleece yang sedikit terbuka di depan atas
    const collarSegs = lowDetail ? 10 : 16;
    const collarGeom = h.trackGeom(
      new THREE.CylinderGeometry(0.38, 0.36, 0.24, collarSegs, 1, true, 0.25, Math.PI * 2 - 0.5),
    );
    const collarMesh = new THREE.Mesh(collarGeom, trimMat);
    collarMesh.position.set(0, 3.16, -0.01);
    collarMesh.scale.set(1, 1, 0.48);

    const innerNeckGeom = h.trackGeom(
      new THREE.CylinderGeometry(0.33, 0.37, 0.34, lowDetail ? 8 : 14, 1, true),
    );
    const innerNeck = new THREE.Mesh(innerNeckGeom, linerMat);
    innerNeck.position.set(0, 3.0, -0.01);
    innerNeck.scale.set(1, 1, 0.44);

    // Ritsleting logam melengkung mengikuti kontur dada & perut depan jaket
    const zipPts: THREE.Vector3[] = [];
    const zipSteps = 10;
    for (let i = 0; i <= zipSteps; i++) {
      const v = 0.04 + (i / zipSteps) * 0.87;
      const y = THREE.MathUtils.lerp(0.24, 3.02, v);
      const rz = THREE.MathUtils.lerp(0.31, 0.29, smoothstep(0, 0.7, v));
      const chestCurve = 0.018 * Math.sin(Math.PI * clamp01((v - 0.15) / 0.73));
      const fold = 0.072 * Math.pow(1 - v, 1.25) * Math.sin(3 * (Math.PI * 0.5) + 0.35);
      zipPts.push(new THREE.Vector3(0, y, rz + chestCurve + fold - 0.01));
    }
    const zipCurve = new THREE.CatmullRomCurve3(zipPts);
    const zipGeom = h.trackGeom(new THREE.TubeGeometry(zipCurve, 10, 0.024, 5, false));
    const zip = new THREE.Mesh(zipGeom, zipMat);

    // Kepala tarik ritsleting dekat atas dada
    const pullGeom = h.trackGeom(new THREE.BoxGeometry(0.05, 0.11, 0.04));
    const pull = new THREE.Mesh(pullGeom, zipMat);
    const topZipPt = zipPts[zipPts.length - 1]!;
    pull.position.set(0, topZipPt.y - 0.08, topZipPt.z + 0.03);
    pull.rotation.x = 0.18;

    // Manset pinggang rib di tepi bawah jaket
    const hemPts: THREE.Vector3[] = [];
    const hemSteps = lowDetail ? 12 : 20;
    for (let i = 0; i <= hemSteps; i++) {
      const t = (i / hemSteps) * Math.PI * 2;
      const cosT = Math.cos(t);
      const sinT = Math.sin(t);
      const absCos = Math.abs(cosT);
      const sag = -0.048 * (1 - absCos * absCos);
      const zFold =
        0.072 *
        Math.sin(3 * t + 0.65 * Math.sign(cosT || 1) + 0.35) *
        (0.38 + 0.62 * Math.abs(sinT)) *
        (sinT >= 0 ? 1 : -1);
      hemPts.push(new THREE.Vector3(0.95 * cosT, 0.24 + sag, 0.3 * sinT + zFold));
    }
    const hemCurve = new THREE.CatmullRomCurve3(hemPts, true);
    const hemGeom = h.trackGeom(
      new THREE.TubeGeometry(hemCurve, lowDetail ? 14 : 20, 0.042, 5, true),
    );
    const hemMesh = new THREE.Mesh(hemGeom, trimMat);

    group.add(body, collarMesh, innerNeck, zip, pull, hemMesh);

    // Lengan panjang jaket fleece tersambung utuh ke lubang bahu & jatuh alami ke manset rib
    const buildLongSleeve = (side: -1 | 1, phase: number) => {
      const s = buildDrapedSleeveGeometry(
        {
          side,
          torsoSpec: fleeceTorsoSpec,
          armpitV: 0.695,
          shoulderV: 0.875,
          seamInset: 0.034,
          armholeDepthAngle: 0.76,
          shoulderExitAngle: 0.56,
          length: 1.72,
          droopAngle: 1.22,
          elbowBendZ: 0.09,
          baseRy: 0.34,
          cuffRy: 0.19,
          baseRz: 0.24,
          cuffRz: 0.16,
          foldAmp: 0.042,
          gravityDrop: 0.14,
        },
        lowDetail,
      );
      h.trackGeom(s.geom);
      h.trackFlutter(s.geom, s.weights, 0.0022, phase, 1.1);
      const sleeveMesh = new THREE.Mesh(s.geom, bodyMat);
      sleeveMesh.name = side < 0 ? "Product_fleece_sleeve_L" : "Product_fleece_sleeve_R";

      const cuffSteps = lowDetail ? 10 : 16;
      const cuffPts: THREE.Vector3[] = [];
      const cuffCenter = new THREE.Vector3();
      for (let i = 0; i < cuffSteps; i++) {
        const pt = s.evaluator.evalRing(i / cuffSteps, 1);
        const v3 = new THREE.Vector3(pt.x, pt.y, pt.z);
        cuffPts.push(v3);
        cuffCenter.add(v3);
      }
      cuffCenter.divideScalar(cuffSteps);

      const cuffCurve = new THREE.CatmullRomCurve3(cuffPts, true);
      const cuffGeom = h.trackGeom(
        new THREE.TubeGeometry(cuffCurve, lowDetail ? 12 : 20, 0.034, 5, true),
      );
      const cuffMesh = new THREE.Mesh(cuffGeom, trimMat);

      const endTan = s.evaluator.spineCurve.getTangent(1).normalize();
      const innerPositions: number[] = [];
      const innerIndices: number[] = [];
      const insetCenter = cuffCenter.clone().addScaledVector(endTan, -0.03);
      innerPositions.push(insetCenter.x, insetCenter.y, insetCenter.z);
      for (let i = 0; i < cuffSteps; i++) {
        const p = cuffPts[i]!;
        const shrunk = new THREE.Vector3()
          .lerpVectors(cuffCenter, p, 0.94)
          .addScaledVector(endTan, -0.024);
        innerPositions.push(shrunk.x, shrunk.y, shrunk.z);
      }
      for (let i = 0; i < cuffSteps; i++) {
        innerIndices.push(0, 1 + i, 1 + ((i + 1) % cuffSteps));
      }
      const cuffInnerGeom = new THREE.BufferGeometry();
      cuffInnerGeom.setAttribute("position", new THREE.Float32BufferAttribute(innerPositions, 3));
      cuffInnerGeom.setIndex(innerIndices);
      cuffInnerGeom.computeVertexNormals();
      h.trackGeom(cuffInnerGeom);
      const cuffInner = new THREE.Mesh(cuffInnerGeom, linerMat);

      group.add(sleeveMesh, cuffMesh, cuffInner);
    };
    buildLongSleeve(-1, 2.1);
    buildLongSleeve(1, 3.3);

    addGarmentStand(group, h, zipMat, woodMat, {
      standTopY: 3.76,
      hangerCenterY: 3.12,
      shoulderEndY: 2.76,
      shoulderHalfW: 0.82,
      standBackZ: -0.38,
      lowDetail,
    });
    return group;
  });
}

export class Products {
  readonly group = new THREE.Group();
  readonly items: readonly ProductHandle[];

  private readonly byId: Record<ProductId, ProductHandle>;
  private readonly shelfTopY: number;
  private lowDetail: boolean;
  private dimFactor = 1;
  private compactMode = false;

  constructor(parent: THREE.Object3D, shelfTopY = 0.76, lowDetail = false) {
    this.group.name = "O-PRODUCTS";
    this.shelfTopY = shelfTopY;
    this.lowDetail = lowDetail;

    const built = this.buildAll(lowDetail);
    this.byId = built;
    this.items = PRODUCT_ORDER.map((id) => built[id]);

    this.layoutAll();
    parent.add(this.group);
  }

  private buildAll(lowDetail: boolean): Record<ProductId, ProductHandle> {
    return {
      tote: createToteProduct(lowDetail),
      tee: createTeeProduct(lowDetail),
      backpack: createBackpackProduct(lowDetail),
      rug: createRugProduct(lowDetail),
      bench: createBenchProduct(),
      pot: createPotProduct(),
      fleece: createFleeceProduct(lowDetail),
    };
  }

  private layoutAll(): void {
    for (const item of this.items) {
      const spec = PRODUCT_SPECS[item.id];
      item.group.position.set(spec.x, this.shelfTopY, 0);
      item.group.visible = this.compactMode ? spec.portraitVisible : true;
      item.setDim(this.dimFactor);
      this.group.add(item.group);
    }
  }

  setQuality(
    lowOrConfig: boolean | "high" | "medium" | "low" | { tier: "high" | "medium" | "low" },
  ): void {
    const nextLow =
      typeof lowOrConfig === "boolean"
        ? lowOrConfig
        : typeof lowOrConfig === "string"
          ? lowOrConfig === "low"
          : lowOrConfig.tier === "low";
    if (nextLow === this.lowDetail) return;
    this.lowDetail = nextLow;

    for (const item of this.items) {
      item.dispose();
    }
    const rebuilt = this.buildAll(nextLow);
    this.byId.tote = rebuilt.tote;
    this.byId.tee = rebuilt.tee;
    this.byId.backpack = rebuilt.backpack;
    this.byId.rug = rebuilt.rug;
    this.byId.bench = rebuilt.bench;
    this.byId.pot = rebuilt.pot;
    this.byId.fleece = rebuilt.fleece;
    (this.items as ProductHandle[]).splice(
      0,
      this.items.length,
      ...PRODUCT_ORDER.map((id) => rebuilt[id]),
    );
    this.layoutAll();
  }

  getProduct(id: ProductId): ProductHandle {
    return this.byId[id];
  }

  setDim(factor: number): void {
    this.dimFactor = clamp01(factor);
    for (const item of this.items) {
      item.setDim(this.dimFactor);
    }
  }

  /** Update flutter lembut berbasis waktu saja (non-aktif pada tier LOW atau reducedMotion). */
  updateFlutter(timeSec: number, enabled = true): void {
    const active = enabled && !this.lowDetail;
    for (const item of this.items) {
      item.updateFlutter?.(timeSec, active);
    }
  }

  /** Pada mode HP portrait, hanya 5 produk tampil (tanpa backpack dan fleece). */
  setCompactMode(compact: boolean): void {
    this.compactMode = compact;
    for (const item of this.items) {
      const spec = PRODUCT_SPECS[item.id];
      item.group.visible = compact ? spec.portraitVisible : true;
    }
  }

  reset(): void {
    this.group.visible = true;
    this.dimFactor = 1;
    this.setDim(1);
    for (const item of this.items) {
      item.reset();
      const spec = PRODUCT_SPECS[item.id];
      item.group.position.set(spec.x, this.shelfTopY, 0);
    }
  }

  dispose(): void {
    this.group.removeFromParent();
    for (const item of this.items) {
      item.dispose();
    }
  }
}
