import { useMemo, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { ArticleBody } from "@/components/content/ArticleBody";
import { kindLabel, levelLabel } from "@/components/content/filterLabels";
import { sortDefault } from "@/components/content/filter";
import { galleryHref } from "@/components/content/galleryReturn";
import { NextArticle } from "@/components/content/NextArticle";
import { nextInOrder } from "@/components/content/nextInOrder";
import { SourceItem } from "@/components/content/SourceItem";
import { usePageFocus } from "@/components/ui/usePageFocus";
import { usePageTheme } from "@/components/ui/usePageTheme";
import { ARTICLES, type Article } from "@/content/articles";
import { COPY } from "@/content/copy";
import { SITE } from "@/content/site";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import NotFoundPage from "./NotFoundPage";
import styles from "./ArticlePage.module.css";

export default function ArticlePage() {
  const { slug } = useParams();
  const article = ARTICLES.find((a) => a.slug === slug);
  if (!article) return <NotFoundPage />;
  return <ArticleView article={article} />;
}

/** Meta description dari lede, maksimal 155 karakter (dok 05 §5.2). */
export function metaDescription(lede: string): string | undefined {
  const text = lede.trim();
  if (!text) return undefined;
  return text.length <= 155 ? text : `${text.slice(0, 154).trimEnd()}…`;
}

function ArticleView({ article }: { article: Article }) {
  usePageTheme("artikel");
  const headingRef = useRef<HTMLHeadingElement>(null);
  usePageFocus(headingRef);
  useDocumentMeta(
    `${article.title} | ${SITE.name}`,
    metaDescription(article.lede) ?? COPY["site.description"],
  );

  const next = useMemo(() => nextInOrder(sortDefault(ARTICLES), article.slug), [article.slug]);
  const cover = `${import.meta.env.BASE_URL}${article.cover}`;
  const meta = [kindLabel(article.kind), levelLabel(article.level)];
  if (article.readingMinutes !== null) {
    meta.push(COPY["card.minutes"].replace("{N}", String(article.readingMinutes)));
  }

  return (
    <article className={styles.page} data-kind={article.kind}>
      <header className={styles.head}>
        <Link to={galleryHref()} className={`t-ui ${styles.back}`}>
          {COPY["article.back"]}
        </Link>
        <div className={styles.band} data-kind={article.kind}>
          <p className={`t-ui ${styles.meta}`}>{meta.join(" · ")}</p>
          <h1 ref={headingRef} tabIndex={-1} className={`t-h2 ${styles.title}`}>
            {article.title}
          </h1>
        </div>
        <img
          className={styles.cover}
          src={cover}
          width={1600}
          height={900}
          alt={COPY["article.cover.alt"].replace("{T}", article.title)}
          decoding="async"
        />
      </header>

      <ArticleBody lede={article.lede} sections={article.sections} relation={article.relation} />

      <section className={styles.sources} aria-labelledby="article-sources">
        <h2 id="article-sources" className={`t-ui ${styles.sectionTitle}`}>
          {COPY["article.sources.title"]}
        </h2>
        {article.sources.length > 0 ? (
          <ol className={styles.sourceList}>
            {article.sources.map((source) => (
              <SourceItem key={source.url || source.title} source={source} />
            ))}
          </ol>
        ) : (
          <p className="t-body">{COPY["article.sources.empty"]}</p>
        )}
      </section>

      {next ? <NextArticle article={next} /> : null}
    </article>
  );
}
