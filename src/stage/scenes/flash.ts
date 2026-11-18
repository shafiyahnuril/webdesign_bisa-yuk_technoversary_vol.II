import * as THREE from "three";
import { createClayMaterial } from "../materials/clay";
import type { SharedObjectHandle, StageContext } from "../stage";

export interface FlashRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FlashPass extends SharedObjectHandle {
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
  setRect(rect: FlashRect | null): void;
  setScissorRect(rect: FlashRect | null): void;
  setActive(active: boolean): void;
  isActive(): boolean;
  setOpacity(alpha: number): void;
  getOpacity(): number;
  renderPass(timeSeconds?: number): void;
  reset(): void;
  dispose(): void;
}

const BACKDROP_VERT = /* glsl */ `
  void main() {
    gl_Position = vec4(position.xy, 0.9999, 1.0);
  }
`;

const BACKDROP_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;

  void main() {
    gl_FragColor = vec4(uColor, uOpacity);
  }
`;

const CLEAN_WATER_VERT = /* glsl */ `
  uniform float uTime;
  varying float vWave;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 p = position;
    float w1 = sin(p.x * 1.4 + uTime * 1.2) * 0.018;
    float w2 = cos(p.z * 2.1 - uTime * 0.9) * 0.012;
    p.y += w1 + w2;
    vWave = w1 + w2;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const CLEAN_WATER_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  varying float vWave;
  varying vec2 vUv;

  void main() {
    vec3 deep = vec3(0.106, 0.353, 0.400);    // #1B5A66
    vec3 shallow = vec3(0.227, 0.651, 0.639); // #3AA6A3
    float bankMix = abs(vUv.y - 0.5) * 2.0;
    vec3 col = mix(deep, shallow, smoothstep(0.15, 0.95, bankMix) * 0.65 + (vWave * 12.0 + 0.5) * 0.25);
    float shimmer = smoothstep(0.018, 0.03, vWave + sin(vUv.x * 38.0 + uTime * 1.5) * 0.008);
    col += vec3(0.62, 0.90, 0.82) * shimmer * 0.14;
    gl_FragColor = vec4(col, uOpacity);
  }
