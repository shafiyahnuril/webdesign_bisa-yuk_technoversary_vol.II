import type { ArticleSection } from "@/content/articles";
import { COPY } from "@/content/copy";
import styles from "./ArticleBody.module.css";

interface ArticleBodyProps {
  lede: string;
  sections: readonly ArticleSection[];
  relation: string;
}

/** Lede, isi (H2 + paragraf), dan kotak "Kaitannya dengan Re:bottle". Seluruh teks dari data. */
export function ArticleBody({ lede, sections, relation }: ArticleBodyProps) {
  if (sections.length === 0) {
    return <p className={`t-body ${styles.empty}`}>{COPY["article.empty"]}</p>;
  }
  return (
    <div className={styles.body}>
      {lede ? <p className={`t-body-lg ${styles.lede}`}>{lede}</p> : null}
      {sections.map((section) => (
        <section key={section.heading} className={styles.section}>
          <h2 className={`t-h2 ${styles.h2}`}>{section.heading}</h2>
          {section.paragraphs.map((text) => (
            <p key={text} className="t-body">
              {text}
            </p>
          ))}
        </section>
      ))}
      {relation ? (
        <aside className={styles.relation} aria-labelledby="article-relation">
          <h2 id="article-relation" className={`t-ui ${styles.relationTitle}`}>
            ▸ {COPY["article.relation.title"]}
          </h2>
          <p className="t-body">{relation}</p>
        </aside>
      ) : null}
    </div>
  );
}
