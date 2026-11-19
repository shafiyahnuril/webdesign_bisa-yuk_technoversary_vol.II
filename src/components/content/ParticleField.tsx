import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import styles from "./ParticleField.module.css";

// Spesifikasi dok 05 §4.5 [USULAN]: tanpa warna hangat.
const COLORS = ["rgba(15,139,141,.18)", "rgba(17,38,27,.10)"] as const;
const COUNT_DESKTOP = 40;
const COUNT_MOBILE = 16;
const SPEED_MIN = 6;
const SPEED_MAX = 14;
const SIZE_MIN = 3;
const SIZE_MAX = 7;
const REPEL_RADIUS = 120;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  hex: boolean;
  rot: number;
  /** Indeks warna pada palet. */
  ci: number;
  // Dorongan dari kursor (piksel), meluruh pelan.
  ox: number;
  oy: number;
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);

/** Menyelesaikan warna CSS (termasuk var() dan color-mix()) menjadi nilai yang dimengerti kanvas. */
function resolveColor(css: string): string {
  const probe = document.createElement("span");
  probe.style.color = css;
  document.body.appendChild(probe);
  const value = getComputedStyle(probe).color;
  probe.remove();
  return value || css;
}

interface ParticleFieldProps {
  /** Dua warna partikel (boleh var()/color-mix()); nilai bawaan = tampilan halaman Konten. */
  colors?: readonly [string, string];
  /** Jumlah partikel di desktop; HP memakai separuhnya (bawaan 40 dan 16). */
  count?: number;
}

/** Latar partikel 2D (kapsul/segi enam). Berhenti saat tab tersembunyi atau kanvas tak terlihat. */
export function ParticleField({ colors = COLORS, count: countProp }: ParticleFieldProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // Warna diselesaikan saat gambar pertama (bukan saat efek berjalan): var() tema halaman
    // baru terpasang setelah efek anak selesai.
    let palette: string[] | null = null;
    const paletteNow = () => (palette ??= colors.map(resolveColor));
    const mobile = window.matchMedia("(max-width: 720px)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches && !mobile;
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const count =
      countProp === undefined
        ? mobile
          ? COUNT_MOBILE
          : COUNT_DESKTOP
        : mobile
          ? Math.ceil(countProp / 2)
          : countProp;
    const particles: Particle[] = Array.from({ length: count }, () => {
      const speed = rand(SPEED_MIN, SPEED_MAX);
      const angle = rand(0, Math.PI * 2);
      return {
        x: rand(0, w),
        y: rand(0, h),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: rand(SIZE_MIN, SIZE_MAX),
        hex: Math.random() < 0.5,
        rot: rand(0, Math.PI),
        ci: Math.random() < 0.6 ? 0 : 1,
        ox: 0,
        oy: 0,
      };
    });

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        ctx.save();
        ctx.translate(p.x + p.ox, p.y + p.oy);
        ctx.rotate(p.rot);
        ctx.fillStyle = paletteNow()[p.ci] ?? "transparent";
        ctx.beginPath();
        if (p.hex) {
          for (let i = 0; i < 6; i++) {
            const a = (Math.PI / 3) * i;
            const px = Math.cos(a) * p.size * 0.6;
            const py = Math.sin(a) * p.size * 0.6;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
        } else {
          // Kapsul: persegi panjang membulat.
          const lw = p.size * 1.6;
          const lh = p.size * 0.7;
          ctx.roundRect(-lw / 2, -lh / 2, lw, lh, lh / 2);
        }
        ctx.fill();
        ctx.restore();
      }
    };

    if (reduced) {
      // Gambar statis satu kali (setelah frame pertama agar variabel tema sudah terpasang).
      const once = requestAnimationFrame(draw);
      const onResize = () => {
        resize();
        draw();
      };
      window.addEventListener("resize", onResize);
      return () => {
        cancelAnimationFrame(once);
        window.removeEventListener("resize", onResize);
      };
    }

    const pointer = { x: -9999, y: -9999 };
    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    };
    if (finePointer) window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", resize);

    let raf = 0;
    let last = 0;
    let inView = true;
    let tabVisible = !document.hidden;

    const frame = (t: number) => {
      raf = 0;
      const dt = Math.min((t - last) / 1000, 0.05);
      last = t;
      for (const p of particles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.x < -10) p.x = w + 10;
        else if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        else if (p.y > h + 10) p.y = -10;
        if (finePointer) {
          const dx = p.x + p.ox - pointer.x;
          const dy = p.y + p.oy - pointer.y;
          const d = Math.hypot(dx, dy);
          if (d < REPEL_RADIUS && d > 0.01) {
            const push = (1 - d / REPEL_RADIUS) * 60 * dt;
            p.ox += (dx / d) * push;
            p.oy += (dy / d) * push;
          }
          const decay = Math.exp(-dt * 1.2);
          p.ox *= decay;
          p.oy *= decay;
        }
      }
      draw();
      schedule();
    };

    const schedule = () => {
      if (raf === 0 && inView && tabVisible) raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      if (raf !== 0) cancelAnimationFrame(raf);
      raf = 0;
    };
    const resume = () => {
      last = performance.now();
      schedule();
    };

    const onVisibility = () => {
      tabVisible = !document.hidden;
      if (tabVisible) resume();
      else stop();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const io =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver((entries) => {
            inView = entries.some((e) => e.isIntersecting);
            if (inView) resume();
            else stop();
          });
    io?.observe(canvas);

    resume();

    return () => {
      stop();
      io?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", resize);
    };
  }, [reduced, colors, countProp]);

  return <canvas ref={ref} className={styles.canvas} aria-hidden="true" />;
}
