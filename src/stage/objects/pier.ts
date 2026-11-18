import * as THREE from "three";
import { makeMarineTimberSet } from "../textures/pbr-maps";
import { createRng } from "../util/rng";

/** Empat tiang kayu, papan dek terpisah, balok pengikat, baut, dan jejak pasang-surut. */
export function createPier(parent: THREE.Object3D): THREE.Group {
  const group = new THREE.Group();
  group.name = "O-PIER";
  const pileMaps = makeMarineTimberSet(true);
  const deckMaps = makeMarineTimberSet();
  const pileMaterial = new THREE.MeshStandardMaterial({
    color: "#FFFFFF",
    map: pileMaps.map,
    normalMap: pileMaps.normalMap,
    roughnessMap: pileMaps.roughnessMap,
    normalScale: new THREE.Vector2(0.28, 0.28),
    roughness: 1,
    metalness: 0,
  });
  const deckMaterial = new THREE.MeshStandardMaterial({
    color: "#FFFFFF",
    map: deckMaps.map,
    normalMap: deckMaps.normalMap,
    roughnessMap: deckMaps.roughnessMap,
    normalScale: new THREE.Vector2(0.22, 0.22),
    roughness: 1,
    metalness: 0,
  });
  const paintMaterial = new THREE.MeshStandardMaterial({ color: "#CBC5AE", roughness: 0.93 });
  const metalMaterial = new THREE.MeshStandardMaterial({
    color: "#62645F",
    roughness: 0.5,
    metalness: 0.78,
  });
  const shellMaterial = new THREE.MeshStandardMaterial({ color: "#B5AD92", roughness: 0.92 });
  const posts = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.12, 0.135, 4, 12),
    pileMaterial,
    4,
  );
  posts.name = "O-PIER-POSTS";
  const ticks = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.137, 0.137, 0.024, 8, 1, true),
    paintMaterial,
    28,
  );
  ticks.name = "O-PIER-TICKS";
  const planks = new THREE.InstancedMesh(new THREE.BoxGeometry(0.182, 0.13, 1.85), deckMaterial, 9);
  planks.name = "O-PIER-PLANKS";
  const beams = new THREE.InstancedMesh(new THREE.BoxGeometry(1.75, 0.16, 0.15), deckMaterial, 2);
  beams.name = "O-PIER-BEAMS";
  const bolts = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.022, 0.022, 0.016, 6),
    metalMaterial,
    8,
  );
  bolts.name = "O-PIER-BOLTS";
  const shells = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), shellMaterial, 20);
  shells.name = "O-PIER-BARNACLES";
  const transform = new THREE.Object3D();
  const tint = new THREE.Color();
  const rng = createRng(912);
  const positions = [
    [2.15, -1.2],
    [3.25, -1.2],
    [2.3, -2.5],
    [3.4, -2.5],
  ] as const;
  let tickIndex = 0;
  for (let i = 0; i < positions.length; i++) {
    const [x, z] = positions[i]!;
    transform.position.set(x, -0.2, z);
    transform.updateMatrix();
    posts.setMatrixAt(i, transform.matrix);
    posts.setColorAt(i, tint.setScalar(0.87 + rng() * 0.13));
    for (const y of [-1.5, -1, -0.5, 0, 0.5, 1, 1.5]) {
      transform.position.set(x, y, z);
      transform.updateMatrix();
      ticks.setMatrixAt(tickIndex++, transform.matrix);
    }
    for (let j = 0; j < 5; j++) {
      const a = rng() * Math.PI * 2;
      transform.position.set(x + Math.cos(a) * 0.13, -0.08 + rng() * 0.28, z + Math.sin(a) * 0.13);
      transform.scale.setScalar(0.022 + rng() * 0.015);
      transform.updateMatrix();
      shells.setMatrixAt(i * 5 + j, transform.matrix);
    }
    transform.scale.setScalar(1);
    for (let j = 0; j < 2; j++) {
      transform.position.set(x + (j ? 0.045 : -0.045), 1.756, z);
      transform.updateMatrix();
      bolts.setMatrixAt(i * 2 + j, transform.matrix);
    }
  }
  for (let i = 0; i < 9; i++) {
    transform.position.set(2.78 + (i - 4) * 0.195, 1.68 + (rng() - 0.5) * 0.008, -1.85);
    transform.updateMatrix();
    planks.setMatrixAt(i, transform.matrix);
    planks.setColorAt(i, tint.setRGB(0.86 + rng() * 0.12, 0.86 + rng() * 0.1, 0.83 + rng() * 0.12));
  }
  for (let i = 0; i < 2; i++) {
    transform.position.set(2.78, 1.52, i ? -2.5 : -1.2);
    transform.updateMatrix();
    beams.setMatrixAt(i, transform.matrix);
  }
  group.add(posts, ticks, planks, beams, bolts, shells);
  parent.add(group);
  return group;
}
