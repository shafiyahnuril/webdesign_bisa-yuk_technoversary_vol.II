import * as THREE from "three";
import { clamp01, degToRad, lerp } from "./math";

/** Batas kemiringan normal gelombang default relatif terhadap orientasi apung dasar (±5°). */
export const DEFAULT_MAX_BUOYANCY_TILT_RAD = degToRad(5.0);

export interface BuoyancyOptions {
  /** Frekuensi alami redaman kritis posisi Y (rad/s). */
  posOmega?: number;
  /** Frekuensi respons slerp kemiringan gelombang (1/s). */
  tiltRate?: number;
  /** Frekuensi respons slerp orientasi dasar (1/s). */
  baseRotRate?: number;
  /** Ambang loncatan t lokal untuk mereset state dan snap deterministik. */
  largeJumpT?: number;
  /** Ambang loncatan posisi XZ (unit dunia) untuk mereset state dan snap deterministik. */
  largeJumpDist?: number;
  /** Ambang dt terlalu besar (mis. jeda tab) untuk mereset state dan snap aman. */
  maxStepDt?: number;
}

export interface BuoyancyStepInput {
  /** Progres lokal scene t dalam rentang [0, 1]. */
  t: number;
  /** Delta waktu frame dalam detik; nilai <= 0 memicu snap deterministik. */
  dt: number;
  /** Posisi X dunia target. */
  x: number;
  /** Posisi Z dunia target. */
  z: number;
  /** Tinggi permukaan air CPU (unit dunia) sesudah uniform air diperbarui. */
  waterY: number;
  /** Vektor normal permukaan air CPU sesudah uniform air diperbarui. */
  waterNormal: THREE.Vector3;
  /** Orientasi apung dasar (tanpa kemiringan ombak). */
  baseQuat: THREE.Quaternion;
  /** Kedalaman celup ekuilibrium di bawah waterY (default 0.12). */
  draft?: number;
  /** Batas maksimum kedalaman celup di bawah waterY agar botol tidak menembus ombak. */
  maxSubmerge?: number;
  /** Batas sudut kemiringan maksimum dari orientasi dasar dalam radian (default ±5°). */
  maxTiltRad?: number;
  /** Bobot transisi dari pose keyframe ke apung kontinu [0..1] (default 1). */
  keyframeBlend?: number;
  /** Posisi Y keyframe opsional (mis. fase jatuh awal B3). */
  keyframeY?: number;
  /** Orientasi keyframe opsional (mis. fase jatuh awal B3). */
  keyframeQuat?: THREE.Quaternion;
}

export interface BuoyancyPose {
  readonly y: number;
  readonly vy: number;
  readonly quat: THREE.Quaternion;
  readonly snapped: boolean;
}

/**
 * Pengontrol buoyancy teredam berbasis informasi fisik (tanpa simulasi 3D penuh & tanpa RAF/ticker).
 * Menginterpolasi positionY dengan pegas teredam kritis analitik dan orientasi roll/pitch via slerp
 * yang dibatasi ±4–6° dari orientasi dasar, dengan snap deterministik saat dt <= 0 atau loncatan.
 */
export class BuoyancyController {
  private readonly posOmega: number;
  private readonly tiltRate: number;
  private readonly baseRotRate: number;
  private readonly largeJumpT: number;
  private readonly largeJumpDist: number;
  private readonly maxStepDt: number;

  private initialized = false;
  private prevT = 0;
  private prevX = 0;
  private prevZ = 0;
  private prevWaterY = 0;
  private y = 0;
  private vy = 0;

  private readonly tiltQuat = new THREE.Quaternion();
  private readonly baseQuat = new THREE.Quaternion();
  private readonly outQuat = new THREE.Quaternion();

  private readonly normVec = new THREE.Vector3();
  private readonly tiltAxis = new THREE.Vector3();
  private readonly targetTiltQuat = new THREE.Quaternion();
  private readonly targetBaseQuat = new THREE.Quaternion();

  constructor(options: BuoyancyOptions = {}) {
    this.posOmega = options.posOmega ?? 9.5;
    this.tiltRate = options.tiltRate ?? 6.5;
    this.baseRotRate = options.baseRotRate ?? 18.0;
    this.largeJumpT = options.largeJumpT ?? 0.05;
    this.largeJumpDist = options.largeJumpDist ?? 0.75;
    this.maxStepDt = options.maxStepDt ?? 0.25;
  }

