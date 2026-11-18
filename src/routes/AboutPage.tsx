import { Fragment, useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { AboutBottle } from "@/components/content/AboutBottle";
import { Appear } from "@/components/content/Appear";
import { ClosingStrip } from "@/components/content/ClosingStrip";
import { CreditChips } from "@/components/content/CreditChips";
import { FactCard, type FactCardSize } from "@/components/content/FactCard";
import { isShowable } from "@/components/content/factUtils";
import { ParticleField } from "@/components/content/ParticleField";
import { ScenarioCards } from "@/components/content/ScenarioCards";
import { SideIndex } from "@/components/content/SideIndex";
import { SourceAccordion } from "@/components/content/SourceAccordion";
import { buildSourceGroups } from "@/components/content/sourceGroups";
import { TeamGrid } from "@/components/content/TeamGrid";
import { TempDiagram } from "@/components/content/TempDiagram";
import { WaveDivider } from "@/components/content/WaveDivider";
import { usePageFocus } from "@/components/ui/usePageFocus";
import { usePageTheme } from "@/components/ui/usePageTheme";
import { ARTICLES } from "@/content/articles";
import { COPY } from "@/content/copy";
import { CREDITS } from "@/content/credits";
import { FACTS, type Fact } from "@/content/facts";
import { SITE } from "@/content/site";
import { useScrollVar } from "@/hooks/useScrollVar";
import styles from "./AboutPage.module.css";

// TODO(A): kursor cincin sudah diaktifkan di #/about lewat AppShell (disetujui); kartu dan tautan memakai data-cursor.

const ALL_FACTS = Object.values(FACTS as Record<string, Fact>);
const SHOWABLE = ALL_FACTS.filter(isShowable);
// Angka besar di samping Latar belakang ditentukan data (`feature`); sisanya masuk daftar Angka.
const FEATURED = SHOWABLE.find((f) => f.feature);
const LISTED = SHOWABLE.filter((f) => !f.feature);
// Hanya DEV: celah data tampil sebagai "[DATA]"; produksi menyembunyikannya.
const PENDING = import.meta.env.DEV ? ALL_FACTS.filter((f) => !isShowable(f)) : [];

const SOURCE_GROUPS = buildSourceGroups(FACTS as Record<string, Fact>, ARTICLES);

// Ukuran kartu bergantian menurut urutan data: lebar, sempit, sempit, lebar, dan seterusnya.
const sizeAt = (i: number): FactCardSize => (i % 4 === 0 || i % 4 === 3 ? "wide" : "narrow");

interface SectionDef {
  id: string;
  label: string;
}

const SECTIONS: readonly SectionDef[] = [
  { id: "latar-belakang", label: COPY["about.background.title"] },
  { id: "dua-skenario", label: COPY["about.scenarios.title"] },
  ...(LISTED.length > 0 || PENDING.length > 0
    ? [{ id: "angka", label: COPY["about.facts.title"] }]
    : []),
  { id: "suhu", label: COPY["about.temp.section"] },
  { id: "sumber-data", label: COPY["about.sources.title"] },
  { id: "lisensi-dan-kredit", label: COPY["about.licenses.title"] },
  { id: "tim", label: COPY["about.team.title"] },
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
        <header className={styles.hero}>
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
          <div className={styles.split}>
            <Appear className={styles.text}>
              <p className="t-body">{COPY["about.background.1"]}</p>
              <p className="t-body">{COPY["about.background.2"]}</p>
            </Appear>
            {FEATURED ? <FactCard fact={FEATURED} size="wide" inline /> : null}
          </div>
        </Section>

        <WaveDivider />

        {/* 3. Dua skenario */}
        <Section id="dua-skenario" title={COPY["about.scenarios.title"]}>
          <Appear>
            <p className="t-body">{COPY["about.scenario.body"]}</p>
          </Appear>
          <ScenarioCards />
        </Section>

        {/* 4. Angka */}
        {SECTIONS.some((s) => s.id === "angka") ? (
          <>
            <WaveDivider />
            <Section id="angka" title={COPY["about.facts.title"]}>
              {LISTED.length > 0 ? (
                <ul className={styles.facts}>
                  {LISTED.map((fact, i) => (
                    <FactCard key={fact.key} as="li" fact={fact} size={sizeAt(i)} index={i} />
                  ))}
                </ul>
              ) : null}
              {PENDING.length > 0 ? (
                <ul className={styles.dev}>
                  {PENDING.map((fact) => (
                    <li key={fact.key} data-fact-pending={fact.key} className="t-ui-sm">
                      {COPY["about.fact.dev"]} {fact.statement}
                    </li>
                  ))}
                </ul>
              ) : null}
            </Section>
          </>
        ) : null}

        <WaveDivider />

        {/* 5. Suhu dan target 1,5°C */}
        <Section id="suhu" title={COPY["about.temp.section"]}>
          <Appear>
            <p className="t-body">{COPY["about.temp.body"]}</p>
          </Appear>
          <TempDiagram />
        </Section>

        <WaveDivider />

        {/* 6. Sumber data */}
        <Section id="sumber-data" title={COPY["about.sources.title"]}>
          <SourceAccordion groups={SOURCE_GROUPS} />
        </Section>

        <WaveDivider />

        {/* 7. Lisensi dan kredit */}
        <Section id="lisensi-dan-kredit" title={COPY["about.licenses.title"]}>
          <CreditChips credits={CREDITS} />
        </Section>

        <WaveDivider />

        {/* 8. Tim */}
        <Section id="tim" title={COPY["about.team.title"]}>
          <TeamGrid members={SITE.team} />
        </Section>

        <WaveDivider />

        {/* 9. Penutup */}
        <section aria-label={COPY["about.closing"]}>
          <ClosingStrip email={SITE.email} />
        </section>
      </div>
    </div>
  );
}
