import { useEffect, useState } from "react";
import type { Article } from "@/content/articles";
import { COPY } from "@/content/copy";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ArticleCard } from "./ArticleCard";
import styles from "./ArticleGrid.module.css";

interface ArticleGridProps {
  /** Artikel yang cocok dengan filter, sudah berurutan. */
  articles: readonly Article[];
  /** Semua artikel berurutan default; dipakai untuk menjaga posisi kartu yang sedang memudar. */
  allOrdered: readonly Article[];
  /** Pengumuman pembaca layar (region aria-live). */
  announcement: string;
  onReset: () => void;
}

const LEAVE_MS = 200;

/** Grid 2 kolom (HP 1 kolom). Kartu tak cocok memudar 0,2 dtk lalu dilepas; sisanya stagger masuk. */
export function ArticleGrid({ articles, allOrdered, announcement, onReset }: ArticleGridProps) {
  const reduced = useReducedMotion();
  const [prevArticles, setPrevArticles] = useState(articles);
  const [rendered, setRendered] = useState<readonly Article[]>(articles);
  const [leavingCodes, setLeavingCodes] = useState<ReadonlySet<string>>(new Set());

  // Menyesuaikan state saat hasil filter berubah (pola "state dari props", tanpa setState di efek).
  if (prevArticles !== articles) {
    setPrevArticles(articles);
    const nextCodes = new Set(articles.map((a) => a.code));
    const stale = rendered.filter((a) => !nextCodes.has(a.code));
    if (reduced || stale.length === 0) {
      setRendered(articles);
      setLeavingCodes(new Set());
    } else {
      // Kartu lama tetap di tempatnya selama memudar, lalu dilepas.
      const keep = new Set([...rendered.map((a) => a.code), ...nextCodes]);
      setRendered(allOrdered.filter((a) => keep.has(a.code)));
      setLeavingCodes(new Set(stale.map((a) => a.code)));
    }
  }

  const hasLeaving = leavingCodes.size > 0;
  useEffect(() => {
    if (!hasLeaving) return;
    const id = window.setTimeout(() => {
      setRendered(articles);
      setLeavingCodes(new Set());
    }, LEAVE_MS);
    return () => window.clearTimeout(id);
  }, [hasLeaving, articles]);

  let enterIndex = 0;
  return (
    <>
      <p className={styles.live} role="status" aria-live="polite">
        {announcement}
      </p>
      {articles.length === 0 ? (
        <div className={styles.empty}>
          <p className="t-body-lg">{COPY["filter.empty"]}</p>
          <button type="button" className={`t-ui ${styles.reset}`} onClick={onReset}>
            {COPY["filter.reset"]}
          </button>
        </div>
      ) : (
        <ul className={styles.grid}>
          {rendered.map((a, i) => {
            const leaving = leavingCodes.has(a.code);
            const index = leaving ? 0 : enterIndex++;
            return (
              <li key={a.code} className={styles.item}>
                <ArticleCard article={a} eager={i < 2} index={index} leaving={leaving} />
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
