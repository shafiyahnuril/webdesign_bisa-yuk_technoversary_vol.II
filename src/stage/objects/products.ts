import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import {
  makeBrushedMetalSet,
  makeCeramicGlazeSet,
  makeFabricPbrSet,
  makeWoodGrainSet,
  type PbrTextureSet,
} from "../textures/pbr-maps";
import { clamp01 } from "../util/math";

export type ProductId = "tote" | "tee" | "backpack" | "rug" | "bench" | "pot" | "fleece";

export interface ProductSpec {
  readonly id: ProductId;
  readonly name: string;
  readonly width: number;
  readonly height: number;
  readonly depth: number;
  readonly color: string;
  readonly x: number;
  readonly portraitVisible: boolean;
}

export const PRODUCT_SPECS: Record<ProductId, ProductSpec> = {
  tote: {
    id: "tote",
    name: "Tote bag",
    width: 2.6,
    height: 2.8,
    depth: 0.7,
    color: "#2A7F78",
    x: -9.6,
    portraitVisible: true,
  },
  tee: {
    id: "tee",
    name: "Kaus",
    width: 3.0,
    height: 3.0,
    depth: 0.3,
    color: "#579E82",
    x: -6.4,
    portraitVisible: true,
  },
  backpack: {
    id: "backpack",
    name: "Ransel",
    width: 2.6,
    height: 3.4,
    depth: 1.3,
    color: "#335B78",
    x: -3.2,
    portraitVisible: false,
  },
  rug: {
    id: "rug",
    name: "Karpet gulung",
    width: 1.1,
    height: 3.2,
    depth: 1.1,
    color: "#7EB2A0",
    x: 0,
    portraitVisible: true,
  },
  bench: {
    id: "bench",
    name: "Bangku taman",
    width: 3.4,
    height: 1.6,
    depth: 1.2,
    color: "#9E7858",
    x: 3.2,
    portraitVisible: true,
  },
  pot: {
    id: "pot",
    name: "Pot tanaman",
    width: 1.6,
    height: 1.8,
    depth: 1.6,
    color: "#5E8B7B",
    x: 6.4,
    portraitVisible: true,
  },
  fleece: {
    id: "fleece",
    name: "Jaket fleece",
    width: 3.0,
    height: 3.4,
    depth: 0.4,
    color: "#3F7A73",
    x: 9.6,
    portraitVisible: false,
  },
};

export const PRODUCT_ORDER: readonly ProductId[] = [
  "tote",
  "tee",
  "backpack",
  "rug",
  "bench",
  "pot",
  "fleece",
];

export interface ProductHandle {
  readonly id: ProductId;
  readonly group: THREE.Group;
  setDim(factor: number): void;
  reset(): void;
  dispose(): void;
}

interface ColorTrackedMaterial {
  readonly mat: THREE.MeshStandardMaterial;
  readonly base: THREE.Color;
}

function makeTrackedProduct(
  id: ProductId,
  buildFn: (
    trackMat: (m: THREE.MeshStandardMaterial) => THREE.MeshStandardMaterial,
    trackGeom: (g: THREE.BufferGeometry) => THREE.BufferGeometry,
    trackSet: (s: PbrTextureSet) => PbrTextureSet,
  ) => THREE.Group,
): ProductHandle {
  const trackedMats: ColorTrackedMaterial[] = [];
  const geoms: THREE.BufferGeometry[] = [];
  const sets: PbrTextureSet[] = [];

  const group = buildFn(
    (m) => {
      trackedMats.push({ mat: m, base: m.color.clone() });
      return m;
    },
    (g) => {
      geoms.push(g);
      return g;
    },
    (s) => {
      sets.push(s);
      return s;
    },
  );
  group.name = `Product_${id}`;

  return {
    id,
    group,
    setDim(factor: number) {
      const f = clamp01(factor);
      for (const entry of trackedMats) {
        entry.mat.color.copy(entry.base).multiplyScalar(f);
      }
    },
    reset() {
      group.visible = true;
      group.scale.set(1, 1, 1);
      group.rotation.set(0, 0, 0);
      for (const entry of trackedMats) {
        entry.mat.color.copy(entry.base);
      }
    },
    dispose() {
      group.removeFromParent();
      for (const g of geoms) g.dispose();
      for (const entry of trackedMats) entry.mat.dispose();
      for (const s of sets) s.dispose();
    },
  };
}

