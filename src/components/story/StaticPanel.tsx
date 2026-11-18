import type { RefObject } from "react";
import { COPY } from "@/content/copy";
import { FACTS, type Fact } from "@/content/facts";
import { TEMP } from "@/lib/tokens";
import { BrandMark } from "@/components/ui/BrandMark";
import { CopyPanel } from "./CopyPanel";
import { formatTemp } from "./ChapterMarker";
import styles from "./StaticPanel.module.css";

export type StaticPanelId =
  | "b1"
  | "b2"
  | "b3"
  | "b4"
  | "b5"
  | "b6"
  | "punch"
  | "b7"
  | "b8"
  | "b9"
  | "b10";

export interface StaticPanelSpec {
  id: StaticPanelId;
  index: number; // 1..11
  chapterNumber?: number; // 1..10 (undefined for punch)
  chapterLabel?: string; // "01".."10"
  title: string;
  temperature?: string;
  imageFile: string;
  imageAlt: string;
  theme: "dark" | "punch" | "act2" | "light";
}

function isFactVerified(fact: Fact): fact is Fact & { value: string | number; year: number } {
  if (!fact.verified) return false;
  if (fact.value === null || fact.value === "" || String(fact.value).includes("TODO")) {
    return false;
  }
  if (fact.year === null || fact.publisher.includes("TODO")) return false;
  return true;
}

function renderFactLine(fact: Fact): string | null {
  if (!isFactVerified(fact)) return null;
  const valStr = fact.unit ? `${fact.value} ${fact.unit}` : String(fact.value);
  return fact.statement.replace("{X}", valStr);
}

export const STATIC_PANEL_SPECS: readonly StaticPanelSpec[] = [
  {
    id: "b1",
    index: 1,
    chapterNumber: 1,
    chapterLabel: "01",
    title: COPY["ch1.title"],
    temperature: `${formatTemp(TEMP.c1)} (skenario)`,
    imageFile: "img/static/panel-01.svg",
    imageAlt: "Ilustrasi Bab 01 Lahir: botol plastik sekali pakai baru di atas alas gelap",
    theme: "dark",
  },
  {
    id: "b2",
    index: 2,
    chapterNumber: 2,
    chapterLabel: "02",
    title: COPY["ch2.title"],
    temperature: `${formatTemp(TEMP.c2)} (skenario)`,
    imageFile: "img/static/panel-02.svg",
    imageAlt: "Ilustrasi Bab 02 Sekali Pakai: tangan menggenggam botol dengan cincin waktu 10 menit",
    theme: "dark",
  },
  {
    id: "b3",
    index: 3,
    chapterNumber: 3,
    chapterLabel: "03",
    title: COPY["ch3.title"],
    temperature: `${formatTemp(TEMP.c3)} (skenario)`,
    imageFile: "img/static/panel-03.svg",
    imageAlt: "Ilustrasi Bab 03 Tersesat: botol plastik hanyut di saluran air kota",
    theme: "dark",
  },
  {
    id: "b4",
    index: 4,
    chapterNumber: 4,
    chapterLabel: "04",
    title: COPY["ch4.title"],
    temperature: `${formatTemp(TEMP.c4)} (skenario)`,
    imageFile: "img/static/panel-04.svg",
    imageAlt: "Ilustrasi Bab 04 Lautan: botol mengapung di permukaan laut bersama karang memutih",
    theme: "dark",
  },
  {
    id: "b5",
    index: 5,
    chapterNumber: 5,
    chapterLabel: "05",
    title: COPY["ch5.title"],
    temperature: `${formatTemp(TEMP.c5)} (skenario)`,
    imageFile: "img/static/panel-05.svg",
    imageAlt: "Ilustrasi Bab 05 Terurai: botol plastik retak menjadi serpihan mikroplastik",
    theme: "dark",
  },
  {
    id: "b6",
    index: 6,
    chapterNumber: 6,
    chapterLabel: "06",
    title: COPY["ch6.title"],
    temperature: `${formatTemp(TEMP.c6)} (skenario)`,
    imageFile: "img/static/panel-06.svg",
    imageAlt: "Ilustrasi Bab 06 Kembali ke Kita: piring makan dengan jejak partikel mikroplastik",
    theme: "dark",
  },
  {
    id: "punch",
    index: 7,
    title: COPY["punch.line"],
    imageFile: "img/static/panel-07.svg",
    imageAlt: "Ilustrasi jeda refleksi: bagaimana jika semua ini tidak terjadi",
    theme: "punch",
  },
  {
    id: "b7",
    index: 8,
    chapterNumber: 7,
    chapterLabel: "07",
    title: COPY["ch7.title"],
    temperature: `${formatTemp(TEMP.c7)} (skenario)`,
    imageFile: "img/static/panel-08.svg",
    imageAlt: "Ilustrasi Bab 07 Di Tempat yang Benar: botol dimasukkan ke tempat sampah terpilah dalam 10 detik",
    theme: "act2",
  },
  {
    id: "b8",
    index: 9,
    chapterNumber: 8,
    chapterLabel: "08",
    title: COPY["ch8.title"],
    temperature: `${formatTemp(TEMP.c8)} (skenario)`,
    imageFile: "img/static/panel-09.svg",
    imageAlt: "Ilustrasi Bab 08 Perjalanan Kedua: botol-botol bersih berjalan di atas sabuk konveyor pemilah",
    theme: "act2",
  },
  {
    id: "b9",
    index: 10,
    chapterNumber: 9,
    chapterLabel: "09",
    title: COPY["ch9.title"],
    temperature: `${formatTemp(TEMP.c9)} (skenario)`,
    imageFile: "img/static/panel-10.svg",
    imageAlt: "Ilustrasi Bab 09 Hidup Baru, Tapi...: empat stasiun cacah, cuci, lebur, dan cetak",
    theme: "light",
  },
  {
    id: "b10",
    index: 11,
    chapterNumber: 10,
    chapterLabel: "10",
    title: COPY["ch10e.cta"],
    temperature: `${formatTemp(TEMP.c10)} (skenario)`,
    imageFile: "img/static/panel-11.svg",
    imageAlt: "Ilustrasi Bab 10: botol isi ulang yang dibawa besok",
    theme: "light",
  },
] as const;

