import * as THREE from "three";
import { makeCoralSurfaceSet } from "../textures/pbr-maps";
import { clamp01, smoothstep } from "../util/math";
import { createRng, rngRange } from "../util/rng";

// Pigmen koloni berbeda; cahaya bawah air memberi nuansa biru-hijau, bukan cat biru seragam.
const PIGMENTS = ["#96764E", "#7A8050", "#A17761", "#807050", "#866F82", "#7F885D"];
const BONE = new THREE.Color("#E8E1CE");

interface ColonyInstance {
  matrix: THREE.Matrix4;
  pigment: THREE.Color;
  delay: number;
}

interface ColonyBatch {
  mesh: THREE.InstancedMesh;
  instances: ColonyInstance[];
  compactCount: number;
}

/** Cabang melengkung dan bercabang sungguhan, dengan ujung meruncing dan UV sepanjang batang. */
function branchingGeometry(): THREE.BufferGeometry {
  const positions: number[] = [],
    normals: number[] = [],
    uvs: number[] = [],
    indices: number[] = [];
  const sides = 6;
  const up = new THREE.Vector3(0, 1, 0);
  const tangent = new THREE.Vector3(),
    radial = new THREE.Vector3();
  const rotation = new THREE.Quaternion();
  const append = (points: number[][], radii: number[], capBase: boolean) => {
    const start = positions.length / 3;
    for (let i = 0; i < points.length; i++) {
      const point = new THREE.Vector3(...(points[i] as [number, number, number]));
      const before = new THREE.Vector3(...(points[Math.max(0, i - 1)] as [number, number, number]));
      const after = new THREE.Vector3(
        ...(points[Math.min(points.length - 1, i + 1)] as [number, number, number]),
      );
      tangent.subVectors(after, before).normalize();
      rotation.setFromUnitVectors(up, tangent);
      for (let j = 0; j <= sides; j++) {
        const a = (j / sides) * Math.PI * 2;
        radial.set(Math.cos(a), 0, Math.sin(a)).applyQuaternion(rotation);
        positions.push(
          point.x + radial.x * radii[i]!,
          point.y + radial.y * radii[i]!,
          point.z + radial.z * radii[i]!,
        );
        normals.push(radial.x, radial.y, radial.z);
        uvs.push(j / sides, i / (points.length - 1));
        if (i && j < sides) {
          const k = start + i * (sides + 1) + j;
          const p = k - sides - 1;
          indices.push(p, k, p + 1, p + 1, k, k + 1);
        }
      }
    }
    for (const i of capBase ? [0, points.length - 1] : [points.length - 1]) {
      const center = positions.length / 3;
      positions.push(...points[i]!);
      normals.push(0, i ? 1 : -1, 0);
      uvs.push(0.5, i ? 1 : 0);
      for (let j = 0; j < sides; j++) {
        const k = start + i * (sides + 1) + j;
        indices.push(...(i ? [center, k + 1, k] : [center, k, k + 1]));
      }
    }
  };
  append(
    [
      [0, 0, 0],
      [0.02, 0.35, 0.02],
      [0.04, 0.7, -0.015],
      [0.01, 1.04, 0.04],
    ],
    [0.1, 0.085, 0.055, 0.018],
    true,
  );
  append(
    [
      [0.02, 0.35, 0.02],
      [-0.16, 0.56, 0.03],
      [-0.3, 0.8, 0.01],
    ],
    [0.056, 0.035, 0.013],
    false,
  );
  append(
    [
      [0.03, 0.6, 0],
      [0.19, 0.78, 0.04],
      [0.27, 0.99, 0.06],
    ],
    [0.046, 0.03, 0.012],
    false,
  );
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  return geometry;
}

function organicGeometry(plate: boolean): THREE.BufferGeometry {
  const geometry = plate
    ? new THREE.CylinderGeometry(1, 0.94, 0.1, 12)
    : new THREE.SphereGeometry(1, 12, 8);
  const position = geometry.attributes.position!;
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i),
      y = position.getY(i),
      z = position.getZ(i);
    const a = Math.atan2(z, x);
    const wobble = 1 + 0.055 * Math.sin(a * 5) + 0.025 * Math.cos(y * 8 + a * 3);
    position.setXYZ(
      i,
      x * wobble,
      plate ? y + 0.09 * (x * x + z * z) : y * (1 + 0.045 * Math.sin(x * 7 + z * 4)),
      z * wobble,
    );
  }
  geometry.computeVertexNormals();
  return geometry;
}

/** Karang bercabang, masif, dan meja; warna serta pemutihan disimpan per koloni. */
export class CoralReef {
  readonly group = new THREE.Group();
  private readonly batches: ColonyBatch[];
  private bleach = -1;
  private readonly color = new THREE.Color();

