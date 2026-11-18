import styles from "./AboutBottle.module.css";

// Satu periode gelombang = 40 satuan; 8 periode menutup lebar botol plus geseran satu periode.
const WAVE = `M-40 60${Array.from({ length: 8 }, () => "q10 -5 20 0t20 0").join("")}V260H-40Z`;

/**
 * Botol 2D sebagai jangkar visual. Tinggi air mengikuti variabel CSS `--scroll` (0 sampai 1) milik
 * halaman, lewat `transform` saja.
 * TODO(A): SVG inline sederhana bertoken warna; ganti dengan aset botol resmi bila Pihak A menyediakan.
 */
export function AboutBottle() {
  return (
    <div className={styles.bottle} aria-hidden="true">
      <svg viewBox="0 0 80 240" className={styles.svg} focusable="false">
        <defs>
          <clipPath id="about-bottle-body">
            <path d="M30 16V50C30 66 8 74 8 104V214Q8 232 26 232H54Q72 232 72 214V104C72 74 50 66 50 50V16Z" />
          </clipPath>
        </defs>
        <g clipPath="url(#about-bottle-body)">
          <g className={styles.water}>
            <g className={styles.slosh}>
              <path d={WAVE} className={styles.fill} />
            </g>
          </g>
        </g>
        <path
          d="M30 16V50C30 66 8 74 8 104V214Q8 232 26 232H54Q72 232 72 214V104C72 74 50 66 50 50V16Z"
          className={styles.outline}
        />
        <rect x="27" y="2" width="26" height="14" rx="3" className={styles.cap} />
      </svg>
    </div>
  );
}