`;

/**
 * Jendela kilas Bab 7c:
 * Menggunakan renderer Stage yang sama via viewport + scissor tanpa membuat WebGLRenderer kedua.
 */
export function createFlashPass(ctx: StageContext): FlashPass {
  const flashGroup = new THREE.Group();
  flashGroup.name = "O-FLASH-PASS";

  const flashScene = new THREE.Scene();
  flashScene.background = null;
  flashScene.fog = null;

  const flashCamera = new THREE.PerspectiveCamera(34, 34 / 26, 0.1, 80);
  flashCamera.position.set(0, 2.2, 8.5);
  flashCamera.lookAt(0, 0.1, 0);

  const keyLight = new THREE.DirectionalLight(0xeefcf8, 2.0);
  keyLight.position.set(-3, 6, 4);
  const fillLight = new THREE.HemisphereLight(0x9fe6d0, 0x173e47, 0.6);
  flashScene.add(keyLight, fillLight);

  // Langit latar transparan dirender terakhir pada depth=0.9999 sehingga hanya mengisi piksel kosong tanpa double-alpha
  const backdropUniforms = {
    uColor: { value: new THREE.Color("#1F4F5E") },
    uOpacity: { value: 1 },
  };
  const backdropGeom = new THREE.PlaneGeometry(2, 2);
  const backdropMat = new THREE.ShaderMaterial({
    uniforms: backdropUniforms,
    vertexShader: BACKDROP_VERT,
    fragmentShader: BACKDROP_FRAG,
    transparent: true,
    depthTest: true,
    depthWrite: false,
  });
  const backdropMesh = new THREE.Mesh(backdropGeom, backdropMat);
  backdropMesh.frustumCulled = false;
  backdropMesh.renderOrder = 10;
  flashScene.add(backdropMesh);

  // Sungai versi jernih (tanpa kota, tanpa kabut, tanpa sampah)
  const waterUniforms = {
    uTime: { value: 0 },
    uOpacity: { value: 1 },
  };
  const waterGeom = new THREE.PlaneGeometry(40, 14, 48, 24);
  waterGeom.rotateX(-Math.PI * 0.5);
  const waterMat = new THREE.ShaderMaterial({
    uniforms: waterUniforms,
    vertexShader: CLEAN_WATER_VERT,
    fragmentShader: CLEAN_WATER_FRAG,
    transparent: false,
    depthWrite: true,
  });
  const waterMesh = new THREE.Mesh(waterGeom, waterMat);
  waterMesh.renderOrder = 0;
  flashScene.add(waterMesh);

  // Tepian sungai bersih sederhana tanpa tumpang-tindih dengan tepi air z = ±7
  const bankGeom = new THREE.BoxGeometry(40, 0.7, 2.2);
  const bankMat = createClayMaterial({ color: "#194851", roughness: 0.88 });
  bankMat.depthWrite = true;
  const farBank = new THREE.Mesh(bankGeom, bankMat);
  farBank.position.set(0, 0.2, -8.1);
  farBank.renderOrder = 0;
  const nearBank = new THREE.Mesh(bankGeom, bankMat);
  nearBank.position.set(0, 0.12, 8.1);
  nearBank.renderOrder = 0;
  flashScene.add(farBank, nearBank);

  let cachedRect: FlashRect | null = null;
  let active = false;
  let opacity = 1;
  let disposed = false;

  const setOpacity = (alpha: number) => {
    const next = Math.max(0, Math.min(1, Number.isFinite(alpha) ? alpha : 1));
    opacity = next;
    const isTransparent = next < 0.999;

    backdropUniforms.uOpacity.value = next;
    backdropMat.transparent = isTransparent;

    waterUniforms.uOpacity.value = next;
    waterMat.transparent = isTransparent;
    waterMat.depthWrite = true;

    bankMat.opacity = next;
    bankMat.transparent = isTransparent;
    bankMat.depthWrite = true;
  };

  const setRect = (rect: FlashRect | null) => {
    if (!rect || rect.width <= 0 || rect.height <= 0) {
      cachedRect = null;
      return;
    }
    cachedRect = {
      x: Math.round(rect.x),
      y: Math.round(rect.y),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    };
    flashCamera.aspect = cachedRect.width / cachedRect.height;
    flashCamera.updateProjectionMatrix();
  };

  return {
    group: flashGroup,
    scene: flashScene,
    camera: flashCamera,
    setRect,
    setScissorRect: setRect,
    setActive(nextActive: boolean) {
      active = nextActive;
    },
    isActive() {
      return active;
    },
    setOpacity,
    getOpacity() {
      return opacity;
    },
    renderPass(timeSeconds = ctx.uniforms.uTime.value) {
      if (disposed || !active || !cachedRect || opacity <= 0.005) return;
      const { renderer, size } = ctx;
      if (size.w <= 0 || size.h <= 0) return;

      waterUniforms.uTime.value = ctx.reducedMotion ? 0 : timeSeconds;

      const rx = Math.max(0, Math.min(size.w - 1, cachedRect.x));
      const rw = Math.max(1, Math.min(size.w - rx, cachedRect.width));
      const rh = Math.max(1, Math.min(size.h, cachedRect.height));
      const ry = Math.max(0, Math.min(size.h - rh, size.h - (cachedRect.y + rh)));

      const prevAutoClear = renderer.autoClear;
      renderer.autoClear = false;
      try {
        renderer.setViewport(rx, ry, rw, rh);
        renderer.setScissor(rx, ry, rw, rh);
        renderer.setScissorTest(true);
        renderer.clearDepth();
        renderer.render(flashScene, flashCamera);
      } finally {
        renderer.setScissorTest(false);
        renderer.setViewport(0, 0, size.w, size.h);
        renderer.setScissor(0, 0, size.w, size.h);
        renderer.autoClear = prevAutoClear;
      }
    },
    reset() {
      active = false;
      setOpacity(1);
      waterUniforms.uTime.value = 0;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      active = false;
      backdropGeom.dispose();
      backdropMat.dispose();
      waterGeom.dispose();
      waterMat.dispose();
      bankGeom.dispose();
      bankMat.dispose();
      flashScene.clear();
      flashGroup.removeFromParent();
    },
  };
}

export const factoryFlash = createFlashPass;
