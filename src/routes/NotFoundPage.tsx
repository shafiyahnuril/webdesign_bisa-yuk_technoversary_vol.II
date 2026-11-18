import { Link } from "react-router-dom";
import { COPY } from "@/content/copy";
import styles from "./PageStub.module.css";

export default function NotFoundPage() {
  return (
    <section className={styles.page}>
      <h1 className="t-chapter">{COPY["404.title"]}</h1>
      <p className="t-body">{COPY["404.body"]}</p>
      <p>
        <Link to="/">{COPY["404.cta"]}</Link>
      </p>
    </section>
  );
}
