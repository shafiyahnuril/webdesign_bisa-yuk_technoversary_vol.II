import type { Article } from "@/content/articles";
import { COPY } from "@/content/copy";
import { ArticleCard } from "./ArticleCard";
import styles from "./NextArticle.module.css";

/** Blok "Artikel berikutnya": satu ArticleCard kecil di bawah daftar sumber. */
export function NextArticle({ article }: { article: Article }) {
  return (
    <section className={styles.next} aria-labelledby="article-next">
      <h2 id="article-next" className={`t-ui ${styles.title}`}>
        {COPY["article.next"]}
      </h2>
      <div className={styles.card}>
        <ArticleCard article={article} />
      </div>
    </section>
  );
}
