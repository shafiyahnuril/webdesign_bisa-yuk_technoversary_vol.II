import { Link } from "react-router-dom";
import type { Article } from "@/content/articles";
import { COPY } from "@/content/copy";
import { kindLabel, levelLabel } from "./filterLabels";
import styles from "./ArticleCard.module.css";

interface ArticleCardProps {
  article: Article;
  /** 1–2 kartu teratas dimuat segera (dok 05 §4.4). */
  eager?: boolean;
  /** Indeks untuk stagger masuk (60 ms per kartu). */
  index?: number;
  /** Sedang memudar keluar (0,2 dtk) sebelum dilepas dari grid. */
  leaving?: boolean;
}

export function ArticleCard({
  article,
  eager = false,
  index = 0,
  leaving = false,
}: ArticleCardProps) {
  const src = `${import.meta.env.BASE_URL}${article.cover}`;
  const parts = [kindLabel(article.kind), levelLabel(article.level)];
  if (article.readingMinutes !== null) {
    parts.push(COPY["card.minutes"].replace("{N}", String(article.readingMinutes)));
  }
  return (
    <article
      className={`${styles.card} ${leaving ? styles.leaving : ""}`}
      data-kind={article.kind}
      data-cursor="read"
      style={{ ["--i" as string]: index }}
    >
      <Link
        to={`/konten/${article.slug}`}
        className={styles.link}
        tabIndex={leaving ? -1 : undefined}
      >
        <div className={styles.media}>
          {/* Dua salinan untuk RGB-split saat hover (dekoratif). */}
          <span
            className={`${styles.split} ${styles.splitA}`}
            style={{ backgroundImage: `url(${src})` }}
            aria-hidden="true"
          />
          <span
            className={`${styles.split} ${styles.splitB}`}
            style={{ backgroundImage: `url(${src})` }}
            aria-hidden="true"
          />
          <img
            className={styles.img}
            src={src}
            width={1200}
            height={900}
            alt={COPY["card.cover.alt"].replace("{T}", article.title)}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
          />
        </div>
        <div className={styles.body}>
          <h2 className={`t-card ${styles.title}`}>{article.title}</h2>
          <p className={`t-ui ${styles.sub}`}>{parts.join(" · ")}</p>
          <svg
            className={styles.arrow}
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M8 8l12 12M20 10v10H10" />
          </svg>
        </div>
      </Link>
    </article>
  );
}