  constructor(parent: THREE.Object3D, compact = false) {
    this.group.name = "O-CORAL";
    const maps = makeCoralSurfaceSet();
    const material = new THREE.MeshStandardMaterial({
      color: "#FFFFFF",
      map: maps.map,
      normalMap: maps.normalMap,
      roughnessMap: maps.roughnessMap,
      normalScale: new THREE.Vector2(0.42, 0.42),
      roughness: 1,
      metalness: 0,
      envMapIntensity: 0.35,
    });
    const instances: ColonyInstance[][] = [[], [], []];
    const compactCounts = [0, 0, 0];
    const rockMatrices: THREE.Matrix4[] = [];
    const rng = createRng(404);
    const transform = new THREE.Object3D();
    const cellOrder = [8, 9, 2, 3, 14, 15, 7, 10, 1, 4, 13, 16, 0, 5, 6, 11, 12, 17];
    for (let c = 0; c < 18; c++) {
      const cell = cellOrder[c]!;
      const x = -5.5 + (cell % 6) * 2.15 + rngRange(rng, -0.28, 0.28);
      const z = -2.7 + Math.floor(cell / 6) * 1.55 + rngRange(rng, -0.25, 0.25);
      const y = -3.96;
      const pigment = new THREE.Color(PIGMENTS[c % PIGMENTS.length]!);
      const delay = (c % 5) * 0.055;
      const add = (
        batch: number,
        dx: number,
        dy: number,
        dz: number,
        sx: number,
        sy: number,
        sz: number,
        ry = 0,
        rz = 0,
      ) => {
        transform.position.set(x + dx, y + dy, z + dz);
        transform.rotation.set(0, ry, rz);
        transform.scale.set(sx, sy, sz);
        transform.updateMatrix();
        instances[batch]!.push({ matrix: transform.matrix.clone(), pigment, delay });
      };
      if (c % 3 !== 1) {
        const count = c % 3 === 0 ? 6 : 2;
        for (let b = 0; b < count; b++) {
          const a = (b / count) * Math.PI * 2 + rng() * 0.25;
          add(
            0,
            Math.cos(a) * 0.22,
            0.06,
            Math.sin(a) * 0.18,
            0.8 + rng() * 0.28,
            0.62 + rng() * 0.52,
            0.8 + rng() * 0.25,
            a,
            (rng() - 0.5) * 0.42,
          );
        }
      }
      if (c % 3 === 1) {
        for (let b = 0; b < 2; b++)
          add(
            1,
            b ? 0.27 : -0.18,
            b ? 0.28 : 0.43,
            b ? 0.1 : -0.09,
            0.48 + rng() * 0.14,
            0.42 + rng() * 0.13,
            0.47 + rng() * 0.11,
            rng() * 3,
          );
      }
      if (c % 3 === 2) {
        add(2, -0.05, 0.68, 0.08, 0.67, 1, 0.48, rng() * 3, 0.05);
        add(2, 0.23, 0.92, -0.08, 0.48, 1, 0.4, rng() * 3, -0.1);
      }
      transform.position.set(x, y - 0.03, z);
      transform.rotation.set(0, rng() * 3, 0);
      transform.scale.set(0.67, 0.19, 0.53);
      transform.updateMatrix();
      rockMatrices.push(transform.matrix.clone());
      if (c === 7)
        instances.forEach((items, i) => {
          compactCounts[i] = items.length;
        });
    }
    const geometries = [branchingGeometry(), organicGeometry(false), organicGeometry(true)];
    const names = ["O-CORAL-BRANCHES", "O-CORAL-BOULDERS", "O-CORAL-TABLES"];
    this.batches = instances.map((items, i) => {
      const mesh = new THREE.InstancedMesh(geometries[i]!, material, items.length);
      mesh.name = names[i]!;
      items.forEach((item, j) => mesh.setMatrixAt(j, item.matrix));
      this.group.add(mesh);
      return { mesh, instances: items, compactCount: compactCounts[i]! };
    });
    const rockMaterial = new THREE.MeshStandardMaterial({
      color: "#787563",
      map: maps.map,
      normalMap: maps.normalMap,
      normalScale: new THREE.Vector2(0.12, 0.12),
      roughness: 1,
    });
    const rocks = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), rockMaterial, 18);
    rocks.name = "O-CORAL-BASES";
    rockMatrices.forEach((matrix, i) => rocks.setMatrixAt(i, matrix));
    this.group.add(rocks);
    const sandGeometry = new THREE.PlaneGeometry(16, 10, 16, 8);
    sandGeometry.rotateX(-Math.PI / 2);
    const positions = sandGeometry.attributes.position!;
    for (let i = 0; i < positions.count; i++)
      positions.setY(i, Math.sin(positions.getX(i) * 2 + positions.getZ(i) * 1.3) * 0.018);
    sandGeometry.computeVertexNormals();
    const sandMap = maps.map?.clone();
    sandMap?.repeat.set(8, 5);
    const sand = new THREE.Mesh(
      sandGeometry,
      new THREE.MeshStandardMaterial({ color: "#A49A80", map: sandMap, roughness: 1 }),
    );
    sand.name = "O-REEF-SEABED";
    sand.position.set(0, -4.16, -1.2);
    this.group.add(sand);
    parent.add(this.group);
    this.setCompact(compact);
    this.setBleach(0);
  }

  setCompact(compact: boolean): void {
    this.batches.forEach((batch) => {
      batch.mesh.count = compact ? batch.compactCount : batch.instances.length;
    });
    const bases = this.group.getObjectByName("O-CORAL-BASES") as THREE.InstancedMesh;
    bases.count = compact ? 8 : 18;
    this.group.userData.clusterCount = compact ? 8 : 18;
  }

  setBleach(amount: number): void {
    const value = clamp01(amount);
    if (value === this.bleach) return;
    this.bleach = value;
    const color = this.color;
    this.batches.forEach((batch) => {
      batch.instances.forEach((item, i) => {
        color.copy(item.pigment).lerp(BONE, smoothstep(item.delay, 1, value));
        batch.mesh.setColorAt(i, color);
      });
      batch.mesh.instanceColor!.needsUpdate = true;
    });
    this.group.userData.bleach = value;
  }
}
