import * as THREE from "three";
import {
  createWaterMaterial,
  GERSTNER_WAVES,
  WATER_MODE_PRESETS,
  type WaterMaterialHandle,
  type WaterMode,
} from "../materials/water-material";
import { QUALITY_PRESETS, type QualityConfig } from "../quality";
import type { SharedObjectHandle, StageContext } from "../stage";
import { clamp01, lerp } from "../util/math";

export { GERSTNER_WAVES, WATER_MODE_PRESETS };
export type { WaterMode };

export interface WaterParams {
  time: number;
  amplitude: number;
  speed: number;
  wavelengthScale: number;
  turbid: number;
  underwater: number;
  opacity: number;
  clean: number;
  sunIntensity: number;
  fogDensity: number;
}

export interface WaterSnapshot {
  readonly mode: WaterMode;
  readonly width: number;
  readonly depth: number;
  readonly visible: boolean;
  readonly position: THREE.Vector3;
  readonly params: WaterParams;
  readonly deepColor: THREE.Color;
  readonly shallowColor: THREE.Color;
  readonly turbidColor: THREE.Color;
  readonly skyColor: THREE.Color;
  readonly foamColor: THREE.Color;
  readonly fogColor: THREE.Color;
  readonly sunDir: THREE.Vector3;
  readonly modeValue: number;
}

const TWO_PI = Math.PI * 2;

function buildWaterGeometry(segments: number): THREE.BufferGeometry {
  const geom = new THREE.PlaneGeometry(1, 1, segments, segments);
  geom.rotateX(-Math.PI / 2);
  geom.boundingBox = new THREE.Box3(new THREE.Vector3(-65, -2, -65), new THREE.Vector3(65, 2, 65));
  geom.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 95);
  return geom;
}

const _tmpColorA = new THREE.Color();
const _tmpColorB = new THREE.Color();

/**
 * Sistem air bersama satu bidang (PlaneGeometry + ShaderMaterial multi-mode):
 * 0 = Sungai (40x14), 1 = Laut (120x120), 2 = Malam (120x120), 3 = Bersih (40x14 untuk kilas B7).
 */
export class WaterSystem implements SharedObjectHandle {
  readonly group = new THREE.Group();
  readonly mesh: THREE.Mesh;
  readonly material: THREE.ShaderMaterial;

  private readonly matHandle: WaterMaterialHandle;
  private segments: number;
  private mode: WaterMode = "river";
  private width: number = WATER_MODE_PRESETS.river.width;
  private depth: number = WATER_MODE_PRESETS.river.depth;
  private readonly params: WaterParams = {
    time: 0,
    amplitude: WATER_MODE_PRESETS.river.amplitude,
    speed: WATER_MODE_PRESETS.river.speed,
    wavelengthScale: WATER_MODE_PRESETS.river.wavelengthScale,
    turbid: 0,
    underwater: 0,
    opacity: 1,
    clean: 0,
    sunIntensity: 0,
    fogDensity: 0,
  };

  private readonly _tmpPos = new THREE.Vector3();
  private readonly _tmpNorm = new THREE.Vector3();

  constructor(parent: THREE.Object3D, quality: QualityConfig = QUALITY_PRESETS.high) {
    this.segments = quality.waterSegments;
    this.group.name = "O-WATER";
    parent.add(this.group);

    this.matHandle = createWaterMaterial(quality.caustics, quality.tier === "low");
    this.material = this.matHandle.material;

    const geom = buildWaterGeometry(this.segments);
    this.mesh = new THREE.Mesh(geom, this.material);
    this.mesh.name = "WaterSurface";
    this.mesh.frustumCulled = false;
    this.group.add(this.mesh);

    this.setMode("river");
  }

  getMode(): WaterMode {
    return this.mode;
  }

  getDimensions(): { width: number; depth: number } {
    return { width: this.width, depth: this.depth };
  }

  getParams(): Readonly<WaterParams> {
    return this.params;
  }

