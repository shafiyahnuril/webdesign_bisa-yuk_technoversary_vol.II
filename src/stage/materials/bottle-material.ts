import * as THREE from "three";
import { makeBottleCrack } from "../textures/crack";
import { makeBottleLabel } from "../textures/label";

export interface BottleParams {
  turbid: number;
  crack: number;
  breakAmt: number;
  level: number;
  dirt: number;
  opacity: number;
}

export const DEFAULT_BOTTLE_PARAMS: Readonly<BottleParams> = {
  turbid: 0,
  crack: 0,
  breakAmt: 0,
  level: 0.85,
  dirt: 0,
  opacity: 1,
};

export interface BottleUniforms {
  uBreak: { value: number };
  uCrack: { value: number };
  uDirt: { value: number };
  uOpacity: { value: number };
  uHasCrack: { value: number };
  tCrackMask: { value: THREE.Texture | null };
  tCrackGrowth: { value: THREE.Texture | null };
}

export interface BottleMaterialSet {
  body: THREE.MeshPhysicalMaterial;
  cap: THREE.MeshStandardMaterial;
  liquid: THREE.MeshPhysicalMaterial | THREE.MeshStandardMaterial;
  label: THREE.MeshStandardMaterial;
  uniforms: BottleUniforms;
  crackTextures: { mask: THREE.CanvasTexture; growth: THREE.CanvasTexture };
  labelTexture: THREE.CanvasTexture;
  transmission: boolean;
  crackSize: 512 | 1024;
}

const CLEAN_ATTENUATION = new THREE.Color("#CFE9FF");
const TURBID_ATTENUATION = new THREE.Color("#6B7F8F");
const CLEAN_BODY_TINT = new THREE.Color("#F1F8FF");
const LOW_CLEAN_TINT = new THREE.Color("#CFE9FF");
const LOW_TURBID_TINT = new THREE.Color("#6B7F8F");

