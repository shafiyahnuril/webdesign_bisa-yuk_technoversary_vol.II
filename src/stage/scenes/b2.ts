import * as THREE from "three";
import { CUES, PALETTE } from "@/lib/tokens";
import type { Scene } from "../director";
import { Hand } from "../objects/hand";
import type { StageContext } from "../stage";
import { clamp01, degToRad, easeHeavyIn, easeInOutQuad, lerp, smoothstep } from "../util/math";

const C2_ACCENT = new THREE.Color(PALETTE.c2.accent);
const C3_ACCENT = new THREE.Color(PALETTE.c3.accent);
const KEY_COLOR = new THREE.Color("#EAF4FF");
const FILL_SKY = new THREE.Color("#8FB0CC");
const FILL_GROUND = new THREE.Color("#0A1226");
const LOOK_AT = new THREE.Vector3(0, 1.05, 0);

const BOTTLE_REST_X = 0.6;
const HAND_REST_X = 1.1;
const HAND_REST_Y = 0.4;
const HAND_ENTRY_X = 4.0;
const HAND_ENTRY_Y = -2.2;
const THROW_START_X = 0.6;
const THROW_START_Y = 0.4;
const THROW_END_X = -4.2;
const THROW_END_Y = -3.4;

const CAM_Z = 6.6;
const CAM_BASE_Y = 1.05;
const INITIAL_TILT_OFFSET = Math.tan(degToRad(2)) * CAM_Z;
const THROW_TILT_OFFSET = Math.tan(degToRad(8)) * CAM_Z;

/**
 * Scene B2 ("Sekali Pakai"):
 * Tangan masuk menggenggam botol dari kanan-bawah, memiringkan untuk minum (85%->3%),
 * lalu melempar parabola ke kiri-bawah menuju sungai Bab 3.
 */
