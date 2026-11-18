import { Fragment, useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { AboutBottle } from "@/components/content/AboutBottle";
import { Appear } from "@/components/content/Appear";
import { ClosingStrip } from "@/components/content/ClosingStrip";
import { FactCard, type FactCardSize } from "@/components/content/FactCard";
import { isShowable } from "@/components/content/factUtils";
import { ParticleField } from "@/components/content/ParticleField";
import { ScenarioCards } from "@/components/content/ScenarioCards";
import { SideIndex } from "@/components/content/SideIndex";
import { TempDiagram } from "@/components/content/TempDiagram";
import { WaveDivider } from "@/components/content/WaveDivider";
import { usePageFocus } from "@/components/ui/usePageFocus";
import { usePageTheme } from "@/components/ui/usePageTheme";
import { COPY } from "@/content/copy";
import { FACTS, type Fact } from "@/content/facts";
import { SITE } from "@/content/site";
import { useScrollVar } from "@/hooks/useScrollVar";
import styles from "./AboutPage.module.css";

// TODO(A): kursor cincin sudah diaktifkan di #/about lewat AppShell (disetujui); kartu dan tautan memakai data-cursor.

// Fakta tampil hanya bila `verified: true`; yang belum terverifikasi tidak dirender sama sekali.
const SHOWABLE = (Object.values(FACTS) as Fact[]).filter(isShowable);
// Angka besar di samping Latar belakang ditentukan data (`feature`); sisanya masuk daftar Angka.
const FEATURED = SHOWABLE.find((f) => f.feature);
const LISTED = SHOWABLE.filter((f) => !f.feature);

/**
 * Ukuran kartu pada grid 12 kolom ditentukan jumlah data: baris berpasangan 7:5 lalu 5:7;
 * bila jumlah ganjil, kartu terakhir selebar penuh (tidak ada kartu yatim).
 */
function sizeAt(i: number, total: number): FactCardSize {
  if (total % 2 === 1 && i === total - 1) return "full";
  const rowEven = Math.floor(i / 2) % 2 === 0;
  const first = i % 2 === 0;
  return rowEven === first ? "wide" : "narrow";
}

interface SectionDef {
  id: string;
  label: string;
}

// Label indeks memakai teks yang sudah ada: judul hero dan kalimat penutup untuk dua ujungnya.
const SECTIONS: readonly SectionDef[] = [
  { id: "pengantar", label: COPY["about.hero.title"] },
  { id: "latar-belakang", label: COPY["about.background.title"] },
  { id: "dua-skenario", label: COPY["about.scenarios.title"] },
  ...(LISTED.length > 0 ? [{ id: "angka", label: COPY["about.facts.title"] }] : []),
  { id: "suhu", label: COPY["about.temp.section"] },
  { id: "penutup", label: COPY["about.closing"] },
];

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-judul`} className={styles.section}>
      <Appear>
        <h2 id={`${id}-judul`} className="t-h2">
          {title}
        </h2>
      </Appear>
      {children}
    </section>
  );
}

const PARTICLE_COLORS = [
  "color-mix(in srgb, var(--page-accent) 32%, transparent)",
  "color-mix(in srgb, var(--page-ink) 16%, transparent)",
] as const;

export default function AboutPage() {
  usePageTheme("about");
  const pageRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  usePageFocus(titleRef);
  useScrollVar(pageRef);

  // Jeda semua gerak CSS saat tab tersembunyi.
  useEffect(() => {
    const el = pageRef.current;
    const sync = () => el?.style.setProperty("--wave-state", document.hidden ? "paused" : "running");
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  const lines = COPY["about.hero.title"].split(" ");

  return (
    <div className={styles.page} ref={pageRef}>
      <ParticleField colors={PARTICLE_COLORS} />
      <SideIndex items={SECTIONS} />
      <AboutBottle />

      <div className={styles.content}>
        {/* 1. Hero */}
        <header id="pengantar" className={styles.hero}>
          <p className={`t-ui ${styles.eyebrow}`}>{SITE.subtheme}</p>
          <h1 ref={titleRef} tabIndex={-1} className={`t-chapter ${styles.title}`}>
            {lines.map((word, i) => (
              <Fragment key={word}>
                <span className={styles.line}>
                  <span className={styles.lineInner} style={{ "--i": i } as CSSProperties}>
                    {word}
                  </span>
                </span>
                {i < lines.length - 1 ? " " : null}
              </Fragment>
            ))}
          </h1>
          <p className={`t-body-lg ${styles.lede}`}>{COPY["about.why.body"]}</p>
        </header>

        <WaveDivider />

        {/* 2. Latar belakang */}
        <Section id="latar-belakang" title={COPY["about.background.title"]}>
          <div className={styles.grid}>
            <Appear className={`${styles.text} ${styles.colWide}`}>
              <p className="t-body">{COPY["about.background.1"]}</p>
              <p className="t-body">{COPY["about.background.2"]}</p>
            </Appear>
            {FEATURED ? (
              <div className={styles.colNarrow}>
                <FactCard fact={FEATURED} size="wide" inline />
              </div>
            ) : null}
          </div>
        </Section>

        <WaveDivider />

        {/* 3. Dua skenario */}
        <Section id="dua-skenario" title={COPY["about.scenarios.title"]}>
          <ScenarioCards />
        </Section>

        {/* 4. Angka */}
        {LISTED.length > 0 ? (
          <>
            <WaveDivider />
            <Section id="angka" title={COPY["about.facts.title"]}>
              <ul className={`${styles.grid} ${styles.facts}`}>
                {LISTED.map((fact, i) => (
                  <FactCard
                    key={fact.key}
                    as="li"
                    fact={fact}
                    size={sizeAt(i, LISTED.length)}
                    index={i}
                  />
                ))}
              </ul>
            </Section>
          </>
        ) : null}

        <WaveDivider />

        {/* 5. Suhu dan target 1,5°C */}
        <Section id="suhu" title={COPY["about.temp.section"]}>
          <div className={styles.grid}>
            <Appear className={`${styles.text} ${styles.colNarrow}`}>
              <p className="t-body">{COPY["about.temp.body"]}</p>
            </Appear>
            <div className={styles.colWide}>
              <TempDiagram />
            </div>
          </div>
        </Section>

        <WaveDivider />

        {/* 6. Penutup */}
        <section id="penutup" aria-label={COPY["about.closing"]}>
          <ClosingStrip email={SITE.email} />
        </section>
      </div>
    </div>
  );
}