/** Tote bag kanvas tenun + jahitan & saku depan reusable (Bab 9 & Bab 10a). */
export function createToteProduct(): ProductHandle {
  return makeTrackedProduct("tote", (trackMat, trackGeom, trackSet) => {
    const group = new THREE.Group();
    const spec = PRODUCT_SPECS.tote;
    const canvasSet = trackSet(makeFabricPbrSet("canvas", 256, 2, 2));

    const bodyGeom = trackGeom(new RoundedBoxGeometry(spec.width, spec.height, spec.depth, 2, 0.1));
    const pocketGeom = trackGeom(new RoundedBoxGeometry(1.5, 1.1, 0.08, 2, 0.04));
    const seamGeom = trackGeom(new THREE.BoxGeometry(spec.width + 0.02, 0.12, spec.depth + 0.02));
    const handleGeom = trackGeom(new THREE.TorusGeometry(0.7, 0.055, 8, 18, Math.PI));

    const bodyMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: spec.color,
        map: canvasSet.map ?? null,
        normalMap: canvasSet.normalMap ?? null,
        normalScale: new THREE.Vector2(0.55, 0.55),
        roughnessMap: canvasSet.roughnessMap ?? null,
        roughness: 0.78,
        metalness: 0,
      }),
    );
    const pocketMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: "#22655F",
        map: canvasSet.map ?? null,
        normalMap: canvasSet.normalMap ?? null,
        normalScale: new THREE.Vector2(0.5, 0.5),
        roughness: 0.82,
        metalness: 0,
      }),
    );
    const handleMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: "#16433F",
        normalMap: canvasSet.normalMap ?? null,
        roughness: 0.74,
        metalness: 0,
      }),
    );

    const bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
    bodyMesh.position.set(0, spec.height * 0.5, 0);

    const topHem = new THREE.Mesh(seamGeom, handleMat);
    topHem.position.set(0, spec.height - 0.14, 0);

    const frontPocket = new THREE.Mesh(pocketGeom, pocketMat);
    frontPocket.position.set(0, 1.05, spec.depth * 0.5 + 0.02);

    const frontHandle = new THREE.Mesh(handleGeom, handleMat);
    frontHandle.position.set(0, spec.height - 0.06, 0.22);
    const backHandle = new THREE.Mesh(handleGeom, handleMat);
    backHandle.position.set(0, spec.height - 0.06, -0.22);

    group.add(bodyMesh, topHem, frontPocket, frontHandle, backHandle);
    return group;
  });
}

function createTeeProduct(): ProductHandle {
  return makeTrackedProduct("tee", (trackMat, trackGeom, trackSet) => {
    const group = new THREE.Group();
    const cottonSet = trackSet(makeFabricPbrSet("cotton", 256, 3, 3));
    const metalSet = trackSet(makeBrushedMetalSet(256, 1, 1));

    const shape = new THREE.Shape();
    shape.moveTo(-0.85, 0);
    shape.lineTo(0.85, 0);
    shape.lineTo(0.85, 1.85);
    shape.lineTo(1.5, 1.55);
    shape.lineTo(1.5, 2.35);
    shape.lineTo(0.75, 2.82);
    shape.lineTo(0.32, 2.82);
    shape.quadraticCurveTo(0, 2.52, -0.32, 2.82);
    shape.lineTo(-0.75, 2.82);
    shape.lineTo(-1.5, 2.35);
    shape.lineTo(-1.5, 1.55);
    shape.lineTo(-0.85, 1.85);
    shape.closePath();

    const bodyGeom = trackGeom(
      new THREE.ExtrudeGeometry(shape, {
        depth: 0.24,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.03,
        bevelSegments: 2,
        curveSegments: 4,
      }),
    );
    bodyGeom.translate(0, 0, -0.12);
    const bodyMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: PRODUCT_SPECS.tee.color,
        map: cottonSet.map ?? null,
        normalMap: cottonSet.normalMap ?? null,
        normalScale: new THREE.Vector2(0.45, 0.45),
        roughnessMap: cottonSet.roughnessMap ?? null,
        roughness: 0.86,
        metalness: 0,
      }),
    );
    const bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);

    // Hanger kawat baja sikat
    const wireMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: "#7E8E9E",
        normalMap: metalSet.normalMap ?? null,
        roughness: 0.28,
        metalness: 0.85,
      }),
    );
    const barGeom = trackGeom(new THREE.CylinderGeometry(0.03, 0.03, 1.4, 8));
    const hookGeom = trackGeom(new THREE.TorusGeometry(0.14, 0.028, 6, 12, Math.PI * 1.35));
    const leftArm = new THREE.Mesh(barGeom, wireMat);
    leftArm.position.set(-0.45, 2.94, 0);
    leftArm.rotation.z = 1.24;
    const rightArm = new THREE.Mesh(barGeom, wireMat);
    rightArm.position.set(0.45, 2.94, 0);
    rightArm.rotation.z = -1.24;
    const hook = new THREE.Mesh(hookGeom, wireMat);
    hook.position.set(0, 3.24, 0);

    group.add(bodyMesh, leftArm, rightArm, hook);
    return group;
  });
}