function createBodyMaterial(
  transmission: boolean,
  uniforms: BottleUniforms,
): THREE.MeshPhysicalMaterial {
  const mat = new THREE.MeshPhysicalMaterial({
    color: transmission ? CLEAN_BODY_TINT : LOW_CLEAN_TINT,
    roughness: 0.06,
    metalness: 0,
    ior: 1.45,
    reflectivity: 0.9,
    clearcoat: 0.6,
    clearcoatRoughness: 0.08,
    transmission: transmission ? 1 : 0,
    thickness: 0.45,
    attenuationColor: CLEAN_ATTENUATION.clone(),
    attenuationDistance: 3,
    transparent: !transmission,
    opacity: transmission ? 1 : 0.36,
    depthWrite: transmission,
    envMapIntensity: 1,
  });

  mat.customProgramCacheKey = () => "rebottle-pet-v1";
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uBreak = uniforms.uBreak;
    shader.uniforms.uCrack = uniforms.uCrack;
    shader.uniforms.uDirt = uniforms.uDirt;
    shader.uniforms.uOpacity = uniforms.uOpacity;
    shader.uniforms.uHasCrack = uniforms.uHasCrack;
    shader.uniforms.tCrackMask = uniforms.tCrackMask;
    shader.uniforms.tCrackGrowth = uniforms.tCrackGrowth;

    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
        attribute float aShard;
        attribute vec3 aCenter;
        attribute vec4 aRand;
        uniform float uBreak;
        varying vec2 vBottleUv;
        vec3 rebottleRotateAxis(vec3 v, vec3 axis, float angle) {
          float s = sin(angle);
          float c = cos(angle);
          return v * c + cross(axis, v) * s + axis * dot(axis, v) * (1.0 - c);
        }`,
      )
      .replace(
        "#include <beginnormal_vertex>",
        `#include <beginnormal_vertex>
        if (uBreak > 0.0001) {
          vec3 rbAxis = normalize(aRand.xyz);
          float rbAngle = uBreak * aRand.w * 4.5;
          objectNormal = rebottleRotateAxis(objectNormal, rbAxis, rbAngle);
        }`,
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        vBottleUv = uv;
        if (uBreak > 0.0001) {
          vec3 rbAxis = normalize(aRand.xyz);
          float rbAngle = uBreak * aRand.w * 4.5;
          float rbScale = mix(1.0, 0.25, uBreak);
          vec3 rbLocal = (transformed - aCenter) * rbScale;
          rbLocal = rebottleRotateAxis(rbLocal, rbAxis, rbAngle);
          vec3 rbRadial = length(aCenter.xz) > 0.001
            ? normalize(vec3(aCenter.x, 0.0, aCenter.z))
            : vec3(0.0, 1.0, 0.0);
          vec3 rbPush = (rbRadial * (0.8 + 1.4 * aRand.w) + vec3(0.0, (aRand.y - 0.15) * 0.65, 0.0)) * uBreak;
          transformed = aCenter + rbLocal + rbPush;
        }`,
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        varying vec2 vBottleUv;
        uniform sampler2D tCrackMask;
        uniform sampler2D tCrackGrowth;
        uniform float uCrack;
        uniform float uDirt;
        uniform float uOpacity;
        uniform float uHasCrack;`,
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        if (uDirt > 0.001) {
          float dirtNoise = fract(sin(dot(floor(vBottleUv * 96.0), vec2(12.9898, 78.233))) * 43758.5453);
          float lowerBand = 1.0 - smoothstep(0.15, 0.85, vBottleUv.y);
          float dirtAmt = clamp((0.35 + 0.65 * dirtNoise) * (0.45 + 0.55 * lowerBand) * uDirt, 0.0, 0.85);
          vec3 dirtTint = vec3(0.24, 0.31, 0.38);
          diffuseColor.rgb = mix(diffuseColor.rgb, dirtTint, dirtAmt * 0.65);
          diffuseColor.a = max(diffuseColor.a, dirtAmt * 0.45 * uOpacity);
        }
        if (uCrack > 0.001 && uHasCrack > 0.5) {
          float maskA = texture2D(tCrackMask, vBottleUv).a;
          float growthR = texture2D(tCrackGrowth, vBottleUv).r;
          float reveal = smoothstep(growthR - 0.05, growthR + 0.02, uCrack * 1.06);
          float crackAmt = maskA * reveal;
          vec3 crackColor = vec3(0.795, 0.825, 0.888);
          diffuseColor.rgb = mix(diffuseColor.rgb, crackColor, crackAmt);
          diffuseColor.a = max(diffuseColor.a, crackAmt * uOpacity);
          totalEmissiveRadiance += crackColor * crackAmt * 0.45 * uOpacity;
        }`,
      );
  };

  return mat;
}

/**
 * Material cairan: baseline docs/03 §3.1 memakai transmission 0.9 di HIGH/MEDIUM,
 * dan transparan biasa di LOW (konflik docs/06 §4.2 dicatat di laporan ke koordinator).
 */
function createLiquidMaterial(
  transmission: boolean,
  clipPlane: THREE.Plane,
): THREE.MeshPhysicalMaterial | THREE.MeshStandardMaterial {
  if (transmission) {
    return new THREE.MeshPhysicalMaterial({
      color: "#BFE9FF",
      roughness: 0.05,
      metalness: 0,
      ior: 1.333,
      transmission: 0.9,
      thickness: 0.35,
      transparent: true,
      opacity: 0.55,
      clippingPlanes: [clipPlane],
      side: THREE.DoubleSide,
    });
  }
  return new THREE.MeshStandardMaterial({
    color: "#BFE9FF",
    roughness: 0.12,
    metalness: 0,
    transparent: true,
    opacity: 0.55,
    clippingPlanes: [clipPlane],
    side: THREE.DoubleSide,
  });
}