  setMode(mode: WaterMode): void {
    const preset = WATER_MODE_PRESETS[mode];
    this.mode = mode;
    this.width = preset.width;
    this.depth = preset.depth;
    this.params.amplitude = preset.amplitude;
    this.params.speed = preset.speed;
    this.params.wavelengthScale = preset.wavelengthScale;
    this.params.clean = preset.clean;

    const u = this.material.uniforms;
    u.uMode!.value = preset.modeIndex;
    (u.uSize!.value as THREE.Vector2).set(preset.width, preset.depth);
    u.uAmplitude!.value = preset.amplitude;
    u.uSpeed!.value = preset.speed;
    u.uWavelengthScale!.value = preset.wavelengthScale;
    u.uClean!.value = preset.clean;
    (u.uDeepColor!.value as THREE.Color).set(preset.deepColor);
    (u.uShallowColor!.value as THREE.Color).set(preset.shallowColor);
    (u.uTurbidColor!.value as THREE.Color).set(preset.turbidColor);
    (u.uSkyColor!.value as THREE.Color).set(preset.skyColor);
    (u.uFoamColor!.value as THREE.Color).set(preset.foamColor);
  }

  /**
   * Memadukan parameter dua mode secara mulus (mis. muara B3 -> B4 dari sungai ke laut).
   */
  blendMode(from: WaterMode, to: WaterMode, alpha: number): void {
    const k = clamp01(alpha);
    const a = WATER_MODE_PRESETS[from];
    const b = WATER_MODE_PRESETS[to];

    this.mode = k >= 0.5 ? to : from;
    this.width = lerp(a.width, b.width, k);
    this.depth = lerp(a.depth, b.depth, k);
    this.params.amplitude = lerp(a.amplitude, b.amplitude, k);
    this.params.speed = lerp(a.speed, b.speed, k);
    this.params.wavelengthScale = lerp(a.wavelengthScale, b.wavelengthScale, k);
    this.params.clean = lerp(a.clean, b.clean, k);

    const u = this.material.uniforms;
    u.uMode!.value = lerp(a.modeIndex, b.modeIndex, k);
    (u.uSize!.value as THREE.Vector2).set(this.width, this.depth);
    u.uAmplitude!.value = this.params.amplitude;
    u.uSpeed!.value = this.params.speed;
    u.uWavelengthScale!.value = this.params.wavelengthScale;
    u.uClean!.value = this.params.clean;

    (u.uDeepColor!.value as THREE.Color).lerpColors(
      _tmpColorA.set(a.deepColor),
      _tmpColorB.set(b.deepColor),
      k,
    );
    (u.uShallowColor!.value as THREE.Color).lerpColors(
      _tmpColorA.set(a.shallowColor),
      _tmpColorB.set(b.shallowColor),
      k,
    );
    (u.uTurbidColor!.value as THREE.Color).lerpColors(
      _tmpColorA.set(a.turbidColor),
      _tmpColorB.set(b.turbidColor),
      k,
    );
    (u.uSkyColor!.value as THREE.Color).lerpColors(
      _tmpColorA.set(a.skyColor),
      _tmpColorB.set(b.skyColor),
      k,
    );
    (u.uFoamColor!.value as THREE.Color).lerpColors(
      _tmpColorA.set(a.foamColor),
      _tmpColorB.set(b.foamColor),
      k,
    );
  }

  setClean(clean: boolean): void {
    if (clean) {
      this.setMode("clean");
    } else {
      this.params.clean = 0;
      this.material.uniforms.uClean!.value = 0;
    }
  }

  setParams(
    patch: Partial<WaterParams> & {
      fogColor?: THREE.ColorRepresentation;
      sunDir?: THREE.Vector3;
      centerOffsetX?: number;
      centerOffsetZ?: number;
    },
  ): void {
    const u = this.material.uniforms;
    if (patch.time !== undefined) {
      this.params.time = patch.time;
      u.uTime!.value = patch.time;
    }
    if (patch.amplitude !== undefined) {
      this.params.amplitude = Math.max(0, patch.amplitude);
      u.uAmplitude!.value = this.params.amplitude;
    }
    if (patch.speed !== undefined) {
      this.params.speed = Math.max(0, patch.speed);
      u.uSpeed!.value = this.params.speed;
    }
    if (patch.wavelengthScale !== undefined) {
      this.params.wavelengthScale = Math.max(0.1, patch.wavelengthScale);
      u.uWavelengthScale!.value = this.params.wavelengthScale;
    }
    if (patch.turbid !== undefined) {
      this.params.turbid = clamp01(patch.turbid);
      u.uTurbid!.value = this.params.turbid;
    }
    if (patch.underwater !== undefined) {
      this.params.underwater = clamp01(patch.underwater);
      u.uUnderwater!.value = this.params.underwater;
    }
    if (patch.opacity !== undefined) {
      this.params.opacity = clamp01(patch.opacity);
      u.uOpacity!.value = this.params.opacity;
    }
    if (patch.clean !== undefined) {
      this.params.clean = clamp01(patch.clean);
      u.uClean!.value = this.params.clean;
    }
    if (patch.sunIntensity !== undefined) {
      this.params.sunIntensity = Math.max(0, patch.sunIntensity);
      u.uSunIntensity!.value = this.params.sunIntensity;
    }
    if (patch.fogDensity !== undefined) {
      this.params.fogDensity = Math.max(0, patch.fogDensity);
      u.uFogDensity!.value = this.params.fogDensity;
    }
    if (patch.fogColor !== undefined) {
      (u.uFogColor!.value as THREE.Color).set(patch.fogColor);
    }
    if (patch.sunDir !== undefined) {
      (u.uSunDir!.value as THREE.Vector3).copy(patch.sunDir).normalize();
    }
    if (patch.centerOffsetX !== undefined || patch.centerOffsetZ !== undefined) {
      const offset = u.uCenterOffset!.value as THREE.Vector2;
      offset.set(patch.centerOffsetX ?? offset.x, patch.centerOffsetZ ?? offset.y);
    }
  }

