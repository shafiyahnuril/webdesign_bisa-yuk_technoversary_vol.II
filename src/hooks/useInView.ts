import { useEffect, useRef, useState, type RefObject } from "react";
import { useReducedMotion } from "./useReducedMotion";

/**
 * Menjadi true sekali saat elemen masuk layar (IntersectionObserver, tanpa re-render per frame).
 * Reduced-motion atau tanpa IntersectionObserver: langsung true (tampilan akhir).
 */
export function useInView<T extends Element>(threshold = 0.2): [RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const reduced = useReducedMotion();
  const [seen, setSeen] = useState(() => typeof IntersectionObserver === "undefined");

  useEffect(() => {
    const node = ref.current;
    if (seen || reduced || !node) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [seen, reduced, threshold]);

  return [ref, seen || reduced];
}
