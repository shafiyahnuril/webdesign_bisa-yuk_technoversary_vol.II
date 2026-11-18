import type { Article } from "@/content/articles";
import { COPY } from "@/content/copy";
import type { Fact } from "@/content/facts";
import { isShowable } from "./factUtils";

export interface SourceItem {
  title: string;
  url: string;
  publisher: string;
  year: number | null;
}

export interface SourceGroup {
  title: string;
  items: SourceItem[];
}

const isUrl = (u: string) => /^https?:\/\//.test(u);

/**
 * Mengelompokkan sumber untuk halaman About: satu kelompok untuk fakta terverifikasi,
 * lalu satu kelompok per artikel yang sudah punya sumber. Yang belum memenuhi syarat dibuang.
 */
export function buildSourceGroups(
  facts: Record<string, Fact>,
  articles: readonly Article[],
): SourceGroup[] {
  const groups: SourceGroup[] = [];

  const factItems: SourceItem[] = [];
  const seen = new Set<string>();
  for (const fact of Object.values(facts)) {
    if (!isShowable(fact) || !isUrl(fact.sourceUrl) || seen.has(fact.sourceUrl)) continue;
    seen.add(fact.sourceUrl);
    factItems.push({
      title: fact.sourceTitle,
      url: fact.sourceUrl,
      publisher: fact.publisher,
      year: fact.year,
    });
  }
  if (factItems.length > 0) groups.push({ title: COPY["about.sources.facts"], items: factItems });

  for (const article of articles) {
    const items = article.sources.filter((s) => isUrl(s.url));
    if (items.length > 0) groups.push({ title: article.title, items: [...items] });
  }
  return groups;
}