function createBackpackProduct(): ProductHandle {
  return makeTrackedProduct("backpack", (trackMat, trackGeom, trackSet) => {
    const group = new THREE.Group();
    const spec = PRODUCT_SPECS.backpack;
    const nylonSet = trackSet(makeFabricPbrSet("nylon", 256, 2, 2));
    const metalSet = trackSet(makeBrushedMetalSet(256, 1, 1));

    const bodyGeom = trackGeom(
      new RoundedBoxGeometry(spec.width, spec.height, spec.depth, 2, 0.14),
    );
    const pocketGeom = trackGeom(new RoundedBoxGeometry(1.7, 1.4, 0.35, 2, 0.08));
    const strapGeom = trackGeom(new THREE.BoxGeometry(0.32, 2.4, 0.16));
    const buckleGeom = trackGeom(new THREE.BoxGeometry(0.38, 0.16, 0.12));
    const loopGeom = trackGeom(new THREE.TorusGeometry(0.24, 0.05, 6, 12, Math.PI));

    const bodyMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: spec.color,
        map: nylonSet.map ?? null,
        normalMap: nylonSet.normalMap ?? null,
        normalScale: new THREE.Vector2(0.45, 0.45),
        roughnessMap: nylonSet.roughnessMap ?? null,
        roughness: 0.48,
        metalness: 0.06,
      }),
    );
    const accentMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: "#1F374A",
        normalMap: nylonSet.normalMap ?? null,
        roughness: 0.56,
        metalness: 0.04,
      }),
    );
    const buckleMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: "#8D9AA8",
        normalMap: metalSet.normalMap ?? null,
        roughness: 0.28,
        metalness: 0.85,
      }),
    );

    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.position.set(0, spec.height * 0.5, 0);

    const pocket = new THREE.Mesh(pocketGeom, accentMat);
    pocket.position.set(0, 1.05, spec.depth * 0.5 + 0.1);

    const zipBar = new THREE.Mesh(buckleGeom, buckleMat);
    zipBar.position.set(0, 1.72, spec.depth * 0.5 + 0.22);

    const strapL = new THREE.Mesh(strapGeom, accentMat);
    strapL.position.set(-0.72, 1.65, -spec.depth * 0.5 - 0.08);
    const strapR = new THREE.Mesh(strapGeom, accentMat);
    strapR.position.set(0.72, 1.65, -spec.depth * 0.5 - 0.08);

    const loop = new THREE.Mesh(loopGeom, accentMat);
    loop.position.set(0, spec.height, 0);

    group.add(body, pocket, zipBar, strapL, strapR, loop);
    return group;
  });
}

function createRugProduct(): ProductHandle {
  return makeTrackedProduct("rug", (trackMat, trackGeom, trackSet) => {
    const group = new THREE.Group();
    const woolSet = trackSet(makeFabricPbrSet("wool", 256, 3, 4));
    const woodSet = trackSet(makeWoodGrainSet(256, 1, 1));

    const cylGeom = trackGeom(new THREE.CylinderGeometry(0.55, 0.55, 3.2, 16));
    const coreGeom = trackGeom(new THREE.CylinderGeometry(0.18, 0.18, 3.22, 10));

    const bodyMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: PRODUCT_SPECS.rug.color,
        map: woolSet.map ?? null,
        normalMap: woolSet.normalMap ?? null,
        normalScale: new THREE.Vector2(0.65, 0.65),
        roughnessMap: woolSet.roughnessMap ?? null,
        roughness: 0.88,
        metalness: 0,
      }),
    );
    const coreMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: "#7E6045",
        map: woodSet.map ?? null,
        normalMap: woodSet.normalMap ?? null,
        roughness: 0.72,
      }),
    );

    const cyl = new THREE.Mesh(cylGeom, bodyMat);
    cyl.position.set(0, 1.6, 0);
    const core = new THREE.Mesh(coreGeom, coreMat);
    core.position.set(0, 1.6, 0);

    group.add(cyl, core);
    return group;
  });
}

