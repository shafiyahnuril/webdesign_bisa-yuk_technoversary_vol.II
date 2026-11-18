import type { Article, ArticleKind, ArticleLevel } from "@/content/articles";

export type KindFilter = "all" | ArticleKind;
export type LevelFilter = "all" | ArticleLevel;

export const KIND_OPTIONS: readonly KindFilter[] = ["all", "negatif", "positif"];
export const LEVEL_OPTIONS: readonly LevelFilter[] = ["all", "sehari-hari", "nasional", "global"];

/** Urutan default dok 05 §4.2: selang-seling negatif/positif, dekat ke jauh. */
export const DEFAULT_ORDER: readonly string[] = [
  "A1",
  "B1",
  "A2",
  "B2",
  "A3",
  "B3",
  "A4",
  "B4",
  "A5",
  "B5",
  "A6",
  "B6",
];

export function sortDefault(articles: readonly Article[]): Article[] {
  const rank = (a: Article) => {
    const i = DEFAULT_ORDER.indexOf(a.code);
    return i === -1 ? DEFAULT_ORDER.length : i;
  };
  return [...articles].sort((a, b) => rank(a) - rank(b));
}

export function filterArticles(
  articles: readonly Article[],
  kind: KindFilter,
  level: LevelFilter,
): Article[] {
  return articles.filter(
    (a) => (kind === "all" || a.kind === kind) && (level === "all" || a.level === level),
  );
}

/** Hitungan chip: tiap kelompok dihitung dengan pilihan kelompok lain tetap (dok 05 §4.3). */
export function counts(
  articles: readonly Article[],
  kind: KindFilter,
  level: LevelFilter,
): { kind: Record<KindFilter, number>; level: Record<LevelFilter, number> } {
  const kindCounts = {} as Record<KindFilter, number>;
  for (const k of KIND_OPTIONS) kindCounts[k] = filterArticles(articles, k, level).length;
  const levelCounts = {} as Record<LevelFilter, number>;
  for (const l of LEVEL_OPTIONS) levelCounts[l] = filterArticles(articles, kind, l).length;
  return { kind: kindCounts, level: levelCounts };
}

/** Nilai tidak valid diabaikan (kembali ke "all"). */
export function parseKind(v: string | null): KindFilter {
  return KIND_OPTIONS.includes(v as KindFilter) ? (v as KindFilter) : "all";
}
export function parseLevel(v: string | null): LevelFilter {
  return LEVEL_OPTIONS.includes(v as LevelFilter) ? (v as LevelFilter) : "all";
}
