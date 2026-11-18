import { useEffect, useRef } from "react";
import { onTick } from "@/engine/ticker";
import { useMedia } from "@/hooks/useMedia";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import styles from "./CursorRing.module.css";

export interface CursorRingProps {
  /** Apakah kursor cincin aktif pada rute saat ini (mis. Home dan Galeri Artikel). Default: true. */
  enabled?: boolean;
  /** Label pada kartu artikel. Default: "Baca". */
  cardLabel?: string;
  /** Selector tambahan untuk mendeteksi kartu artikel tanpa perlu memodifikasi ContentPage B. */
  cardSelector?: string;
}

const DEFAULT_CARD_SELECTOR = [
  '[data-cursor="card"]',
  "[data-article]",
  'a[href*="/konten/"]',
].join(", ");

const HOVER_SELECTOR = "a, button, [role='button'], [data-hover]";
const INPUT_SELECTOR = "input, textarea, select, [contenteditable='true']";

const R = 21;
const MAX_STRETCH = 0.4;
const SPEED_DIVISOR = 24;

function easeDt(k: number, f: number): number {
  return 1 - Math.pow(1 - k, f);
}

/**
 * Kursor cincin SVG (`R=21`, stroke 1.5px, `mix-blend-mode: difference`) untuk perangkat `pointer: fine`.
 * - Meregang searah gerakan dengan normalisasi `dt` (dimatikan saat `prefers-reduced-motion`).
 * - Membesar 1.7x di atas tautan/tombol, dan menampilkan label "Baca" di atas kartu artikel.
 * - Menghilang di atas elemen input (`input, textarea, select`).
 */
export function CursorRing({
  enabled = true,
  cardLabel = "Baca",
  cardSelector = DEFAULT_CARD_SELECTOR,
}: CursorRingProps) {
  const isFinePointer = useMedia("(pointer: fine)");
  const reducedMotion = useReducedMotion();

  const rootRef = useRef<HTMLDivElement | null>(null);
  const ellipseRef = useRef<SVGEllipseElement | null>(null);
  const labelRef = useRef<HTMLSpanElement | null>(null);

  const active = enabled && isFinePointer;

  useEffect(() => {
    const el = rootRef.current;
    const ring = ellipseRef.current;
    const labelEl = labelRef.current;
    if (!active || !el || !ring) {
      document.documentElement.classList.remove("has-ring");
      return;
    }

    document.documentElement.classList.add("has-ring");

    let mx = typeof window !== "undefined" ? window.innerWidth / 2 : 0;
    let my = typeof window !== "undefined" ? window.innerHeight / 2 : 0;
    let x = mx;
    let y = my;
    let stretch = 0;
    let angle = 0;
    let growTarget = 1;
    let growShown = 1;
    let isInput = false;
    let isCard = false;
    let visible = false;

    const syncVisibility = () => {
      el.classList.toggle(styles.hidden ?? "is-hidden", isInput);
      el.style.opacity = visible && !isInput ? "1" : "0";
      if (labelEl) {
        labelEl.style.opacity = isCard && !isInput ? "1" : "0";
      }
    };

    const inspectTarget = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return;
      isInput = Boolean(target.closest(INPUT_SELECTOR));
      isCard = !isInput && Boolean(target.closest(cardSelector));
      const isHover = !isInput && (isCard || Boolean(target.closest(HOVER_SELECTOR)));
      growTarget = isHover ? 1.7 : 1;
      syncVisibility();
    };

    const onPointerMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (!visible) {
        x = mx;
        y = my;
        visible = true;
      }
      inspectTarget(e.target);
    };

    const onPointerOver = (e: PointerEvent) => {
      inspectTarget(e.target);
    };

    const onMouseLeave = () => {
      visible = false;
      syncVisibility();
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerover", onPointerOver, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);

    const stopTick = onTick((dtSeconds) => {
      if (!Number.isFinite(dtSeconds) || dtSeconds <= 0) return;
      // Normalisasi ke 60fps (1 frame = 1/60s)
      const f = Math.min(4, dtSeconds * 60);

      const px = x;
      const py = y;
      x += (mx - x) * easeDt(0.2, f);
      y += (my - y) * easeDt(0.2, f);

      const vx = x - px;
      const vy = y - py;
      const speed = f > 1e-4 ? Math.hypot(vx, vy) / f : 0;

      if (speed > 0.5 && !reducedMotion) {
        let d = Math.atan2(vy, vx) - angle;
        d = ((((d + Math.PI / 2) % Math.PI) + Math.PI) % Math.PI) - Math.PI / 2;
        angle += d * easeDt(0.3, f);
      }

      const targetStretch =
        reducedMotion || isCard ? 0 : MAX_STRETCH * Math.min(speed / SPEED_DIVISOR, 1);
      const stretchRate = targetStretch > stretch ? 0.28 : 0.09;
      stretch += (targetStretch - stretch) * easeDt(stretchRate, f);
      growShown += (growTarget - growShown) * easeDt(0.18, f);

      const rx = R * growShown * (1 + stretch);
      const ry = (R * growShown) / (1 + stretch);
      ring.setAttribute("rx", rx.toFixed(2));
      ring.setAttribute("ry", ry.toFixed(2));
      ring.setAttribute("transform", `rotate(${((angle * 180) / Math.PI).toFixed(2)})`);

      el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
    });

    return () => {
      stopTick();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerover", onPointerOver);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.documentElement.classList.remove("has-ring");
    };
  }, [active, reducedMotion, cardSelector]);

  if (!active) return null;

  return (
    <div ref={rootRef} className={styles.cursor} aria-hidden="true" data-cursor-ring>
      <svg className={styles.svg} width="120" height="120" viewBox="-60 -60 120 120">
        <ellipse ref={ellipseRef} cx="0" cy="0" rx={R} ry={R} className={styles.ellipse} />
      </svg>
      <span ref={labelRef} className={styles.label} data-cursor-label>
        {cardLabel}
      </span>
    </div>
  );
}
