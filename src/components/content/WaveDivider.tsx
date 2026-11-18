import styles from "./WaveDivider.module.css";

// Satu periode 100 satuan; 24 periode = 2400. Separuh kiri dan kanan identik agar
// pergeseran -50% terlihat tanpa sambungan.
const PERIODS = 24;
const PATH = `M0 12${Array.from({ length: PERIODS / 2 }, () => "q25 -10 50 0t50 0").join("")}${Array.from({ length: PERIODS / 2 }, () => "q25 -10 50 0t50 0").join("")}`;

/** Gelombang air tipis sebagai pemisah bagian. Bergeser pelan dengan `transform` (dimatikan saat reduced-motion). */
export function WaveDivider() {
  return (
    <div className={styles.wave} aria-hidden="true">
      <svg className={styles.svg} viewBox="0 0 2400 24" preserveAspectRatio="none">
        <path d={PATH} className={styles.line} />
      </svg>
    </div>
  );
}
