import { useEffect, type RefObject } from "react";
import { useReducedMotion } from "./useReducedMotion";

/**
 * Menulis progres gulir halaman (0 sampai 1) ke variabel CSS pada elemen, tanpa state React.
 * Satu listener pasif dan satu requestAnimationFrame yang dibatasi; dibersihkan saat unmount.
 * Reduced-motion: nilai tetap `rest` (tampilan akhir).
 * Catatan: ini bukan mesin cerita Home, jadi tidak memakai `shown`.
 */
export function useScrollVar(
  ref: RefObject<HTMLElement | null>,
  name = "--scroll",
  rest = 0.8,
): void {
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced) {
      el.style.setProperty(name, String(rest));
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      el.style.setProperty(name, p.toFixed(4));
    };
    const request = () => {
      if (raf === 0) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request, { passive: true });
    return () => {
      if (raf !== 0) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
    };
  }, [ref, reduced, name, rest]);
}
