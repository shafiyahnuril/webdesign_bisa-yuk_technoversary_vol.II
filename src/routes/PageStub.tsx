import { COPY } from "@/content/copy";
import styles from "./PageStub.module.css";

/** Kerangka halaman sementara: satu <h1> dan satu paragraf "dalam pengerjaan". */
export function PageStub({ title }: { title: string }) {
  return (
    <section className={styles.page}>
      <h1 className="t-chapter">{title}</h1>
      <p className="t-body">{COPY["page.wip"]}</p>
    </section>
  );
}
