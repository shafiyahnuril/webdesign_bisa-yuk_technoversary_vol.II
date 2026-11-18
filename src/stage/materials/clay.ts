import * as THREE from "three";

export interface ClayMaterialOptions {
  color: THREE.ColorRepresentation;
  roughness?: number;
  metalness?: number;
  map?: THREE.Texture | null;
  transparent?: boolean;
  opacity?: number;
  emissive?: THREE.ColorRepresentation;
  emissiveIntensity?: number;
  side?: THREE.Side;
}

/**
 * Material standar bergaya clay matte (roughness 0,7–0,85, normal halus, tanpa flatShading).
 */
export function createClayMaterial(opts: ClayMaterialOptions): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: opts.color,
    roughness: opts.roughness ?? 0.78,
    metalness: opts.metalness ?? 0,
    flatShading: false,
    map: opts.map ?? null,
    transparent: opts.transparent ?? false,
    opacity: opts.opacity ?? 1,
    emissive: opts.emissive ?? 0x000000,
    emissiveIntensity: opts.emissiveIntensity ?? 1,
    side: opts.side ?? THREE.FrontSide,
  });
}
