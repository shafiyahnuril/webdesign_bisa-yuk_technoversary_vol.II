import { useEffect, useState } from "react";
import styles from "./SideIndex.module.css";

export interface SideIndexItem {
  id: string;
  label: string;
}

/**
 * Indeks samping hanya-baca (desktop): daftar polos, bukan tombol. Bagian aktif ditentukan
 * IntersectionObserver pada pita tipis di tengah layar. Disembunyikan dari pembaca layar
 * karena isinya sama dengan judul bagian.
 */
export function SideIndex({ items }: { items: readonly SideIndexItem[] }) {
  const [active, setActive] = useState("");

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setActive(e.target.id);
          } else if (e.boundingClientRect.top > 0) {
            // Bagian keluar ke bawah pita (gulir naik): pindah ke bagian sebelumnya, atau kosong di hero.
            const i = items.findIndex((item) => item.id === e.target.id);
            setActive((cur) => (cur === e.target.id ? (items[i - 1]?.id ?? "") : cur));
          }
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    for (const item of items) {
      const node = document.getElementById(item.id);
      if (node) io.observe(node);
    }
    return () => io.disconnect();
  }, [items]);

  return (
    <aside className={styles.index} aria-hidden="true">
      <ol className={styles.list}>
        {items.map((item) => (
          <li key={item.id} className={styles.item} data-active={item.id === active}>
            <span className={styles.mark} />
            <span className="t-ui-sm">{item.label}</span>
          </li>
        ))}
      </ol>
    </aside>
  );
}
