import * as THREE from "three";
import { CUES, PALETTE } from "@/lib/tokens";
import type { Scene } from "../director";
import { PROCESS_STATIONS, ProcessLine, type ProcessStationId } from "../objects/processline";
import type { SharedObjectHandle, StageContext } from "../stage";
import { clamp01, easeInOutQuad, lerp, smoothstep } from "../util/math";

const C9_RIM = new THREE.Color("#B9F3C9");
const C10_RIM = new THREE.Color(PALETTE.c10.accent);
const KEY_COLOR = new THREE.Color("#F4FBF6");
const FILL_SKY = new THREE.Color("#B9F3C9");
const FILL_GROUND = new THREE.Color("#143828");
const LOOK_AT = new THREE.Vector3(-1, 1.0, 0);

export interface StationWorldPosition {
  readonly id: ProcessStationId;
  readonly label: string;
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface ProcessStationsHandle extends SharedObjectHandle {
  getStationPositions(): readonly StationWorldPosition[];
}

/**
 * Scene B9 ("Hidup Baru, Tapi..."):
 * Jalur 4 stasiun Cacah -> Cuci -> Lebur (amber lokal <= 4%) -> Cetak -> Tote,
 * mengekspos posisi world 4 stasiun melalui shared slot 'stations'.
 */
export function createB9Scene(): Scene {
  let ctx: StageContext | null = null;
  let line: ProcessLine | null = null;

  return {
    id: "b9",

    build(stageCtx: StageContext) {
      ctx = stageCtx;
      line = new ProcessLine(
        stageCtx.scene,
        stageCtx.size.isPortrait || stageCtx.quality === "low",
      );
      line.group.visible = false;

      if (!stageCtx.shared.get("stations")) {
        const stationHandle: ProcessStationsHandle = {
          group: line.group,
          getStationPositions() {
            return PROCESS_STATIONS;
          },
        };
        stageCtx.shared.register("stations", stationHandle);
      }
    },

    enter() {
      if (!ctx || !line) return;
      const { bottle, contactShadow } = ctx.shared;
      const water = ctx.shared.get("water");
      if (water) water.group.visible = false;
      const particles = ctx.shared.get("particles");
      if (particles) particles.group.visible = false;
      const hand = ctx.shared.get("hand");
      if (hand) hand.group.visible = false;
      const flash = ctx.shared.get("flash") as
        { setActive?: (active: boolean) => void } | undefined;
      flash?.setActive?.(false);

      line.setCompactMode(ctx.size.isPortrait || ctx.quality === "low");
      line.reset();
      line.group.visible = true;

      bottle.reset();
      bottle.group.visible = true;
      bottle.group.position.set(0, 3.0, 0);
      bottle.setIdle(0, false);
      bottle.setParams({
        turbid: 0,
        dirt: 0,
        crack: 0,
        breakAmt: 0,
        opacity: 1,
        level: 0,
      });

      contactShadow.reset();
      contactShadow.setVisible(false);

      ctx.lights.key.color.copy(KEY_COLOR);
      ctx.lights.key.intensity = 2.1;
      ctx.lights.rim.color.copy(C9_RIM);
      ctx.lights.rim.intensity = CUES.c9.rim;
      ctx.lights.fill.color.copy(FILL_SKY);
      ctx.lights.fill.groundColor.copy(FILL_GROUND);
      ctx.lights.fill.intensity = 0.42;
      ctx.lights.spot.intensity = 0;
      ctx.scene.environmentIntensity = CUES.c9.env;
      ctx.scene.fog = null;

      ctx.applyResponsiveCamera(35);
      ctx.camera.position.set(-1, 2.4, 8.5);
      LOOK_AT.set(-1, 1.0, 0);
      ctx.camera.lookAt(LOOK_AT);
    },

    update(t: number) {
      if (!ctx || !line) return;
      const { bottle } = ctx.shared;
      const water = ctx.shared.get("water");
      if (water) water.group.visible = false;
      const particles = ctx.shared.get("particles");
      if (particles) particles.group.visible = false;
      const hand = ctx.shared.get("hand");
      if (hand) hand.group.visible = false;

      line.setCompactMode(ctx.size.isPortrait || ctx.quality === "low");
      line.group.visible = true;
      line.update(t);

      // Botol masuk corong CACAH dan menyusut pada t = 0.00..0.20
      if (t <= 0.2) {
        const dropK = easeInOutQuad(clamp01(t / 0.14));
        const shredK = clamp01((t - 0.08) / 0.12);
        bottle.group.visible = shredK < 0.96;
        bottle.group.position.set(0, lerp(3.0, 1.35, dropK), 0);
        bottle.group.scale.set(1, lerp(1, 0.04, shredK), 1);
      } else {
        bottle.group.visible = false;
        bottle.group.scale.set(1, 1, 1);
      }

      const cueMix = smoothstep(0.86, 1.0, t);
      ctx.lights.rim.intensity = lerp(CUES.c9.rim, CUES.c10.rim, cueMix);
      ctx.lights.rim.color.lerpColors(C9_RIM, C10_RIM, cueMix);
      ctx.scene.environmentIntensity = lerp(CUES.c9.env, CUES.c10.env, cueMix);

      const panX = -1 + 20 * easeInOutQuad(clamp01(t));
      const liftY = lerp(2.4, 2.75, smoothstep(0.86, 1.0, t));
      const pullZ = lerp(8.5, 9.6, smoothstep(0.86, 1.0, t));

      ctx.applyResponsiveCamera(35);
      ctx.camera.position.set(panX, liftY, pullZ);
      LOOK_AT.set(panX, 1.0, 0);
      ctx.camera.lookAt(LOOK_AT);
    },

    exit() {
      if (!ctx) return;
      ctx.shared.bottle.group.scale.set(1, 1, 1);
      if (line) {
        line.furnaceLight.intensity = 0;
        line.group.visible = false;
      }
    },

    dispose() {
      line?.dispose();
      line = null;
      ctx = null;
    },
  };
}
