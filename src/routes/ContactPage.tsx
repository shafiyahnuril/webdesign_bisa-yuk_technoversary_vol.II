import { Fragment, useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { Appear } from "@/components/content/Appear";
import { BOTTLE_MAX_LEVEL, ContactBottle } from "@/components/content/ContactBottle";
import { ContactForm, type ContactProgress } from "@/components/content/ContactForm";
import { ContactIcon, type ContactIconName } from "@/components/content/ContactIcon";
import { ParticleField } from "@/components/content/ParticleField";
import { WaveDivider } from "@/components/content/WaveDivider";
import { usePageFocus } from "@/components/ui/usePageFocus";
import { usePageTheme } from "@/components/ui/usePageTheme";
import { COPY } from "@/content/copy";
import { SITE } from "@/content/site";
import { useInView } from "@/hooks/useInView";
import styles from "./ContactPage.module.css";

// Serpihan sedikit dan pelan; warna dari token halaman (tanpa warna hangat).
const PARTICLE_COLORS = [
  "color-mix(in srgb, var(--page-accent) 26%, transparent)",
  "color-mix(in srgb, var(--page-ink) 14%, transparent)",
] as const;
const PARTICLE_COUNT = 14;

interface InfoRow {
  icon: ContactIconName;
  label: string;
  value: string;
  href?: string;
}

const ROWS: readonly InfoRow[] = [
  {
    icon: "mail",
    label: COPY["contact.info.email"],
    value: SITE.email,
    href: `mailto:${SITE.email}`,
  },
  { icon: "account", label: COPY["contact.info.account"], value: SITE.account },
  { icon: "theme", label: COPY["contact.info.subtheme"], value: SITE.subtheme },
  { icon: "event", label: COPY["contact.info.competition"], value: SITE.competition },
];

const LINKS = [
  { icon: "about", to: "/about", label: COPY["contact.info.about"] },
  { icon: "articles", to: "/konten", label: COPY["contact.info.content"] },
] as const;

export default function ContactPage() {
  usePageTheme("contact");
  const pageRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  usePageFocus(headingRef);
  const [brandRef, brandIn] = useInView<HTMLParagraphElement>(0.5);
  const [level, setLevel] = useState(0);

  // Hanya mengubah state saat nilai berubah (paling banyak empat kali), bukan per ketukan.
  const onProgress = useCallback(({ valid, done }: ContactProgress) => {
    setLevel(done ? BOTTLE_MAX_LEVEL : valid);
  }, []);

  // Jeda gerak CSS (gelombang, riak air) saat tab tersembunyi.
  useEffect(() => {
    const el = pageRef.current;
    const sync = () =>
      el?.style.setProperty("--wave-state", document.hidden ? "paused" : "running");
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  // Judul muncul per baris: kata terakhir di baris sendiri.
  const words = COPY["contact.headline"].split(" ");
  const lines = [words.slice(0, -1).join(" "), words.slice(-1).join(" ")];

  return (
    <div className={styles.page} ref={pageRef}>
      <ParticleField colors={PARTICLE_COLORS} count={PARTICLE_COUNT} />

      <div className={styles.content}>
        <header className={styles.hero}>
          <p ref={brandRef} className={`t-ui ${styles.brand}`}>
            <span className={`${styles.re} ${brandIn ? styles.reOn : ""}`}>Re:</span>bottle
          </p>
          <h1 ref={headingRef} tabIndex={-1} className={`t-chapter ${styles.headline}`}>
            {lines.map((line, i) => (
              <Fragment key={line}>
                <span className={styles.line}>
                  <span className={styles.lineInner} style={{ "--i": i } as CSSProperties}>
                    {line}
                  </span>
                </span>
                {i < lines.length - 1 ? " " : null}
              </Fragment>
            ))}
          </h1>
          <p className={`t-body-lg ${styles.intro}`}>{COPY["contact.intro"]}</p>
        </header>

        <WaveDivider />

        <div className={styles.columns}>
          <Appear className={styles.formCol}>
            <section className={styles.card} aria-labelledby="contact-form-title">
              <h2 id="contact-form-title" className={`t-h2 ${styles.colTitle}`}>
                {COPY["contact.form.title"]}
              </h2>
              <ContactForm email={SITE.email} onProgress={onProgress} />
            </section>
          </Appear>

          <aside className={styles.infoCol} aria-labelledby="contact-info-title">
            <div className={styles.infoMain}>
              <h2 id="contact-info-title" className={`t-h2 ${styles.colTitle}`}>
                {COPY["contact.info.title"]}
              </h2>
              <ul className={styles.info}>
                {ROWS.map((row, i) => (
                  <Appear as="li" key={row.label} index={i} className={styles.row}>
                    <ContactIcon name={row.icon} />
                    <div className={styles.rowText}>
                      <span className={`t-ui ${styles.rowLabel}`}>{row.label}</span>
                      <span className="t-body">
                        {row.href ? <a href={row.href}>{row.value}</a> : row.value}
                      </span>
                    </div>
                  </Appear>
                ))}
              </ul>
              <ul className={styles.links}>
                {LINKS.map((link, i) => (
                  <Appear as="li" key={link.to} index={ROWS.length + i} className={styles.linkRow}>
                    <Link to={link.to} className={`t-body ${styles.link}`} data-cursor="button">
                      <ContactIcon name={link.icon} />
                      <span>{link.label}</span>
                      <span aria-hidden="true" className={styles.arrow}>
                        →
                      </span>
                    </Link>
                  </Appear>
                ))}
              </ul>
            </div>
            <ContactBottle level={level} />
          </aside>
        </div>
      </div>
    </div>
  );
}
