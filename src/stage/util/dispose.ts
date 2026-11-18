import * as THREE from "three";

const TEXTURE_SLOTS = [
  "map",
  "alphaMap",
  "aoMap",
  "bumpMap",
  "displacementMap",
  "emissiveMap",
  "envMap",
  "lightMap",
  "metalnessMap",
  "normalMap",
  "roughnessMap",
  "specularMap",
  "clearcoatMap",
  "clearcoatNormalMap",
  "clearcoatRoughnessMap",
  "transmissionMap",
  "thicknessMap",
  "attenuationMap",
  "specularColorMap",
  "specularIntensityMap",
  "sheenColorMap",
  "sheenRoughnessMap",
  "iridescenceMap",
  "iridescenceThicknessMap",
  "anisotropyMap",
] as const;

function isTexture(value: unknown): value is THREE.Texture {
  return value instanceof THREE.Texture;
}

function disposeShaderUniformTextures(material: THREE.Material): void {
  if (!(material instanceof THREE.ShaderMaterial)) return;
  for (const uniform of Object.values(material.uniforms)) {
    if (isTexture(uniform.value)) {
      uniform.value.dispose();
    }
  }
}

export function disposeMaterial(material: THREE.Material, disposeTextures = true): void {
  if (disposeTextures) {
    const record = material as unknown as Record<string, unknown>;
    for (const slot of TEXTURE_SLOTS) {
      const candidate = record[slot];
      if (isTexture(candidate)) {
        candidate.dispose();
      }
    }
    disposeShaderUniformTextures(material);
  }
  material.dispose();
}

export interface DisposeObjectOptions {
  textures?: boolean;
  geometries?: boolean;
  materials?: boolean;
}

/**
 * Membebaskan geometri, material, dan tekstur pada subtree objek 3D.
 * Jangan dipanggil pada container yang masih menyimpan objek bersama (`Bottle`, dll.).
 */
export function disposeObject(root: THREE.Object3D, opts: DisposeObjectOptions = {}): void {
  const disposeTextures = opts.textures ?? true;
  const disposeGeometries = opts.geometries ?? true;
  const disposeMaterials = opts.materials ?? true;

  root.traverse((obj) => {
    if (
      obj instanceof THREE.Mesh ||
      obj instanceof THREE.Points ||
      obj instanceof THREE.Line ||
      obj instanceof THREE.Sprite
    ) {
      if (disposeGeometries && "geometry" in obj && obj.geometry instanceof THREE.BufferGeometry) {
        obj.geometry.dispose();
      }
      if (disposeMaterials && "material" in obj && obj.material) {
        const mat = obj.material;
        if (Array.isArray(mat)) {
          for (const item of mat) {
            disposeMaterial(item, disposeTextures);
          }
        } else {
          disposeMaterial(mat, disposeTextures);
        }
      }
    }
    if (obj instanceof THREE.InstancedMesh) {
      obj.dispose();
    }
  });
}
