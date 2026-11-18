import type { CSSProperties, ElementType, ReactNode } from "react";
import { useInView } from "@/hooks/useInView";
import styles from "./Appear.module.css";

interface AppearProps {
  children: ReactNode;
  as?: ElementType;
  /** Urutan dalam kelompok; jeda masuk = index x --stagger-card. */
  index?: number;
  className?: string;
}

/** Masuk sekali saat terlihat: opacity + translate (properti `translate`, agar hover memakai `transform`). */
export function Appear({ children, as: Tag = "div", index = 0, className }: AppearProps) {
  const [ref, inView] = useInView<HTMLElement>(0.15);
  const cls = [styles.appear, inView ? styles.in : "", className ?? ""].filter(Boolean).join(" ");
  return (
    <Tag ref={ref} className={cls} style={{ "--i": index } as CSSProperties}>
      {children}
    </Tag>
  );
}
