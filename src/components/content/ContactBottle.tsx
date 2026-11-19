import type { CSSProperties } from "react";
import styles from "./ContactBottle.module.css";

export const BOTTLE_MAX_LEVEL = 3;

// Satu periode gelombang = 40 satuan; 8 periode menutup lebar botol plus geseran satu periode.
const WAVE = `M-40 60${Array.from({ length: 8 }, () => "q10 -5 20 0t20 0").join("")}V260H-40Z`;
const BODY =
  "M30 16V50C30 66 8 74 8 104V214Q8 232 26 232H54Q72 232 72 214V104C72 74 50 66 50 50V16Z";

interface ContactBottleProps {
  /** Jumlah kolom form yang valid, 0 sampai 3. Penuh (3) juga dipakai saat sukses. */
  level: number;
}

/** Tinggi air sebagai rasio 0 sampai 1 dari jumlah kolom valid (nilai di luar rentang dibatasi). */
export function bottleFill(level: number): number {
  const n = Number.isFinite(level) ? Math.round(level) : 0;
  return Math.min(BOTTLE_MAX_LEVEL, Math.max(0, n)) / BOTTLE_MAX_LEVEL;
}

/**
 * Botol kecil sebagai hiasan di kolom info. Tinggi air mengikuti `level` lewat variabel CSS `--fill`
 * dan `transform` saja. Murni dekoratif: `aria-hidden`, tidak menerima fokus maupun klik.
 */
export function ContactBottle({ level }: ContactBottleProps) {
  const fill = bottleFill(level);
  return (
    <div
      className={styles.bottle}
      aria-hidden="true"
      data-level={Math.round(fill * BOTTLE_MAX_LEVEL)}
      style={{ "--fill": fill } as CSSProperties}
    >
      <svg viewBox="0 0 80 240" className={styles.svg} focusable="false">
        <defs>
          <clipPath id="contact-bottle-body">
            <path d={BODY} />
          </clipPath>
        </defs>
        <g clipPath="url(#contact-bottle-body)">
          <g className={styles.water}>
            <g className={styles.slosh}>
              <path d={WAVE} className={styles.fill} />
            </g>
          </g>
        </g>
        <path d={BODY} className={styles.outline} />
        <rect x="27" y="2" width="26" height="14" rx="3" className={styles.cap} />
      </svg>
    </div>
  );
}
