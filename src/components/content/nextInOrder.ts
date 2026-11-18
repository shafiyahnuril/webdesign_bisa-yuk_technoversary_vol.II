import type { Article } from "@/content/articles";

/** Artikel berikutnya dalam urutan default, berputar: indeks terakhir kembali ke pertama (dok 05 §5.2). */
export function nextInOrder(ordered: readonly Article[], slug: string): Article | null {
  const index = ordered.findIndex((a) => a.slug === slug);
  if (index === -1 || ordered.length === 0) return null;
  return ordered[(index + 1) % ordered.length] ?? null;
}
