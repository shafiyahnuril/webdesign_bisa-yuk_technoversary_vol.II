import * as THREE from "three";
import { PARTICLE_FRAGMENT_SHADER, PARTICLE_VERTEX_SHADER } from "../shaders/particle.glsl";

export const PARTICLE_DEFAULT_COLOR = "#E6EAF2";

export interface ParticleMaterialHandle {
  readonly material: THREE.ShaderMaterial;
  readonly attract: [THREE.Vector3, THREE.Vector3, THREE.Vector3];
  dispose(): void;
}

export function createParticleMaterial(): ParticleMaterialHandle {
  const attract: [THREE.Vector3, THREE.Vector3, THREE.Vector3] = [
    new THREE.Vector3(-1.4, 0.25, 0),
    new THREE.Vector3(0.0, 0.55, -0.35),
    new THREE.Vector3(1.4, 0.05, 0.2),
  ];

  const material = new THREE.ShaderMaterial({
    vertexShader: PARTICLE_VERTEX_SHADER,
    fragmentShader: PARTICLE_FRAGMENT_SHADER,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uBreak: { value: 0 },
      uFlow: { value: 0 },
      uAttract: { value: attract },
      uSettle: { value: 0 },
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(PARTICLE_DEFAULT_COLOR) },
      uFade: { value: 1 },
      uSizeScale: { value: 1 },
    },
  });

  return {
    material,
    attract,
    dispose() {
      material.dispose();
    },
  };
}