  /**
   * Evaluasi permukaan Gerstner parametrik pada koordinat dasar (baseX, baseZ) dengan rumus
   * yang identik dengan vertex shader GLSL.
   */
  sampleSurface(
    baseX: number,
    baseZ: number,
    outPos: THREE.Vector3 = this._tmpPos,
    outNormal: THREE.Vector3 = this._tmpNorm,
  ): void {
    const ampTotal = this.params.amplitude;
    const speed = this.params.speed;
    const time = this.params.time;
    const wlScale = this.params.wavelengthScale;

    let offX = 0;
    let offY = 0;
    let offZ = 0;

    let dPdxX = 1;
    let dPdxY = 0;
    let dPdxZ = 0;

    let dPdzX = 0;
    let dPdzY = 0;
    let dPdzZ = 1;

    for (let i = 0; i < GERSTNER_WAVES.length; i++) {
      const w = GERSTNER_WAVES[i]!;
      const amp = ampTotal * w.weight;
      if (amp <= 0.00001) continue;

      const wavelength = Math.max(0.1, w.wavelength * wlScale);
      const k = TWO_PI / wavelength;
      const c = Math.sqrt(9.8 / k) * speed;
      const h = Math.min(amp * w.steepness, 0.72 / (k * 3.0));
      const phase = k * (w.dirX * baseX + w.dirZ * baseZ) + c * time;
      const s = Math.sin(phase);
      const cs = Math.cos(phase);

      offX += w.dirX * h * cs;
      offZ += w.dirZ * h * cs;
      offY += amp * s;

      dPdxX += -w.dirX * w.dirX * k * h * s;
      dPdxY += w.dirX * k * amp * cs;
      dPdxZ += -w.dirX * w.dirZ * k * h * s;

      dPdzX += -w.dirX * w.dirZ * k * h * s;
      dPdzY += w.dirZ * k * amp * cs;
      dPdzZ += -w.dirZ * w.dirZ * k * h * s;
    }

    outPos.set(baseX + offX, offY + this.group.position.y, baseZ + offZ);

    // cross(dPdz, dPdx)
    const nx = dPdzY * dPdxZ - dPdzZ * dPdxY;
    const ny = dPdzZ * dPdxX - dPdzX * dPdxZ;
    const nz = dPdzX * dPdxY - dPdzY * dPdxX;
    outNormal.set(nx, ny, nz).normalize();
  }

  /**
   * Sampling tinggi (y) + normal pada koordinat dunia (worldX, worldZ) via 2 iterasi inversi Gerstner,
   * dipakai oleh botol dan sampah mengambang agar mengikuti ombak tanpa menembus permukaan.
   */
  sampleHeightAndNormal(
    worldX: number,
    worldZ: number,
    outNormal: THREE.Vector3 = new THREE.Vector3(),
  ): { y: number; normal: THREE.Vector3 } {
    const localX = worldX - this.group.position.x;
    const localZ = worldZ - this.group.position.z;

    let bx = localX;
    let bz = localZ;
    for (let iter = 0; iter < 2; iter++) {
      this.sampleSurface(bx, bz, this._tmpPos, this._tmpNorm);
      bx = localX - (this._tmpPos.x - bx);
      bz = localZ - (this._tmpPos.z - bz);
    }

    this.sampleSurface(bx, bz, this._tmpPos, outNormal);
    return { y: this._tmpPos.y, normal: outNormal };
  }

