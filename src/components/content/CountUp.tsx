import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { formatNumber } from "./factUtils";

interface CountUpProps {
  to: number;
  decimals?: number;
  suffix?: string;
  /** Mulai menghitung saat true. */
  active: boolean;
  /** Durasi dalam milidetik. */
  duration?: number;
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 4);

/**
 * Angka yang naik dari 0 ke nilai akhir. Teks diubah langsung pada node (tanpa re-render React).
 * Nilai akhir sudah ada sejak render pertama; reduced-motion tidak menganimasikan apa pun.
 */
export function CountUp({ to, decimals = 0, suffix = "", active, duration = 1100 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const final = `${formatNumber(to, decimals)}${suffix}`;

  useEffect(() => {
    const node = ref.current;
    if (!node || !active || reduced) return;
    let raf = 0;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      node.textContent = `${formatNumber(to * easeOut(t), decimals)}${suffix}`;
      if (t < 1) raf = requestAnimationFrame(step);
    };
    node.textContent = `${formatNumber(0, decimals)}${suffix}`;
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      node.textContent = final;
    };
  }, [active, reduced, to, decimals, suffix, duration, final]);

  return <span ref={ref}>{final}</span>;
}
