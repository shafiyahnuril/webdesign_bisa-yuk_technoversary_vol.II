import styles from "./CapAvatar.module.css";

const RIDGES = 16;

/**
 * Tutup botol (tampak atas) sebagai avatar anggota tim.
 * TODO(A): SVG inline sederhana bertoken warna; ganti dengan aset resmi bila Pihak A membuatnya.
 */
export function CapAvatar({ tilt = 0 }: { tilt?: number }) {
  return (
    <svg
      className={styles.cap}
      viewBox="-30 -30 60 60"
      width="64"
      height="64"
      aria-hidden="true"
      focusable="false"
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      <circle r="28" className={styles.rim} />
      {Array.from({ length: RIDGES }, (_, i) => (
        <line
          key={i}
          x1="0"
          y1="-28"
          x2="0"
          y2="-24.5"
          className={styles.ridge}
          transform={`rotate(${(360 / RIDGES) * i})`}
        />
      ))}
      <circle r="20" className={styles.top} />
      <circle r="10" className={styles.dent} />
    </svg>
  );
}
