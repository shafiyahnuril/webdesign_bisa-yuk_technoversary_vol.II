import * as THREE from "three";
import {
  createParticleMaterial,
  type ParticleMaterialHandle,
} from "../materials/particle-material";
import { QUALITY_PRESETS, type QualityConfig } from "../quality";
import type { SharedObjectHandle, StageContext } from "../stage";
import { clamp01, lerp, smoothstep } from "../util/math";
import { createRng, rngRange } from "../util/rng";
import { BOTTLE_PROFILE } from "./bottle";

export const MAX_PARTICLES = 2400;
const TWO_PI = Math.PI * 2;

export interface ParticleParams {
  breakAmt: number;
  flow: number;
  settle: number;
  time: number;
  fade: number;
  sizeScale: number;
  attract: readonly [THREE.Vector3, THREE.Vector3, THREE.Vector3];
}

function sampleProfileRadius(y: number): number {
  for (let i = 0; i < BOTTLE_PROFILE.length - 1; i++) {
    const [r0, y0] = BOTTLE_PROFILE[i]!;
    const [r1, y1] = BOTTLE_PROFILE[i + 1]!;
    if (y >= y0 && y <= y1) {
      const span = y1 - y0;
      const k = span > 0 ? (y - y0) / span : 0;
      return lerp(r0, r1, k);
    }
  }
  return 0.126;
}

/**
 * Menghitung posisi partikel mikroplastik secara deterministik (bukan integrasi Euler),
 * identik dengan vertex shader GLSL sehingga gulir mundur & rewind selalu persis.
 */
export function computeParticlePosition(
  seed: THREE.Vector3,
  rand: THREE.Vector4,
  state: ParticleParams,
  out: THREE.Vector3 = new THREE.Vector3(),
): THREE.Vector3 {
  const outX = seed.x;
  const outY = (seed.y - 1.0) * 0.35;
  const outZ = seed.z;
  const outLen = Math.hypot(outX, outY, outZ);
  const radX = outLen > 0.0001 ? outX / outLen : 0;
  const radY = outLen > 0.0001 ? outY / outLen : 1;
  const radZ = outLen > 0.0001 ? outZ / outLen : 0;

  const t = state.time;
  const curlX =
    Math.sin(seed.y * 3.1 + t * 0.7 + rand.x * TWO_PI) * 0.45 +
    Math.cos(t * 0.4 + rand.y * TWO_PI) * 0.25;
  const curlY =
    Math.cos(seed.x * 3.7 + t * 0.6 + rand.y * TWO_PI) * 0.35 +
    Math.sin(t * 0.5 + rand.z * TWO_PI) * 0.2;
  const curlZ =
    Math.sin(seed.z * 3.3 - t * 0.65 + rand.z * TWO_PI) * 0.45 +
    Math.cos(t * 0.35 + rand.w * TWO_PI) * 0.25;

  const spread = 0.75 + 2.2 * rand.w;
  const driftX = seed.x + (radX * spread + curlX) * state.breakAmt;
  const driftY = seed.y + (radY * spread + curlY) * state.breakAmt;
  const driftZ = seed.z + (radZ * spread + curlZ) * state.breakAmt;

  const fishIdx = Math.floor(rand.w * 3) % 3;
  const targetFish = state.attract[fishIdx] ?? state.attract[0];
  const funScale = (1 - state.flow) * 0.45;
  const funX = Math.cos(rand.x * TWO_PI + state.flow * 5.0) * funScale;
  const funY = Math.sin(rand.y * TWO_PI + state.flow * 4.0) * 0.5 * funScale;
  const funZ = Math.sin(rand.x * TWO_PI + state.flow * 5.0) * funScale;

  const flowMix = smoothstep(0, 1, state.flow);
  const flowX = lerp(driftX, targetFish.x + funX, flowMix);
  const flowY = lerp(driftY, targetFish.y + funY, flowMix);
  const flowZ = lerp(driftZ, targetFish.z + funZ, flowMix);

  const r = Math.sqrt(clamp01(rand.x));
  const ang = rand.y * TWO_PI;
  const filletX = Math.cos(ang) * r * 1.05;
  const filletY = 0.24 + rand.z * 0.08;
  const filletZ = Math.sin(ang) * r * 0.42;

  const settleMix = smoothstep(0, 1, state.settle);
  return out.set(
    lerp(flowX, filletX, settleMix),
    lerp(flowY, filletY, settleMix),
    lerp(flowZ, filletZ, settleMix),
  );
}

