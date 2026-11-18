import type { ArticleSource } from "@/content/articles";

/** Satu butir sumber: `Penerbit. “Judul.” Tahun. ↗` (dok 05 §5.2). Judul menjadi tautan bila URL valid. */
export function SourceItem({ source }: { source: ArticleSource }) {
  const isUrl = /^https?:\/\//.test(source.url);
  const title = `“${source.title}.”`;
  return (
    <li className="t-body">
      {source.publisher}.{" "}
      {isUrl ? (
        <a href={source.url} target="_blank" rel="noopener noreferrer">
          {title} ↗
        </a>
      ) : (
        title
      )}
      {source.year !== null ? ` ${source.year}.` : ""}
    </li>
  );
}
