import { Link } from "react-router-dom";
import { PageHero } from "@/components/ui/PageHero";
import { usePageTheme } from "@/components/ui/usePageTheme";
import { COPY } from "@/content/copy";
import styles from "./NotFoundPage.module.css";

export default function NotFoundPage() {
  usePageTheme("notfound");
  return (
    <section className={styles.page}>
      <div className={styles.text}>
        <PageHero title={COPY["404.title"]} lede={COPY["404.body"]}>
          <p>
            <Link to="/" className={`t-ui ${styles.cta}`}>
              {COPY["404.cta"]}
            </Link>
          </p>
        </PageHero>
      </div>
      {/* Aset S-404 dari Pihak A; dekoratif karena judul sudah menyampaikan maknanya. */}
      <img
        className={styles.bottle}
        src={`${import.meta.env.BASE_URL}img/s-404.svg`}
        alt=""
        width={400}
        height={400}
      />
    </section>
  );
}
