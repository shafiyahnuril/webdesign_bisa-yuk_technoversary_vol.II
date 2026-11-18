import { useEffect, useMemo } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { ArticleGrid } from "@/components/content/ArticleGrid";
import { FilterPill } from "@/components/content/FilterPill";
import { ParticleField } from "@/components/content/ParticleField";
import {
  type KindFilter,
  type LevelFilter,
  counts,
  filterArticles,
  parseKind,
  parseLevel,
  sortDefault,
} from "@/components/content/filter";
import { kindLabel, levelLabel } from "@/components/content/filterLabels";
import { rememberGallerySearch } from "@/components/content/galleryReturn";
import { PageHero } from "@/components/ui/PageHero";
import { usePageTheme } from "@/components/ui/usePageTheme";
import { ARTICLES } from "@/content/articles";
import { COPY } from "@/content/copy";
import styles from "./ContentPage.module.css";

// TODO(A): aktifkan CursorRing di #/konten (label "Baca" saat hover kartu; kartu sudah memakai
// data-cursor="read"). Komponen milik Pihak A belum ada di main; lihat docs/CATATAN_UNTUK_A.md.

export default function ContentPage() {
  usePageTheme("konten");
  const [params, setParams] = useSearchParams();
  const { search } = useLocation();
  useEffect(() => rememberGallerySearch(search), [search]);
  const kind = parseKind(params.get("jenis"));
  const level = parseLevel(params.get("level"));

  const ordered = useMemo(() => sortDefault(ARTICLES), []);
  const visible = useMemo(() => filterArticles(ordered, kind, level), [ordered, kind, level]);
  const chipCounts = useMemo(() => counts(ordered, kind, level), [ordered, kind, level]);

  const update = (nextKind: KindFilter, nextLevel: LevelFilter) => {
    const next = new URLSearchParams();
    if (nextKind !== "all") next.set("jenis", nextKind);
    if (nextLevel !== "all") next.set("level", nextLevel);
    setParams(next, { replace: true });
  };

  const labels = [
    kind !== "all" ? kindLabel(kind) : null,
    level !== "all" ? levelLabel(level) : null,
  ].filter((v): v is string => v !== null);
  const announcement =
    visible.length === 0
      ? COPY["filter.live.none"]
      : (labels.length > 0 ? COPY["filter.live.some"] : COPY["filter.live.all"])
          .replace("{N}", String(visible.length))
          .replace("{F}", labels.join(", "));

  return (
    <div className={styles.page}>
      <ParticleField />
      <div className={styles.content}>
        <PageHero title={COPY["page.content.title"]} lede={COPY["page.content.lede"]} />
        <div className={styles.filters}>
          <FilterPill
            kind={kind}
            level={level}
            counts={chipCounts}
            onKind={(k) => update(k, level)}
            onLevel={(l) => update(kind, l)}
          />
        </div>
        <div className={styles.grid}>
          <ArticleGrid
            articles={visible}
            allOrdered={ordered}
            announcement={announcement}
            onReset={() => update("all", "all")}
          />
        </div>
      </div>
    </div>
  );
}
