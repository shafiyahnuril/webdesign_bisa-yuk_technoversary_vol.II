import { ClosingStrip } from "@/components/content/ClosingStrip";
import { FactBlock } from "@/components/content/FactBlock";
import { factProps } from "@/components/content/factUtils";
import { LicenseTable } from "@/components/content/LicenseTable";
import { SourceList } from "@/components/content/SourceList";
import { buildSourceGroups } from "@/components/content/sourceGroups";
import { TeamGrid } from "@/components/content/TeamGrid";
import { TempDiagram } from "@/components/content/TempDiagram";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { usePageTheme } from "@/components/ui/usePageTheme";
import { ARTICLES } from "@/content/articles";
import { COPY } from "@/content/copy";
import { CREDITS } from "@/content/credits";
import { FACTS, type Fact } from "@/content/facts";
import { SITE } from "@/content/site";
import styles from "./AboutPage.module.css";

// Tiga fakta latar isu: mikroplastik, bahan fosil, emisi siklus hidup (docs/05 bagian 3.1).
const BACKGROUND_FACTS = ["mikroplastik-mingguan", "produksi-plastik", "emisi-plastik"] as const;

const SOURCE_GROUPS = buildSourceGroups(FACTS as Record<string, Fact>, ARTICLES);

export default function AboutPage() {
  usePageTheme("about");
  return (
    <>
      {/* 1. Hero */}
      <PageHero
        title={COPY["about.hero.title"]}
        lede={COPY["about.why.body"]}
        eyebrow={SITE.subtheme}
      />

      <div className={styles.sections}>
        {/* 2. Latar isu */}
        <Reveal as="section" className={`${styles.section} ${styles.split}`}>
          <div className={styles.text}>
            <h2 className="t-h2">{COPY["about.scenario.title"]}</h2>
            {/* TODO(T8.2): dua paragraf latar isu menunggu naskah final (docs/11). */}
            <p className="t-body">{COPY["about.scenario.body"]}</p>
          </div>
          <div className={styles.facts}>
            {BACKGROUND_FACTS.map((key) => (
              <FactBlock key={key} {...factProps(key)} />
            ))}
          </div>
        </Reveal>

        {/* 3. Target 1,5 derajat */}
        <Reveal as="section" className={styles.section}>
          <h2 className="t-h2">{COPY["about.temp.title"]}</h2>
          <p className="t-body">{COPY["about.temp.body"]}</p>
          <TempDiagram />
        </Reveal>

        {/* 4. Sumber data */}
        <Reveal as="section" className={styles.section}>
          <h2 className="t-h2">{COPY["about.sources.title"]}</h2>
          <SourceList groups={SOURCE_GROUPS} />
        </Reveal>

        {/* 5. Atribusi dan lisensi */}
        <Reveal as="section" className={styles.section}>
          <h2 className="t-h2">{COPY["about.licenses.title"]}</h2>
          {/* TODO: keterangan penggunaan alat bantu ilustrasi menunggu info Pihak A; tidak ada klaim ditulis. */}
          <LicenseTable credits={CREDITS} />
        </Reveal>

        {/* 6. Tim */}
        <Reveal as="section" className={styles.section}>
          <h2 className="t-h2">{COPY["about.team.title"]}</h2>
          <TeamGrid members={SITE.team} />
        </Reveal>

        {/* 7. Penutup */}
        <Reveal as="section" className={styles.section}>
          <ClosingStrip email={SITE.email} />
        </Reveal>
      </div>
    </>
  );
}
