import { COPY } from "@/content/copy";
import styles from "./HomePage.module.css";

// Placeholder Fase 0: belum ada adegan 3D, mesin cerita, atau komponen Home.
// Tidak boleh mengimpor `three` di sini; panggung dimuat dinamis nanti (T3.x).
export default function HomePage() {
  return (
    <section className={styles.home}>
      <h1 className="t-hero">{COPY["hero.title"]}</h1>
      <p className={styles.hint}>{COPY["hero.hint"]}</p>
    </section>
  );
}
