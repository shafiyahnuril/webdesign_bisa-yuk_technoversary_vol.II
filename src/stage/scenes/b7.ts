import * as THREE from "three";
import { CUES, PALETTE } from "@/lib/tokens";
import type { Scene } from "../director";
import { Bins } from "../objects/bins";
import { Hand } from "../objects/hand";
import type { StageContext } from "../stage";
import { clamp01, easeInOutQuad, lerp, smoothstep } from "../util/math";
import { createFlashPass, type FlashPass } from "./flash";

const C7_ACCENT = new THREE.Color(PALETTE.c7.accent);
const C8_ACCENT = new THREE.Color(PALETTE.c8.accent);
const KEY_COLOR = new THREE.Color("#EAF4FF");
const FILL_SKY = new THREE.Color("#9FE6D0");
const FILL_GROUND = new THREE.Color("#132F38");
const LOOK_AT = new THREE.Vector3(0, 1.35, 0);

const HAND_START_X = 1.1;
const HAND_START_Y = 0.9;
const HAND_DROP_X = -1.5; // palmAnchor (-0.5) berada tepat di atas x=-2.0 (Plastik)
const HAND_EXIT_X = 4.2;
const PLASTIK_X = -2.0;

/**
 * Scene B7 ("Di Tempat yang Benar"):
 * Tangan membawa botol kosong ke tempat sampah Plastik (-2.0), tutup berengsel membuka,
 * botol jatuh lurus masuk, dan jendela kilas scissor aktif pada t=[0.40..0.70].
 */
