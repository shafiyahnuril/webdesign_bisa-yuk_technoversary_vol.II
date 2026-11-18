import { useRef } from "react";
import { Link } from "react-router-dom";
import { ContactForm } from "@/components/content/ContactForm";
import { usePageFocus } from "@/components/ui/usePageFocus";
import { usePageTheme } from "@/components/ui/usePageTheme";
import { COPY } from "@/content/copy";
import { SITE } from "@/content/site";
import styles from "./ContactPage.module.css";

export default function ContactPage() {
  usePageTheme("contact");
  const headingRef = useRef<HTMLHeadingElement>(null);
  usePageFocus(headingRef);

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <p className={`t-ui ${styles.brand}`}>
          <span className={styles.re}>Re:</span>bottle
        </p>
        <h1 ref={headingRef} tabIndex={-1} className={`t-chapter ${styles.headline}`}>
          {COPY["contact.headline"]}
        </h1>
        <p className={`t-body-lg ${styles.intro}`}>{COPY["contact.intro"]}</p>
      </header>

      <div className={styles.columns}>
        <section className={styles.formCol} aria-labelledby="contact-form-title">
          <h2 id="contact-form-title" className={`t-h2 ${styles.colTitle}`}>
            {COPY["contact.form.title"]}
          </h2>
          <ContactForm email={SITE.email} />
        </section>

        <aside className={styles.infoCol} aria-labelledby="contact-info-title">
          <h2 id="contact-info-title" className={`t-h2 ${styles.colTitle}`}>
            {COPY["contact.info.title"]}
          </h2>
          <dl className={styles.info}>
            <div>
              <dt className="t-ui">{COPY["contact.info.email"]}</dt>
              <dd className="t-body">
                <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
              </dd>
            </div>
            <div>
              <dt className="t-ui">{COPY["contact.info.account"]}</dt>
              <dd className="t-body">{SITE.account}</dd>
            </div>
            <div>
              <dt className="t-ui">{COPY["contact.info.subtheme"]}</dt>
              <dd className="t-body">{SITE.subtheme}</dd>
            </div>
            <div>
              <dt className="t-ui">{COPY["contact.info.competition"]}</dt>
              <dd className="t-body">{SITE.competition}</dd>
            </div>
          </dl>
          <p className={`t-body ${styles.links}`}>
            <Link to="/about">{COPY["contact.info.about"]} →</Link>
            <Link to="/konten">{COPY["contact.info.content"]} →</Link>
          </p>
        </aside>
      </div>
    </div>
  );
}