  /**
   * Menyimpan snapshot state air (dipakai render kilas B7 sebelum masuk mode 'clean').
   */
  saveState(): WaterSnapshot {
    const u = this.material.uniforms;
    return {
      mode: this.mode,
      width: this.width,
      depth: this.depth,
      visible: this.group.visible,
      position: this.group.position.clone(),
      params: { ...this.params },
      deepColor: (u.uDeepColor!.value as THREE.Color).clone(),
      shallowColor: (u.uShallowColor!.value as THREE.Color).clone(),
      turbidColor: (u.uTurbidColor!.value as THREE.Color).clone(),
      skyColor: (u.uSkyColor!.value as THREE.Color).clone(),
      foamColor: (u.uFoamColor!.value as THREE.Color).clone(),
      fogColor: (u.uFogColor!.value as THREE.Color).clone(),
      sunDir: (u.uSunDir!.value as THREE.Vector3).clone(),
      modeValue: u.uMode!.value as number,
    };
  }

  restoreState(snapshot: WaterSnapshot): void {
    this.mode = snapshot.mode;
    this.width = snapshot.width;
    this.depth = snapshot.depth;
    this.group.visible = snapshot.visible;
    this.group.position.copy(snapshot.position);
    Object.assign(this.params, snapshot.params);

    const u = this.material.uniforms;
    u.uMode!.value = snapshot.modeValue;
    (u.uSize!.value as THREE.Vector2).set(snapshot.width, snapshot.depth);
    u.uTime!.value = snapshot.params.time;
    u.uAmplitude!.value = snapshot.params.amplitude;
    u.uSpeed!.value = snapshot.params.speed;
    u.uWavelengthScale!.value = snapshot.params.wavelengthScale;
    u.uTurbid!.value = snapshot.params.turbid;
    u.uUnderwater!.value = snapshot.params.underwater;
    u.uOpacity!.value = snapshot.params.opacity;
    u.uClean!.value = snapshot.params.clean;
    u.uSunIntensity!.value = snapshot.params.sunIntensity;
    u.uFogDensity!.value = snapshot.params.fogDensity;
    (u.uDeepColor!.value as THREE.Color).copy(snapshot.deepColor);
    (u.uShallowColor!.value as THREE.Color).copy(snapshot.shallowColor);
    (u.uTurbidColor!.value as THREE.Color).copy(snapshot.turbidColor);
    (u.uSkyColor!.value as THREE.Color).copy(snapshot.skyColor);
    (u.uFoamColor!.value as THREE.Color).copy(snapshot.foamColor);
    (u.uFogColor!.value as THREE.Color).copy(snapshot.fogColor);
    (u.uSunDir!.value as THREE.Vector3).copy(snapshot.sunDir);
  }

  reset(): void {
    this.group.visible = false;
    this.group.position.set(0, 0, 0);
    this.group.rotation.set(0, 0, 0);
    this.setMode("river");
    this.setParams({
      time: 0,
      turbid: 0,
      underwater: 0,
      opacity: 1,
      sunIntensity: 0,
      fogDensity: 0,
      centerOffsetX: 0,
      centerOffsetZ: 0,
    });
  }

  setQuality(config: QualityConfig): void {
    this.material.uniforms.uCausticsEnabled!.value = config.caustics ? 1 : 0;
    const nextLow = config.tier === "low";
    const prevLow = this.material.defines.LOW_QUALITY === 1;
    if (nextLow !== prevLow) {
      if (nextLow) {
        this.material.defines.LOW_QUALITY = 1;
      } else {
        delete this.material.defines.LOW_QUALITY;
      }
      this.material.needsUpdate = true;
    }
    if (this.segments !== config.waterSegments) {
      this.segments = config.waterSegments;
      this.mesh.geometry.dispose();
      this.mesh.geometry = buildWaterGeometry(this.segments);
    }
  }

  dispose(): void {
    this.group.removeFromParent();
    this.mesh.geometry.dispose();
    this.matHandle.dispose();
  }
}

/**
 * Mengambil atau membuat & mendaftarkan WaterSystem bersama pada key `'water'`.
 */
export function ensureWaterSystem(ctx: StageContext): WaterSystem {
  const existing = ctx.shared.get<WaterSystem>("water");
  if (existing) return existing;
  const water = new WaterSystem(ctx.scene, ctx.qualityConfig);
  water.group.visible = false;
  return ctx.shared.register("water", water);
}
