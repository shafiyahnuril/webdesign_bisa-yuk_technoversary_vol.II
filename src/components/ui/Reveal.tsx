import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import styles from "./Reveal.module.css";

interface RevealProps {
  children: ReactNode;
  /** Elemen pembungkus; default `div`. */
  as?: ElementType;
  className?: string;
}

/** Muncul sekali saat masuk viewport (opacity + translateY 24px, 0,7 dtk). Reduced-motion: tanpa animasi. */
export function Reveal({ children, as: Tag = "div", className }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(() => typeof IntersectionObserver === "undefined");

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    // Tanpa IntersectionObserver, keadaan awal sudah "tampil" agar konten tidak tersembunyi.
    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  const cls = [styles.reveal, shown ? styles.shown : "", className ?? ""].filter(Boolean).join(" ");
  return (
    <Tag ref={ref} className={cls}>
      {children}
    </Tag>
  );
}