function createBenchProduct(): ProductHandle {
  return makeTrackedProduct("bench", (trackMat, trackGeom, trackSet) => {
    const group = new THREE.Group();
    const woodSet = trackSet(makeWoodGrainSet(256, 2, 1));
    const metalSet = trackSet(makeBrushedMetalSet(256, 1, 1));

    const seatGeom = trackGeom(new RoundedBoxGeometry(3.4, 0.16, 0.52, 2, 0.03));
    const backGeom = trackGeom(new RoundedBoxGeometry(3.4, 0.56, 0.16, 2, 0.03));
    const legGeom = trackGeom(new THREE.BoxGeometry(0.24, 0.78, 1.08));

    const woodMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: "#C29C76",
        map: woodSet.map ?? null,
        normalMap: woodSet.normalMap ?? null,
        normalScale: new THREE.Vector2(0.55, 0.55),
        roughnessMap: woodSet.roughnessMap ?? null,
        roughness: 0.64,
        metalness: 0,
      }),
    );
    const frameMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: "#27373E",
        normalMap: metalSet.normalMap ?? null,
        roughnessMap: metalSet.roughnessMap ?? null,
        roughness: 0.38,
        metalness: 0.72,
      }),
    );

    const frontSeat = new THREE.Mesh(seatGeom, woodMat);
    frontSeat.position.set(0, 0.82, 0.28);
    const backSeat = new THREE.Mesh(seatGeom, woodMat);
    backSeat.position.set(0, 0.82, -0.28);
    const backrest = new THREE.Mesh(backGeom, woodMat);
    backrest.position.set(0, 1.32, -0.52);

    const legL = new THREE.Mesh(legGeom, frameMat);
    legL.position.set(-1.35, 0.39, 0);
    const legR = new THREE.Mesh(legGeom, frameMat);
    legR.position.set(1.35, 0.39, 0);

    group.add(frontSeat, backSeat, backrest, legL, legR);
    return group;
  });
}

function createPotProduct(): ProductHandle {
  return makeTrackedProduct("pot", (trackMat, trackGeom, trackSet) => {
    const group = new THREE.Group();
    const ceramicSet = trackSet(makeCeramicGlazeSet(256));

    const pts = [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(0.5, 0),
      new THREE.Vector2(0.76, 1.45),
      new THREE.Vector2(0.8, 1.72),
      new THREE.Vector2(0.72, 1.8),
      new THREE.Vector2(0.64, 1.8),
      new THREE.Vector2(0.58, 1.45),
      new THREE.Vector2(0, 1.45),
    ];
    const potGeom = trackGeom(new THREE.LatheGeometry(pts, 16));
    const soilGeom = trackGeom(new THREE.CylinderGeometry(0.62, 0.58, 0.08, 14));
    const leafGeom = trackGeom(new THREE.ConeGeometry(0.26, 1.1, 8));

    const potMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: PRODUCT_SPECS.pot.color,
        map: ceramicSet.map ?? null,
        normalMap: ceramicSet.normalMap ?? null,
        roughnessMap: ceramicSet.roughnessMap ?? null,
        roughness: 0.42,
        metalness: 0.04,
      }),
    );
    const soilMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: "#3B2D22",
        roughness: 0.94,
        metalness: 0,
      }),
    );
    const leafMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: "#3A7459",
        roughness: 0.54,
        metalness: 0.02,
      }),
    );

    const potMesh = new THREE.Mesh(potGeom, potMat);
    const soilMesh = new THREE.Mesh(soilGeom, soilMat);
    soilMesh.position.set(0, 1.46, 0);
    group.add(potMesh, soilMesh);

    // 5 daun kerucut di atas pot
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const leaf = new THREE.Mesh(leafGeom, leafMat);
      leaf.position.set(Math.cos(angle) * 0.24, 2.0, Math.sin(angle) * 0.24);
      leaf.rotation.z = -Math.cos(angle) * 0.42;
      leaf.rotation.x = Math.sin(angle) * 0.42;
      group.add(leaf);
    }
    return group;
  });
}

