import { useEffect, type RefObject } from "react";
import { useLocation } from "react-router-dom";

/**
 * Memindahkan fokus ke <h1> dan menggulir ke atas setelah pindah rute.
 * Dilewati pada pemuatan pertama (key "default") agar tautan lompat tetap berfungsi.
 */
export function usePageFocus(ref: RefObject<HTMLElement | null>): void {
  const { key } = useLocation();
  useEffect(() => {
    if (key === "default") return;
    window.scrollTo(0, 0);
    ref.current?.focus({ preventScroll: true });
  }, [key, ref]);
}