export interface StaticPanelProps {
  spec: StaticPanelSpec;
  isActive: boolean;
  isUnlocked: boolean;
  canUnlockMore: boolean;
  onUnlockNext?: () => void;
  onRestart?: () => void;
  panelRef?: (node: HTMLElement | null) => void;
  firstHeadingRef?: RefObject<HTMLHeadingElement | null>;
}

export function StaticPanel({
  spec,
  isActive,
  isUnlocked,
  canUnlockMore,
  onUnlockNext,
  onRestart,
  panelRef,
  firstHeadingRef,
}: StaticPanelProps) {
  const baseUrl = import.meta.env.BASE_URL || "/";
  const imgSrc = `${baseUrl.replace(/\/$/, "")}/${spec.imageFile}`;
  const isLight = spec.theme === "light";

  const lamaTerurai = FACTS["lama-terurai"];
  const verifiedYears =
    isFactVerified(lamaTerurai) && typeof lamaTerurai.value === "number"
      ? lamaTerurai.value
      : null;
  const bleachFact = renderFactLine(FACTS["terumbu-pemutihan"]);
  const seaFact = renderFactLine(FACTS["kenaikan-laut"]);
  const mpFactLine = renderFactLine(FACTS["mikroplastik-mingguan"]);
  const collectedFactLine = renderFactLine(FACTS["botol-terkumpul"]);
  const showFiberNote = isFactVerified(FACTS["pet-menjadi-serat"]);
  const stations = COPY["ch9.stations"].split("·").map((s) => s.trim());

  return (
    <article
      ref={panelRef}
      className={`${styles.panel} ${styles[`theme_${spec.theme}`]}`}
      data-static-panel={spec.id}
      data-panel-index={spec.index}
      data-active={isActive ? "true" : "false"}
      data-unlocked={isUnlocked ? "true" : "false"}
      aria-labelledby={`static-panel-title-${spec.id}`}
    >
      <div className={styles.inner}>
        {/* Header bab & skenario */}
        <header className={styles.header}>
          {spec.index === 1 ? (
            <div className={styles.heroBanner}>
              <BrandMark size="hero" className={styles.heroBrand} />
              <p className={styles.scenarioNotice} data-scenario-label>
                {COPY["hero.scenario"]}
              </p>
            </div>
          ) : null}

          {spec.chapterLabel ? (
            <div className={styles.metaRow}>
              <span className={styles.chapterBadge}>Bab {spec.chapterLabel}</span>
              {spec.temperature ? (
                <span className={styles.tempBadge}>{spec.temperature}</span>
              ) : null}
            </div>
          ) : (
            <div className={styles.metaRow}>
              <span className={styles.chapterBadge}>Titik Balik</span>
            </div>
          )}

          <h2
            id={`static-panel-title-${spec.id}`}
            ref={spec.index === 1 ? firstHeadingRef : undefined}
            tabIndex={-1}
            className={spec.id === "punch" ? styles.punchHeading : styles.heading}
          >
            {spec.title}
          </h2>
        </header>

        {/* Ilustrasi statis 16:10 */}
        <figure className={styles.figure}>
          <img
            src={imgSrc}
            alt={spec.imageAlt}
            className={styles.illustration}
            loading={spec.index <= 2 ? "eager" : "lazy"}
            decoding="async"
          />
        </figure>

        {/* Isi naratif HTML asli */}
        <div className={styles.content}>
          {spec.id === "b1" && (
            <CopyPanel>
              <p className={styles.lead}>{COPY["ch1.line"]}</p>
              <p className={styles.body}>{COPY["ch1.sub"]}</p>
            </CopyPanel>
          )}

          {spec.id === "b2" && (
            <CopyPanel>
              <div className={styles.metricBadge}>10 menit</div>
              <p className={styles.lead}>{COPY["ch2.line"]}</p>
              <p className={styles.body}>{COPY["ch2.sub"]}</p>
            </CopyPanel>
          )}

          {spec.id === "b3" && (
            <CopyPanel>
              {verifiedYears !== null ? (
                <div className={styles.metricBadge}>
                  {verifiedYears} {COPY["ch3.counter.label"]}
                </div>
              ) : null}
              <p className={styles.lead}>{COPY["ch3.sub"]}</p>
            </CopyPanel>
          )}

          {spec.id === "b4" && (
            <CopyPanel>
              <p className={styles.lead}>{COPY["ch4.line"]}</p>
              <p className={styles.body}>{COPY["ch4.sub"]}</p>
              {bleachFact ? <p className={styles.factLine}>{bleachFact}</p> : null}
              {seaFact ? <p className={styles.factLine}>{seaFact}</p> : null}
            </CopyPanel>
          )}

          {spec.id === "b5" && (
            <CopyPanel>
              <p className={styles.lead}>{COPY["ch5.line"]}</p>
            </CopyPanel>
          )}

          {spec.id === "b6" && (
            <CopyPanel>
              <p className={styles.lead}>{mpFactLine ?? COPY["ch6.fallback"]}</p>
              <p className={styles.body}>{COPY["ch6.sub"]}</p>
            </CopyPanel>
          )}

          {spec.id === "punch" && (
            <p className={styles.punchSub}>{COPY["about.why.body"]}</p>
          )}

          {spec.id === "b7" && (
            <div className={styles.stack}>
              <CopyPanel>
                <div className={styles.metricBadge}>10 detik</div>
                <p className={styles.lead}>{COPY["ch7.line"]}</p>
                <p className={styles.flashNote}>{COPY["ch7.bins"]}</p>
              </CopyPanel>
              <blockquote className={styles.letterStatic} data-letter-card>
                {COPY["ch7.letter"]}
              </blockquote>
            </div>
          )}

          {spec.id === "b8" && (
            <div className={styles.stack}>
              <CopyPanel>
                <p className={styles.lead}>{COPY["ch8.sub"]}</p>
                {collectedFactLine ? (
                  <p className={styles.factLine}>{collectedFactLine}</p>
                ) : null}
              </CopyPanel>
              <blockquote className={styles.letterStatic} data-letter-card>
                {COPY["ch8.letter"]}
              </blockquote>
            </div>
          )}

          {spec.id === "b9" && (
            <div className={styles.stack}>
              <CopyPanel light={isLight}>
                <ol className={styles.stationList}>
                  {stations.map((label, idx) => (
                    <li key={label}>
                      <strong>{String(idx + 1).padStart(2, "0")}</strong> {label}
                    </li>
                  ))}
                </ol>
                {showFiberNote ? (
                  <p className={styles.factLine}>{COPY["ch9.note"]}</p>
                ) : null}
              </CopyPanel>
              <blockquote
                className={`${styles.letterStatic} ${styles.letterLight}`}
                data-letter-card
              >
                {COPY["ch9.letter"]}
              </blockquote>
            </div>
          )}

          {spec.id === "b10" && (
            <div className={styles.stack}>
              <blockquote
                className={`${styles.letterStatic} ${styles.letterLight}`}
                data-letter-card
              >
                {COPY["ch10a.letter"]}
              </blockquote>
              <blockquote
                className={`${styles.letterStatic} ${styles.letterLight}`}
                data-letter-card
              >
                {COPY["ch10b.letter"]}
              </blockquote>
              <CopyPanel light>
                <blockquote
                  className={`${styles.letterStatic} ${styles.letterLight}`}
                  data-letter-card
                >
                  {COPY["ch10d.letter"]}
                </blockquote>
              </CopyPanel>
              <div className={styles.closingBlock}>
                <p className={styles.ctaHeadline}>{COPY["ch10e.cta"]}</p>
                <button
                  type="button"
                  className={styles.restartBtn}
                  onClick={onRestart}
                  data-static-restart
                >
                  {COPY["static.start"]}
                </button>
              </div>
            </div>
          )}

          {/* Tombol bantu aksesibilitas keyboard/pembaca layar bila pengguna tidak menggulir lama */}
          {isActive && canUnlockMore && onUnlockNext ? (
            <div className={styles.unlockRow}>
              <button
                type="button"
                className={styles.unlockBtn}
                onClick={onUnlockNext}
                data-static-unlock-next
              >
                Lanjut ke bagian berikutnya
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