function createFleeceProduct(): ProductHandle {
  return makeTrackedProduct("fleece", (trackMat, trackGeom, trackSet) => {
    const group = new THREE.Group();
    const fleeceSet = trackSet(makeFabricPbrSet("fleece", 256, 2, 2));
    const metalSet = trackSet(makeBrushedMetalSet(256, 1, 1));

    const shape = new THREE.Shape();
    shape.moveTo(-0.92, 0);
    shape.lineTo(0.92, 0);
    shape.lineTo(0.92, 2.1);
    shape.lineTo(1.5, 0.95);
    shape.lineTo(1.5, 2.55);
    shape.lineTo(0.85, 3.2);
    shape.lineTo(0.32, 3.4);
    shape.lineTo(-0.32, 3.4);
    shape.lineTo(-0.85, 3.2);
    shape.lineTo(-1.5, 2.55);
    shape.lineTo(-1.5, 0.95);
    shape.lineTo(-0.92, 2.1);
    shape.closePath();

    const bodyGeom = trackGeom(
      new THREE.ExtrudeGeometry(shape, {
        depth: 0.34,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.03,
        bevelSegments: 2,
        curveSegments: 4,
      }),
    );
    bodyGeom.translate(0, 0, -0.17);
    const zipGeom = trackGeom(new THREE.BoxGeometry(0.08, 3.05, 0.42));

    const bodyMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: PRODUCT_SPECS.fleece.color,
        map: fleeceSet.map ?? null,
        normalMap: fleeceSet.normalMap ?? null,
        normalScale: new THREE.Vector2(0.75, 0.75),
        roughnessMap: fleeceSet.roughnessMap ?? null,
        roughness: 0.9,
        metalness: 0,
      }),
    );
    const zipMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: "#697984",
        normalMap: metalSet.normalMap ?? null,
        roughness: 0.32,
        metalness: 0.78,
      }),
    );

    const body = new THREE.Mesh(bodyGeom, bodyMat);
    const zip = new THREE.Mesh(zipGeom, zipMat);
    zip.position.set(0, 1.55, 0.02);

    group.add(body, zip);
    return group;
  });
}

export class Products {
  readonly group = new THREE.Group();
  readonly items: readonly ProductHandle[];

  private readonly byId: Record<ProductId, ProductHandle>;
  private readonly shelfTopY: number;

  constructor(parent: THREE.Object3D, shelfTopY = 0.76) {
    this.group.name = "O-PRODUCTS";
    this.shelfTopY = shelfTopY;

    const built: Record<ProductId, ProductHandle> = {
      tote: createToteProduct(),
      tee: createTeeProduct(),
      backpack: createBackpackProduct(),
      rug: createRugProduct(),
      bench: createBenchProduct(),
      pot: createPotProduct(),
      fleece: createFleeceProduct(),
    };
    this.byId = built;
    this.items = PRODUCT_ORDER.map((id) => built[id]);

    for (const item of this.items) {
      const spec = PRODUCT_SPECS[item.id];
      item.group.position.set(spec.x, this.shelfTopY, 0);
      this.group.add(item.group);
    }

    parent.add(this.group);
  }

  getProduct(id: ProductId): ProductHandle {
    return this.byId[id];
  }

  setDim(factor: number): void {
    for (const item of this.items) {
      item.setDim(factor);
    }
  }

  /** Pada mode HP portrait, hanya 5 produk tampil (tanpa backpack dan fleece). */
  setCompactMode(compact: boolean): void {
    for (const item of this.items) {
      const spec = PRODUCT_SPECS[item.id];
      item.group.visible = compact ? spec.portraitVisible : true;
    }
  }

  reset(): void {
    this.group.visible = true;
    this.setDim(1);
    for (const item of this.items) {
      item.reset();
      const spec = PRODUCT_SPECS[item.id];
      item.group.position.set(spec.x, this.shelfTopY, 0);
    }
  }

  dispose(): void {
    this.group.removeFromParent();
    for (const item of this.items) {
      item.dispose();
    }
  }
}
