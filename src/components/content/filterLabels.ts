import { COPY } from "@/content/copy";
import type { KindFilter, LevelFilter } from "./filter";

const KIND_LABEL: Record<KindFilter, string> = {
  all: COPY["filter.all"],
  negatif: COPY["filter.kind.negatif"],
  positif: COPY["filter.kind.positif"],
};

const LEVEL_LABEL: Record<LevelFilter, string> = {
  all: COPY["filter.all"],
  "sehari-hari": COPY["filter.level.sehari-hari"],
  nasional: COPY["filter.level.nasional"],
  global: COPY["filter.level.global"],
};

export function kindLabel(k: KindFilter): string {
  return KIND_LABEL[k];
}

export function levelLabel(l: LevelFilter): string {
  return LEVEL_LABEL[l];
}
