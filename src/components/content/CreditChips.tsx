import type { CSSProperties } from "react";
import { COPY } from "@/content/copy";
import type { Credit } from "@/content/credits";
import styles from "./CreditChips.module.css";

/** Penanda isian yang belum diisi (jangan ditampilkan ke pengunjung). */
const isPending = (text: string | undefined) => !text || text.startsWith("TODO");

// Nama font ditulis dengan font itu sendiri (tumpukan font dari tokens.css).
const FONT_STACK: Record<string, string> = {
  "Bricolage Grotesque": "var(--font-display)",
  "Instrument Sans": "var(--font-ui)",
  Caveat: "var(--font-hand)",
  "JetBrains Mono": "var(--font-mono)",
};

type Group = "font" | "lib" | "asset";

const groupOf = (c: Credit): Group =>
  c.type === "font" ? "font" : c.type === "lib" ? "lib" : "asset";

const ORDER: readonly Group[] = ["font", "lib", "asset"];

const GROUP_LABEL: Record<Group, string> = {
  font: COPY["about.licenses.type.font"],
  lib: COPY["about.licenses.type.lib"],
  asset: COPY["about.licenses.group.asset"],
};

/** Atribusi dan lisensi sebagai chip berkelompok (Font, Pustaka, Aset). Seluruh isi `credits.ts` tampil. */
export function CreditChips({ credits }: { credits: readonly Credit[] }) {
  // TODO: keterangan penggunaan alat bantu ilustrasi menunggu info Pihak A; tidak ada klaim ditulis.
  return (
    <div className={styles.groups}>
      {ORDER.map((group) => {
        const items = credits.filter((c) => groupOf(c) === group);
        if (items.length === 0) return null;
        return (
          <section key={group} className={styles.group}>
            <h3 className={`t-ui ${styles.label}`}>{GROUP_LABEL[group]}</h3>
            <ul className={styles.chips}>
              {items.map((c) => {
                const style: CSSProperties | undefined =
                  c.type === "font" && FONT_STACK[c.name]
                    ? { fontFamily: FONT_STACK[c.name] }
                    : undefined;
                const meta = [c.author, c.license].filter(Boolean).join(", ");
                return (
                  <li key={`${c.type}-${c.name}`} className={styles.chip} data-cursor="info" data-hover>
                    {c.url ? (
                      <a
                        className={styles.name}
                        style={style}
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-cursor="link"
                      >
                        {c.name} ↗
                      </a>
                    ) : (
                      <span className={styles.name} style={style}>
                        {c.name}
                      </span>
                    )}
                    <span className={`t-ui-sm ${styles.meta}`}>{meta}</span>
                    {isPending(c.method) ? null : (
                      <span className={`t-ui-sm ${styles.meta}`}>{c.method}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