export function createB7Scene(): Scene {
  let ctx: StageContext | null = null;
  let hand: Hand | null = null;
  let bins: Bins | null = null;
  let flashPass: FlashPass | null = null;

  return {
    id: "b7",

    build(stageCtx: StageContext) {
      ctx = stageCtx;
      const existingHand = stageCtx.shared.get<Hand>("hand");
      if (existingHand) {
        hand = existingHand;
      } else {
        hand = stageCtx.shared.register("hand", new Hand(stageCtx.scene));
        hand.group.visible = false;
      }
      bins = new Bins(stageCtx.scene);
      bins.group.visible = false;

      flashPass =
        stageCtx.shared.get<FlashPass>("flash") ??
        stageCtx.shared.register("flash", createFlashPass(stageCtx));
    },

    enter() {
      if (!ctx || !hand || !bins || !flashPass) return;
      const { bottle, contactShadow } = ctx.shared;
      const water = ctx.shared.get("water");
      if (water) water.group.visible = false;
      const particles = ctx.shared.get("particles");
      if (particles) particles.group.visible = false;

      bins.reset();
      bins.group.visible = true;

      hand.reset();
      hand.group.visible = true;
      hand.setScaleFactor(ctx.size.isPortrait ? 0.85 : 1);
      hand.group.position.set(HAND_START_X, HAND_START_Y, 0);
      hand.setPose("GRIP", "GRIP", 1);

      bottle.reset();
      bottle.group.visible = true;
      bottle.group.position.set(0.6, 0.5, 0);
      bottle.group.rotation.set(0, Math.PI * 0.25, 0);
      bottle.setParams({
        turbid: CUES.c7.turbid,
        crack: 0,
        breakAmt: 0,
        dirt: 0,
        opacity: 1,
        level: 0.03,
      });
      hand.group.updateMatrixWorld(true);
      bottle.attachToHand(hand.palmAnchor, true);

      contactShadow.reset();
      contactShadow.setPosition(PLASTIK_X, 0.002, 0);
      contactShadow.setScale(1.8);
      contactShadow.setOpacity(0.28);
      contactShadow.setVisible(true);

      flashPass.reset();

      ctx.lights.key.color.copy(KEY_COLOR);
      ctx.lights.key.intensity = 2.2;
      ctx.lights.rim.color.copy(C7_ACCENT);
      ctx.lights.rim.intensity = CUES.c7.rim;
      ctx.lights.fill.color.copy(FILL_SKY);
      ctx.lights.fill.groundColor.copy(FILL_GROUND);
      ctx.lights.fill.intensity = 0.42;
      ctx.lights.spot.intensity = 0;
      ctx.scene.environmentIntensity = CUES.c7.env;
      ctx.scene.fog = null;

      ctx.applyResponsiveCamera(35);
      const camX = ctx.size.isPortrait ? -0.95 : 0;
      ctx.camera.position.set(camX, 1.4, 6.8);
      LOOK_AT.set(camX, 1.3, 0);
      ctx.camera.lookAt(LOOK_AT);
    },

    update(t: number) {
      if (!ctx || !hand || !bins || !flashPass) return;
      const { bottle, contactShadow } = ctx.shared;
      const water = ctx.shared.get("water");
      if (water) water.group.visible = false;
      const particles = ctx.shared.get("particles");
      if (particles) particles.group.visible = false;
      const isPortrait = ctx.size.isPortrait;

      bins.group.visible = true;
      bottle.group.visible = true;
      hand.setScaleFactor(isPortrait ? 0.85 : 1);
      hand.group.rotation.set(0, 0, 0);

      let camZ = 6.8;
      let binOffsetY = 0;
      let lidOpen = 0;

      if (t <= 0.12) {
        // 7a: Tangan menahan botol tegak di kanan
        hand.group.visible = true;
        hand.group.position.set(HAND_START_X, HAND_START_Y, 0);
        hand.setPose("GRIP", "GRIP", 1);
        if (bottle.group.parent !== hand.palmAnchor) {
          bottle.detach(false);
          bottle.group.position.set(0.6, 0.5, 0);
          bottle.group.rotation.set(0, Math.PI * 0.25, 0);
          hand.group.updateMatrixWorld(true);
          bottle.attachToHand(hand.palmAnchor, true);
        }
        camZ = 6.8;
      } else if (t <= 0.4) {
        // 7b: Kamera mundur mengungkap 3 tempat sampah, tangan membawa ke Plastik (-2.0) lalu lepas
        const pullK = easeInOutQuad(clamp01((t - 0.12) / 0.22));
        camZ = lerp(6.8, 9.0, pullK);

        if (t <= 0.26) {
          const carryK = easeInOutQuad(clamp01((t - 0.12) / 0.14));
          hand.group.visible = true;
          hand.group.position.set(
            lerp(HAND_START_X, HAND_DROP_X, carryK),
            lerp(HAND_START_Y, 2.35, carryK),
            0,
          );
          hand.setPose("GRIP", "GRIP", 1);
          if (bottle.group.parent !== hand.palmAnchor) {
            bottle.detach(false);
            bottle.group.position.set(0.6, 0.5, 0);
            bottle.group.rotation.set(0, Math.PI * 0.25, 0);
            hand.group.position.set(HAND_START_X, HAND_START_Y, 0);
            hand.group.updateMatrixWorld(true);
            bottle.attachToHand(hand.palmAnchor, true);
            hand.group.position.set(
              lerp(HAND_START_X, HAND_DROP_X, carryK),
              lerp(HAND_START_Y, 2.35, carryK),
              0,
            );
          }
          lidOpen = smoothstep(0.16, 0.25, t);
        } else {
          // Lepas botol lurus ke dalam Plastik (-2.0), pantulan kecil, tutup menutup, tangan keluar
          const dropK = clamp01((t - 0.26) / 0.1);
          const bounce = Math.sin(dropK * Math.PI) * 0.12 * (1 - dropK);
          bottle.detach(false);
          bottle.group.position.set(PLASTIK_X, lerp(1.95, 0.48, easeInOutQuad(dropK)) + bounce, 0);
          bottle.group.rotation.set(0, Math.PI * 0.25, 0);

          const exitK = easeInOutQuad(clamp01((t - 0.27) / 0.13));
          hand.group.visible = exitK < 0.99;
          hand.group.position.set(lerp(HAND_DROP_X, HAND_EXIT_X, exitK), lerp(2.35, 1.4, exitK), 0);
          hand.setPose("GRIP", "RELEASE", smoothstep(0.26, 0.31, t));

          lidOpen = 1 - smoothstep(0.32, 0.4, t);
        }
      } else {
        // 7c..akhir: Tutup tertutup, botol diam di dalam tempat sampah Plastik
        camZ = 9.0;
        hand.group.visible = false;
        lidOpen = 0;

        const sinkK = smoothstep(0.9, 1.0, t);
        binOffsetY = lerp(0, -0.3, sinkK);
        bottle.detach(false);
        bottle.group.position.set(PLASTIK_X, 0.48 + binOffsetY, 0);
        bottle.group.rotation.set(0, Math.PI * 0.25, 0);
        bottle.group.visible = sinkK < 0.95;
      }

      bins.setLidOpen("PLASTIK", lidOpen);
      bins.setLidOpen("KERTAS", 0);
      bins.setLidOpen("ORGANIK", 0);
      bins.setOffsetY(binOffsetY);

      // Jendela kilas aktif pada rentang 7c: [0.40, 0.70]
      flashPass.setActive(t >= 0.4 && t <= 0.7);

      const cueMix = smoothstep(0.9, 1.0, t);
      bottle.setParams({
        turbid: lerp(CUES.c7.turbid, CUES.c8.turbid, cueMix),
        crack: 0,
        breakAmt: 0,
        dirt: 0,
        opacity: 1,
        level: 0.03,
      });

      contactShadow.setPosition(PLASTIK_X, 0.002 + binOffsetY, 0);
      contactShadow.setScale(1.8);
      contactShadow.setOpacity(0.28 * (1 - smoothstep(0.9, 1.0, t)));
      contactShadow.setVisible(true);

      ctx.lights.rim.intensity = lerp(CUES.c7.rim, CUES.c8.rim, cueMix);
      ctx.lights.rim.color.lerpColors(C7_ACCENT, C8_ACCENT, cueMix);
      ctx.scene.environmentIntensity = lerp(CUES.c7.env, CUES.c8.env, cueMix);

      ctx.applyResponsiveCamera(35);
      // Komposisi editorial: narasi di kiri, seluruh aksi tetap satu koordinat dunia.
      const composition = isPortrait ? 0 : smoothstep(0.04, 0.3, t);
      if (!isPortrait) {
        ctx.camera.setViewOffset(
          ctx.size.w,
          ctx.size.h,
          -ctx.size.w * 0.22 * composition,
          0,
          ctx.size.w,
          ctx.size.h,
        );
      }
      const camX = isPortrait ? -1.05 : 0;
      const portraitZBoost = isPortrait ? 1.2 : 0;
      ctx.camera.position.set(camX, 1.45, camZ + portraitZBoost + 2.3 * composition);
      LOOK_AT.set(camX, 1.3 + binOffsetY * 0.5 + 0.35 * composition, 0);
      ctx.camera.lookAt(LOOK_AT);
    },

    exit() {
      if (!ctx) return;
      ctx.camera.clearViewOffset();
      ctx.shared.bottle.detach(false);
      if (bins) bins.group.visible = false;
      if (hand) hand.group.visible = false;
      flashPass?.setActive(false);
    },

    dispose() {
      bins?.dispose();
      bins = null;
      flashPass = null;
      hand = null;
      ctx = null;
    },
  };
}