  /** Mengosongkan semua state inersia (dipanggil pada enter, exit, atau loop reset). */
  reset(): void {
    this.initialized = false;
    this.prevT = 0;
    this.prevX = 0;
    this.prevZ = 0;
    this.prevWaterY = 0;
    this.y = 0;
    this.vy = 0;
    this.tiltQuat.identity();
    this.baseQuat.identity();
    this.outQuat.identity();
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  step(input: BuoyancyStepInput): BuoyancyPose {
    const draft = input.draft ?? 0.12;
    const maxSubmerge = Math.max(draft, input.maxSubmerge ?? draft + 0.04);
    const maxTiltRad = Math.max(0, input.maxTiltRad ?? DEFAULT_MAX_BUOYANCY_TILT_RAD);
    const blend = input.keyframeBlend === undefined ? 1 : clamp01(input.keyframeBlend);

    const floatY = input.waterY - draft;
    const targetY =
      input.keyframeY !== undefined && blend < 1 ? lerp(input.keyframeY, floatY, blend) : floatY;

    if (input.keyframeQuat !== undefined && blend < 1) {
      this.targetBaseQuat.copy(input.keyframeQuat).slerp(input.baseQuat, blend);
    } else {
      this.targetBaseQuat.copy(input.baseQuat);
    }

    // Normalisasi aman & batas sudut kemiringan gelombang terhadap sumbu +Y dunia
    const nx = input.waterNormal.x;
    const ny = input.waterNormal.y;
    const nz = input.waterNormal.z;
    const len = Math.hypot(nx, ny, nz);
    if (len > 1e-6) {
      this.normVec.set(nx / len, ny / len, nz / len);
    } else {
      this.normVec.set(0, 1, 0);
    }

    const sinTheta = Math.hypot(this.normVec.x, this.normVec.z);
    if (sinTheta > 1e-6 && maxTiltRad > 0 && blend > 0) {
      const rawAngle = Math.atan2(sinTheta, Math.max(-1, Math.min(1, this.normVec.y)));
      const clampedAngle = Math.min(rawAngle, maxTiltRad) * blend;
      this.tiltAxis.set(this.normVec.z / sinTheta, 0, -this.normVec.x / sinTheta);
      this.targetTiltQuat.setFromAxisAngle(this.tiltAxis, clampedAngle);
    } else {
      this.targetTiltQuat.identity();
    }

    const dtValid = Number.isFinite(input.dt) && input.dt > 0;
    const jumpT = Math.abs(input.t - this.prevT) > this.largeJumpT;
    const jumpPos = Math.hypot(input.x - this.prevX, input.z - this.prevZ) > this.largeJumpDist;
    const jumpWater = Math.abs(input.waterY - this.prevWaterY) > 0.45;
    const largeDt = dtValid && input.dt > this.maxStepDt;

    const shouldSnap = !this.initialized || !dtValid || jumpT || jumpPos || jumpWater || largeDt;

    if (shouldSnap) {
      this.y = targetY;
      this.vy = 0;
      this.tiltQuat.copy(this.targetTiltQuat);
      this.baseQuat.copy(this.targetBaseQuat);
      this.outQuat.copy(this.tiltQuat).multiply(this.baseQuat);
      this.initialized = true;
      this.prevT = input.t;
      this.prevX = input.x;
      this.prevZ = input.z;
      this.prevWaterY = input.waterY;
      return { y: this.y, vy: this.vy, quat: this.outQuat, snapped: true };
    }

    const dt = input.dt;

    // Pegas teredam kritis analitik untuk positionY (tanpa overshoot saat target tetap)
    // Selama transisi dari drop keyframe (blend < 1), respons lebih sigap agar pose jatuh tidak tertinggal.
    const omega = blend < 1 ? lerp(24.0, this.posOmega, blend) : this.posOmega;
    const e = Math.exp(-omega * dt);
    const c1 = this.y - targetY;
    const c2 = this.vy + omega * c1;
    let nextY = targetY + (c1 + c2 * dt) * e;
    let nextVy = (this.vy - omega * c2 * dt) * e;

    // Cegah y menembus di bawah batas celup permukaan ombak saat mengapung
    const floatFloor = input.waterY - maxSubmerge;
    const floorY =
      input.keyframeY !== undefined && blend < 1
        ? lerp(Math.min(input.keyframeY, floatFloor), floatFloor, blend)
        : floatFloor;
    if (nextY < floorY) {
      nextY = floorY;
      if (nextVy < 0) nextVy = 0;
    }

    this.y = nextY;
    this.vy = nextVy;

    const tiltAlpha = 1 - Math.exp(-this.tiltRate * dt);
    const baseAlpha = 1 - Math.exp(-(blend < 1 ? lerp(26.0, this.baseRotRate, blend) : this.baseRotRate) * dt);
    this.tiltQuat.slerp(this.targetTiltQuat, tiltAlpha);
    this.baseQuat.slerp(this.targetBaseQuat, baseAlpha);
    this.outQuat.copy(this.tiltQuat).multiply(this.baseQuat);

    this.prevT = input.t;
    this.prevX = input.x;
    this.prevZ = input.z;
    this.prevWaterY = input.waterY;

    return { y: this.y, vy: this.vy, quat: this.outQuat, snapped: false };
  }
}