export function createB2Scene(): Scene {
  let ctx: StageContext | null = null;
  let hand: Hand | null = null;

  return {
    id: "b2",

    build(stageCtx: StageContext) {
      ctx = stageCtx;
      const existing = stageCtx.shared.get<Hand>("hand");
      if (existing) {
        hand = existing;
      } else {
        hand = stageCtx.shared.register("hand", new Hand(stageCtx.scene));
        hand.group.visible = false;
      }
    },

    enter() {
      if (!ctx || !hand) return;
      const { bottle, contactShadow } = ctx.shared;
      const water = ctx.shared.get("water");
      if (water) water.group.visible = false;
      const particles = ctx.shared.get("particles");
      if (particles) particles.group.visible = false;
      const flash = ctx.shared.get("flash") as
        { setActive?: (active: boolean) => void } | undefined;
      flash?.setActive?.(false);

      bottle.reset();
      bottle.group.position.set(BOTTLE_REST_X, 0, 0);
      bottle.group.rotation.set(0, Math.PI * 1.2, 0);
      bottle.setIdle(0, false);
      bottle.setParams({
        turbid: CUES.c2.turbid,
        crack: 0,
        breakAmt: 0,
        dirt: 0,
        opacity: 1,
        level: 0.85,
      });

      hand.reset();
      hand.group.visible = true;
      hand.setScaleFactor(ctx.size.isPortrait ? 0.85 : 1);

      contactShadow.reset();
      contactShadow.setPosition(BOTTLE_REST_X, 0.002, 0);
      contactShadow.setScale(1.35);
      contactShadow.setOpacity(0.35);
      contactShadow.setVisible(true);

      ctx.lights.key.color.copy(KEY_COLOR);
      ctx.lights.key.intensity = 2.2;
      ctx.lights.rim.color.copy(C2_ACCENT);
      ctx.lights.rim.intensity = CUES.c2.rim;
      ctx.lights.fill.color.copy(FILL_SKY);
      ctx.lights.fill.groundColor.copy(FILL_GROUND);
      ctx.lights.fill.intensity = 0.35;
      ctx.lights.spot.intensity = 0;
      ctx.scene.environmentIntensity = CUES.c2.env;
      ctx.scene.fog = null;

      ctx.applyResponsiveCamera(35);
      ctx.camera.position.set(0, CAM_BASE_Y, CAM_Z);
      LOOK_AT.set(0, CAM_BASE_Y - INITIAL_TILT_OFFSET, 0);
      ctx.camera.lookAt(LOOK_AT);
    },

    update(t: number) {
      if (!ctx || !hand) return;
      const { bottle, contactShadow } = ctx.shared;
      const water = ctx.shared.get("water");
      if (water) water.group.visible = false;
      const particles = ctx.shared.get("particles");
      if (particles) particles.group.visible = false;
      const handScale = ctx.size.isPortrait ? 0.85 : 1;

      hand.group.visible = true;
      hand.setScaleFactor(handScale);
      bottle.group.visible = true;
      bottle.setIdle(0, false);

      let level = 0.85;
      let camLookY = CAM_BASE_Y - INITIAL_TILT_OFFSET;
      let shadowVisible = true;
      let shadowOpacity = 0.35;

      // Reset orientasi dasar terlebih dulu agar scrub mundur selalu bersih
      hand.group.rotation.set(0, 0, 0);

      if (t <= 0.12) {
        // Tangan masuk OPEN menuju posisi genggam
        const k = easeInOutQuad(clamp01(t / 0.12));
        bottle.detach(false);
        bottle.group.position.set(BOTTLE_REST_X, 0, 0);
        bottle.group.rotation.set(0, Math.PI * 1.2, 0);
        hand.group.position.set(
          lerp(HAND_ENTRY_X, HAND_REST_X, k),
          lerp(HAND_ENTRY_Y, HAND_REST_Y, k),
          0,
        );
        hand.setPose("OPEN", "OPEN", 0);
      } else if (t <= 0.22) {
        // Genggam dan parent botol ke jangkar telapak di paruh fase
        const k = smoothstep(0.12, 0.22, t);
        hand.group.position.set(HAND_REST_X, HAND_REST_Y, 0);
        hand.setPose("OPEN", "GRIP", k);
        if (t >= 0.18) {
          if (bottle.group.parent !== hand.palmAnchor) {
            bottle.detach(false);
            bottle.group.position.set(BOTTLE_REST_X, 0, 0);
            bottle.group.rotation.set(0, Math.PI * 1.2, 0);
            hand.group.updateMatrixWorld(true);
            bottle.attachToHand(hand.palmAnchor, true);
          }
        } else {
          bottle.detach(false);
          bottle.group.position.set(BOTTLE_REST_X, 0, 0);
          bottle.group.rotation.set(0, Math.PI * 1.2, 0);
        }
      } else if (t <= 0.52) {
        // Minum: lengan miring Z agar tutup ke kiri-atas, cairan turun 85% -> 3%
        const k = easeInOutQuad(clamp01((t - 0.22) / 0.3));
        hand.group.position.set(HAND_REST_X, lerp(HAND_REST_Y, 1.5, k), 0);
        hand.group.rotation.set(0, 0, lerp(0, degToRad(72), k));
        hand.setPose("GRIP", "GRIP", 1);
        if (bottle.group.parent !== hand.palmAnchor) {
          bottle.detach(false);
          bottle.group.position.set(BOTTLE_REST_X, 0, 0);
          bottle.group.rotation.set(0, Math.PI * 1.2, 0);
          hand.group.position.set(HAND_REST_X, HAND_REST_Y, 0);
          hand.group.rotation.set(0, 0, 0);
          hand.group.updateMatrixWorld(true);
          bottle.attachToHand(hand.palmAnchor, true);
          hand.group.position.set(HAND_REST_X, lerp(HAND_REST_Y, 1.5, k), 0);
          hand.group.rotation.set(0, 0, lerp(0, degToRad(72), k));
        }
        level = lerp(0.85, 0.03, k);
        shadowOpacity = lerp(0.35, 0.14, k);
      } else if (t <= 0.62) {
        // Kembali tegak dengan botol hampir kosong
        const k = easeInOutQuad(clamp01((t - 0.52) / 0.1));
        hand.group.position.set(HAND_REST_X, lerp(1.5, HAND_REST_Y, k), 0);
        hand.group.rotation.set(0, 0, lerp(degToRad(72), 0, k));
        hand.setPose("GRIP", "GRIP", 1);
        if (bottle.group.parent !== hand.palmAnchor) {
          bottle.detach(false);
          bottle.group.position.set(BOTTLE_REST_X, 0, 0);
          bottle.group.rotation.set(0, Math.PI * 1.2, 0);
          hand.group.position.set(HAND_REST_X, HAND_REST_Y, 0);
          hand.group.rotation.set(0, 0, 0);
          hand.group.updateMatrixWorld(true);
          bottle.attachToHand(hand.palmAnchor, true);
          hand.group.position.set(HAND_REST_X, lerp(1.5, HAND_REST_Y, k), 0);
          hand.group.rotation.set(0, 0, lerp(degToRad(72), 0, k));
        }
        level = 0.03;
        shadowOpacity = lerp(0.14, 0.35, k);
      } else if (t <= 0.7) {
        // Bersiap lempar (THROW cock)
        const k = smoothstep(0.62, 0.7, t);
        hand.group.position.set(HAND_REST_X, HAND_REST_Y, 0);
        hand.setPose("GRIP", "THROW", k);
        if (bottle.group.parent !== hand.palmAnchor) {
          bottle.detach(false);
          bottle.group.position.set(BOTTLE_REST_X, 0, 0);
          bottle.group.rotation.set(0, Math.PI * 1.2, 0);
          hand.group.updateMatrixWorld(true);
          bottle.attachToHand(hand.palmAnchor, true);
        }
        level = 0.03;
      } else {
        // Lempar (0.70..0.90) lalu tahan/mundur tangan ke kanan (0.90..1.00)
        const throwT = clamp01((t - 0.7) / 0.2);
        const arcK = easeHeavyIn(throwT);
        const releasePoseK = smoothstep(0.7, 0.76, t);
        const handExitK = smoothstep(0.84, 1.0, t);

        hand.group.position.set(
          lerp(HAND_REST_X, HAND_ENTRY_X, handExitK),
          lerp(HAND_REST_Y, HAND_ENTRY_Y, handExitK),
          0,
        );
        hand.setPose("THROW", "RELEASE", releasePoseK);

        bottle.detach(false);
        // Parabola: naik singkat sebelum jatuh ke (-4.2, -3.4)
        const x = lerp(THROW_START_X, THROW_END_X, throwT);
        const y = lerp(THROW_START_Y, THROW_END_Y, arcK) + Math.sin(throwT * Math.PI) * 1.35;
        bottle.group.position.set(x, y, 0);
        bottle.group.rotation.set(lerp(0, 3, throwT), Math.PI * 1.2, lerp(0, -6, throwT));

        level = 0.03;
        shadowVisible = throwT < 0.3;
        shadowOpacity = lerp(0.35, 0, clamp01(throwT / 0.3));
        camLookY = lerp(
          CAM_BASE_Y - INITIAL_TILT_OFFSET,
          CAM_BASE_Y - THROW_TILT_OFFSET,
          smoothstep(0.7, 0.92, t),
        );
      }

      const cueMix = smoothstep(0.9, 1.0, t);
      const turbid = lerp(CUES.c2.turbid, CUES.c3.turbid, cueMix);
      bottle.setParams({
        turbid,
        crack: 0,
        breakAmt: 0,
        dirt: 0,
        opacity: 1,
        level,
      });

      contactShadow.setPosition(BOTTLE_REST_X, 0.002, 0);
      contactShadow.setOpacity(shadowOpacity);
      contactShadow.setVisible(shadowVisible);

      ctx.lights.rim.intensity = lerp(CUES.c2.rim, CUES.c3.rim, cueMix);
      ctx.lights.rim.color.lerpColors(C2_ACCENT, C3_ACCENT, cueMix);
      ctx.scene.environmentIntensity = lerp(CUES.c2.env, CUES.c3.env, cueMix);

      ctx.applyResponsiveCamera(35);
      ctx.camera.position.set(0, CAM_BASE_Y, CAM_Z);
      LOOK_AT.set(0, camLookY, 0);
      ctx.camera.lookAt(LOOK_AT);
    },

    exit() {
      if (!ctx) return;
      ctx.shared.bottle.detach(false);
      if (hand) {
        hand.group.visible = false;
      }
    },

    dispose() {
      // Hand terdaftar di shared slot dan di-dispose oleh Stage; B2 tidak men-dispose shared resource.
      hand = null;
      ctx = null;
    },
  };
}