function buildParticlesGeometry(): THREE.BufferGeometry {
  const rng = createRng(512);
  const positions = new Float32Array(MAX_PARTICLES * 3);
  const seeds = new Float32Array(MAX_PARTICLES * 3);
  const rands = new Float32Array(MAX_PARTICLES * 4);
  const sizes = new Float32Array(MAX_PARTICLES);

  for (let i = 0; i < MAX_PARTICLES; i++) {
    // Urutan golden-ratio agar pemangkasan drawRange (800/1400/2400) tetap merata di seluruh botol
    const frac = (((i * 0.61803398875) % 1) + 1) % 1;
    const y = lerp(0.05, 1.88, frac);
    const radius = sampleProfileRadius(y) * rngRange(rng, 0.9, 1.0);
    const theta = rngRange(rng, 0, TWO_PI);
    const sx = radius * Math.sin(theta);
    const sz = radius * Math.cos(theta);

    const i3 = i * 3;
    positions[i3] = sx;
    positions[i3 + 1] = y;
    positions[i3 + 2] = sz;
    seeds[i3] = sx;
    seeds[i3 + 1] = y;
    seeds[i3 + 2] = sz;

    const i4 = i * 4;
    rands[i4] = rng();
    rands[i4 + 1] = rng();
    rands[i4 + 2] = rng();
    rands[i4 + 3] = rng();

    sizes[i] = rngRange(rng, 2.0, 6.0);
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geom.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 3));
  geom.setAttribute("aRand", new THREE.BufferAttribute(rands, 4));
  geom.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  geom.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 1, 0), 12);
  return geom;
}

/**
 * Sistem partikel mikroplastik tunggal (THREE.Points + ShaderMaterial):
 * 2400 (HIGH), 1400 (MEDIUM), 800 (LOW). Dipakai di B5, B6, dan Punchline.
 */
export class Particles implements SharedObjectHandle {
  readonly group = new THREE.Group();
  readonly points: THREE.Points;
  readonly material: THREE.ShaderMaterial;

  private readonly matHandle: ParticleMaterialHandle;
  private _activeCount: number;
  private readonly state: ParticleParams;

  constructor(parent: THREE.Object3D, quality: QualityConfig = QUALITY_PRESETS.high) {
    this.group.name = "O-PARTICLES";
    parent.add(this.group);

    this.matHandle = createParticleMaterial();
    this.material = this.matHandle.material;
    this.state = {
      breakAmt: 0,
      flow: 0,
      settle: 0,
      time: 0,
      fade: 1,
      sizeScale: 1,
      attract: this.matHandle.attract,
    };

    const geom = buildParticlesGeometry();
    this._activeCount = Math.min(MAX_PARTICLES, quality.particles);
    geom.setDrawRange(0, this._activeCount);

    this.points = new THREE.Points(geom, this.material);
    this.points.name = "MicroplasticPoints";
    this.points.frustumCulled = false;
    this.group.add(this.points);
    this.group.visible = false;
  }

  get activeCount(): number {
    return this._activeCount;
  }

  getState(): Readonly<ParticleParams> {
    return this.state;
  }

  setParams(
    patch: Partial<
      Omit<ParticleParams, "attract"> & {
        color?: THREE.ColorRepresentation;
        attract?: readonly THREE.Vector3[];
      }
    >,
  ): void {
    const u = this.material.uniforms;
    if (patch.breakAmt !== undefined) {
      this.state.breakAmt = clamp01(patch.breakAmt);
      u.uBreak!.value = this.state.breakAmt;
    }
    if (patch.flow !== undefined) {
      this.state.flow = clamp01(patch.flow);
      u.uFlow!.value = this.state.flow;
    }
    if (patch.settle !== undefined) {
      this.state.settle = clamp01(patch.settle);
      u.uSettle!.value = this.state.settle;
    }
    if (patch.time !== undefined) {
      this.state.time = patch.time;
      u.uTime!.value = patch.time;
    }
    if (patch.fade !== undefined) {
      this.state.fade = clamp01(patch.fade);
      u.uFade!.value = this.state.fade;
    }
    if (patch.sizeScale !== undefined) {
      this.state.sizeScale = Math.max(0.5, patch.sizeScale);
      u.uSizeScale!.value = this.state.sizeScale;
    }
    if (patch.color !== undefined) {
      (u.uColor!.value as THREE.Color).set(patch.color);
    }
    if (patch.attract !== undefined) {
      for (let i = 0; i < 3; i++) {
        const src = patch.attract[i];
        if (src) this.matHandle.attract[i]!.copy(src);
      }
    }
  }

  setAttractTarget(index: 0 | 1 | 2, pos: THREE.Vector3): void {
    this.matHandle.attract[index].copy(pos);
  }

  setQuality(config: QualityConfig): void {
    this._activeCount = Math.min(MAX_PARTICLES, config.particles);
    this.points.geometry.setDrawRange(0, this._activeCount);
  }

  reset(): void {
    this.group.visible = false;
    this.group.position.set(0, 0, 0);
    this.group.rotation.set(0, 0, 0);
    this.group.scale.set(1, 1, 1);
    this.setParams({
      breakAmt: 0,
      flow: 0,
      settle: 0,
      time: 0,
      fade: 1,
      sizeScale: 1,
      color: "#E6EAF2",
    });
  }

  dispose(): void {
    this.group.removeFromParent();
    this.points.geometry.dispose();
    this.matHandle.dispose();
  }
}

/**
 * Mengambil atau membuat & mendaftarkan sistem Particles bersama pada key `'particles'`.
 */
export function ensureParticles(ctx: StageContext): Particles {
  const existing = ctx.shared.get<Particles>("particles");
  if (existing) return existing;
  const particles = new Particles(ctx.scene, ctx.qualityConfig);
  return ctx.shared.register("particles", particles);
}
