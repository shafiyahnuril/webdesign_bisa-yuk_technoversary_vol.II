import * as THREE from "three";
import { WATER_FRAGMENT_SHADER, WATER_VERTEX_SHADER } from "../shaders/water.glsl";
import { makeCaustics } from "../textures/canvas-assets";

export type WaterMode = "river" | "sea" | "night" | "clean";

export interface GerstnerWaveSpec {
  readonly dirX: number;
  readonly dirZ: number;
  readonly steepness: number;
  readonly wavelength: number;
  readonly weight: number;
}

function normDir(x: number, z: number): [number, number] {
  const len = Math.hypot(x, z) || 1;
  return [x / len, z / len];
}

const [d0x, d0z] = normDir(0.86, 0.51);
const [d1x, d1z] = normDir(0.34, -0.94);
const [d2x, d2z] = normDir(-0.78, 0.62);

/**
 * Tiga komponen gelombang Gerstner yang dibagi persis antara CPU dan vertex shader GLSL.
 */
export const GERSTNER_WAVES: readonly [GerstnerWaveSpec, GerstnerWaveSpec, GerstnerWaveSpec] = [
  { dirX: d0x, dirZ: d0z, steepness: 0.42, wavelength: 6.8, weight: 0.55 },
  { dirX: d1x, dirZ: d1z, steepness: 0.34, wavelength: 4.1, weight: 0.3 },
  { dirX: d2x, dirZ: d2z, steepness: 0.25, wavelength: 2.3, weight: 0.15 },
];

export interface WaterModePreset {
  readonly modeIndex: number;
  readonly width: number;
  readonly depth: number;
  readonly deepColor: string;
  readonly shallowColor: string;
  readonly turbidColor: string;
  readonly skyColor: string;
  readonly foamColor: string;
  readonly amplitude: number;
  readonly speed: number;
  readonly wavelengthScale: number;
  readonly clean: number;
}

export const WATER_MODE_PRESETS: Readonly<Record<WaterMode, WaterModePreset>> = {
  river: {
    modeIndex: 0,
    width: 40,
    depth: 14,
    deepColor: "#0F2A4A",
    shallowColor: "#2F5E86",
    turbidColor: "#2A465F",
    skyColor: "#8FB0CC",
    foamColor: "#E6EAF2",
    amplitude: 0.04,
    speed: 1.0,
    wavelengthScale: 2.4 / 6.8,
    clean: 0,
  },
  sea: {
    modeIndex: 1,
    width: 120,
    depth: 120,
    deepColor: "#0C2547",
    shallowColor: "#2D5A8C",
    turbidColor: "#223B59",
    skyColor: "#86A8D0",
    foamColor: "#E6EAF2",
    amplitude: 0.12,
    speed: 1.0,
    wavelengthScale: 1.0,
    clean: 0,
  },
  night: {
    modeIndex: 2,
    width: 120,
    depth: 120,
    deepColor: "#0A1633",
    shallowColor: "#1B2E57",
    turbidColor: "#162340",
    skyColor: "#8098C2",
    foamColor: "#C9D3E6",
    amplitude: 0.18,
    speed: 0.85,
    wavelengthScale: 1.0,
    clean: 0,
  },
  clean: {
    modeIndex: 3,
    width: 40,
    depth: 14,
    deepColor: "#1B5A66",
    shallowColor: "#3AA6A3",
    turbidColor: "#1B5A66",
    skyColor: "#9FE6D0",
    foamColor: "#F1FAF7",
    amplitude: 0.03,
    speed: 0.9,
    wavelengthScale: 2.4 / 6.8,
    clean: 1,
  },
};

export interface WaterMaterialHandle {
  readonly material: THREE.ShaderMaterial;
  readonly causticsTexture: THREE.CanvasTexture;
  dispose(): void;
}

export function createWaterMaterial(
  causticsEnabled: boolean,
  lowQuality = false,
): WaterMaterialHandle {
  const causticsTexture = makeCaustics();
  const initial = WATER_MODE_PRESETS.river;

  const material = new THREE.ShaderMaterial({
    vertexShader: WATER_VERTEX_SHADER,
    fragmentShader: WATER_FRAGMENT_SHADER,
    defines: lowQuality ? { LOW_QUALITY: 1 } : {},
    transparent: true,
    depthWrite: true,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: { value: 0 },
      uMode: { value: initial.modeIndex },
      uSize: { value: new THREE.Vector2(initial.width, initial.depth) },
      uCenterOffset: { value: new THREE.Vector2(0, 0) },
      uAmplitude: { value: initial.amplitude },
      uSpeed: { value: initial.speed },
      uWavelengthScale: { value: initial.wavelengthScale },
      uWave0: {
        value: new THREE.Vector4(
          GERSTNER_WAVES[0].dirX,
          GERSTNER_WAVES[0].dirZ,
          GERSTNER_WAVES[0].steepness,
          GERSTNER_WAVES[0].wavelength,
        ),
      },
      uWave1: {
        value: new THREE.Vector4(
          GERSTNER_WAVES[1].dirX,
          GERSTNER_WAVES[1].dirZ,
          GERSTNER_WAVES[1].steepness,
          GERSTNER_WAVES[1].wavelength,
        ),
      },
      uWave2: {
        value: new THREE.Vector4(
          GERSTNER_WAVES[2].dirX,
          GERSTNER_WAVES[2].dirZ,
          GERSTNER_WAVES[2].steepness,
          GERSTNER_WAVES[2].wavelength,
        ),
      },
      uWaveWeights: {
        value: new THREE.Vector3(
          GERSTNER_WAVES[0].weight,
          GERSTNER_WAVES[1].weight,
          GERSTNER_WAVES[2].weight,
        ),
      },
      uClean: { value: initial.clean },
      uTurbid: { value: 0 },
      uUnderwater: { value: 0 },
      uOpacity: { value: 1 },
      uCausticsEnabled: { value: causticsEnabled ? 1 : 0 },
      tCaustics: { value: causticsTexture },
      uDeepColor: { value: new THREE.Color(initial.deepColor) },
      uShallowColor: { value: new THREE.Color(initial.shallowColor) },
      uTurbidColor: { value: new THREE.Color(initial.turbidColor) },
      uSkyColor: { value: new THREE.Color(initial.skyColor) },
      uFoamColor: { value: new THREE.Color(initial.foamColor) },
      uSunDir: { value: new THREE.Vector3(0.25, 0.2, -0.94).normalize() },
      uSunIntensity: { value: 0 },
      uFogColor: { value: new THREE.Color("#183558") },
      uFogDensity: { value: 0 },
    },
  });

  return {
    material,
    causticsTexture,
    dispose() {
      material.dispose();
      causticsTexture.dispose();
    },
  };
}