export function createBottleMaterials(opts: {
  transmission: boolean;
  crackSize: 512 | 1024;
  clipPlane: THREE.Plane;
}): BottleMaterialSet {
  const crackTextures = makeBottleCrack(opts.crackSize);
  const labelTexture = makeBottleLabel();

  const uniforms: BottleUniforms = {
    uBreak: { value: 0 },
    uCrack: { value: 0 },
    uDirt: { value: 0 },
    uOpacity: { value: 1 },
    uHasCrack: { value: 1 },
    tCrackMask: { value: crackTextures.mask },
    tCrackGrowth: { value: crackTextures.growth },
  };

  const body = createBodyMaterial(opts.transmission, uniforms);
  const cap = new THREE.MeshStandardMaterial({
    color: "#BFE7FF",
    roughness: 0.5,
    metalness: 0,
  });
  const liquid = createLiquidMaterial(opts.transmission, opts.clipPlane);
  const label = new THREE.MeshStandardMaterial({
    color: "#FFFFFF",
    map: labelTexture,
    roughness: 0.68,
    metalness: 0,
  });

  return {
    body,
    cap,
    liquid,
    label,
    uniforms,
    crackTextures,
    labelTexture,
    transmission: opts.transmission,
    crackSize: opts.crackSize,
  };
}

export function updateBottleMaterials(
  mats: BottleMaterialSet,
  params: BottleParams,
): void {
  const { turbid, crack, breakAmt, dirt, opacity } = params;
  mats.uniforms.uBreak.value = breakAmt;
  mats.uniforms.uCrack.value = crack;
  mats.uniforms.uDirt.value = dirt;
  mats.uniforms.uOpacity.value = opacity;

  const body = mats.body;
  body.roughness = 0.06 + 0.44 * turbid;
  body.clearcoat = 0.6 - 0.45 * dirt;
  body.attenuationColor.lerpColors(CLEAN_ATTENUATION, TURBID_ATTENUATION, turbid);

  if (mats.transmission) {
    body.transmission = 1 - 0.45 * turbid;
    const isFading = opacity < 0.999 || breakAmt > 0.001 || crack > 0.001 || dirt > 0.001;
    body.transparent = isFading;
    body.opacity = opacity;
    body.depthWrite = opacity >= 0.999 && breakAmt <= 0.001;
  } else {
    body.transmission = 0;
    body.color.lerpColors(LOW_CLEAN_TINT, LOW_TURBID_TINT, turbid);
    body.transparent = true;
    body.opacity = (0.36 + 0.32 * turbid) * opacity;
    body.depthWrite = false;
  }

  const accessoryFade = Math.max(0, 1 - Math.min(1, breakAmt / 0.35)) * opacity;
  const accessoryTransparent = accessoryFade < 0.999;

  mats.cap.transparent = accessoryTransparent;
  mats.cap.opacity = accessoryFade;

  mats.label.transparent = accessoryTransparent;
  mats.label.opacity = accessoryFade;

  mats.liquid.opacity = 0.55 * opacity * (1 - Math.min(1, breakAmt / 0.15));
}

export function swapBottleMaterialQuality(
  mats: BottleMaterialSet,
  opts: { transmission: boolean; crackSize: 512 | 1024; clipPlane: THREE.Plane },
  params: BottleParams,
): void {
  if (mats.crackSize !== opts.crackSize) {
    mats.crackTextures.mask.dispose();
    mats.crackTextures.growth.dispose();
    const nextCrack = makeBottleCrack(opts.crackSize);
    mats.crackTextures = nextCrack;
    mats.uniforms.tCrackMask.value = nextCrack.mask;
    mats.uniforms.tCrackGrowth.value = nextCrack.growth;
    mats.crackSize = opts.crackSize;
  }

  if (mats.transmission !== opts.transmission) {
    mats.body.dispose();
    mats.liquid.dispose();
    mats.body = createBodyMaterial(opts.transmission, mats.uniforms);
    mats.liquid = createLiquidMaterial(opts.transmission, opts.clipPlane);
    mats.transmission = opts.transmission;
  }

  updateBottleMaterials(mats, params);
}

export function disposeBottleMaterials(mats: BottleMaterialSet): void {
  mats.body.dispose();
  mats.cap.dispose();
  mats.liquid.dispose();
  mats.label.dispose();
  mats.crackTextures.mask.dispose();
  mats.crackTextures.growth.dispose();
  mats.labelTexture.dispose();
}
