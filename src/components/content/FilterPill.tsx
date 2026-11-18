import { COPY } from "@/content/copy";
import {
  KIND_OPTIONS,
  LEVEL_OPTIONS,
  type KindFilter,
  type LevelFilter,
  type counts as CountsFn,
} from "./filter";
import { kindLabel, levelLabel } from "./filterLabels";
import styles from "./FilterPill.module.css";

type Counts = ReturnType<typeof CountsFn>;

interface FilterPillProps {
  kind: KindFilter;
  level: LevelFilter;
  counts: Counts;
  onKind: (k: KindFilter) => void;
  onLevel: (l: LevelFilter) => void;
}

/** Pil filter dua kelompok (dok 02 §6.9). Chip aktif tidak bisa dibatalkan; kembali lewat "Semua". */
export function FilterPill({ kind, level, counts, onKind, onLevel }: FilterPillProps) {
  return (
    <div className={styles.pill}>
      <div role="group" aria-label={COPY["filter.group.kind"]} className={styles.group}>
        {KIND_OPTIONS.map((k) => (
          <Chip
            key={k}
            label={kindLabel(k)}
            count={counts.kind[k]}
            active={kind === k}
            onClick={() => onKind(k)}
          />
        ))}
      </div>
      <span className={styles.divider} aria-hidden="true" />
      <div role="group" aria-label={COPY["filter.group.level"]} className={styles.group}>
        {LEVEL_OPTIONS.map((l) => (
          <Chip
            key={l}
            label={levelLabel(l)}
            count={counts.level[l]}
            active={level === l}
            onClick={() => onLevel(l)}
          />
        ))}
      </div>
    </div>
  );
}

interface ChipProps {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}

function Chip({ label, count, active, onClick }: ChipProps) {
  return (
    <button type="button" className={`t-ui ${styles.chip}`} aria-pressed={active} onClick={onClick}>
      {label}
      <sup className={`t-mono ${styles.count}`}>{count}</sup>
    </button>
  );
}
