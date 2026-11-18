import { useEffect, useId, useRef, useState } from "react";
import styles from "./TempDiagram.module.css";

const title = "Dua skenario suhu dalam cerita Re:bottle";
const description = "Babak I naik dari +1,2°C ke +4,0°C. Babak II tetap di +1,5°C.";
const ticks = [0, 1.5, 2, 4, 4.5];
const position = (degrees: number) => 28 + (degrees / 4.5) * 544;
const temperature = (degrees: number) => degrees.toFixed(1).replace(".", ",") + "°C";

export function TempDiagram() {
  const id = useId();
  const figure = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = figure.current;
    if (!element || !("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      setVisible(true);
      observer.disconnect();
    }, { threshold: .2 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <figure className={styles.figure} ref={figure} data-visible={visible}>
      <div className={styles.legend} aria-hidden="true">
        <span><i className={styles.neg} />Babak I · skenario abai</span>
        <span><i className={styles.pos} />Babak II · skenario peduli</span>
      </div>
      <svg viewBox="0 0 600 168" role="img" aria-labelledby={id + "-title " + id + "-desc"}>
        <title id={id + "-title"}>{title}</title>
        <desc id={id + "-desc"}>{description}</desc>
        {ticks.map((tick) => (
          <g key={tick} className={tick === 1.5 ? styles.threshold : styles.tick}>
            <line x1={position(tick)} x2={position(tick)} y1="17" y2="126" />
            <text x={position(tick)} y="151" textAnchor="middle">{temperature(tick)}</text>
          </g>
        ))}
        <path className={styles.axis} d="M28 126h544" />
        <rect className={`${styles.ribbon} ${styles.neg}`} x={position(1.2)} y="38"
          width={position(4) - position(1.2)} height="24" rx="12" />
        <circle className={styles.pos} cx={position(1.5)} cy="95" r="10" />
        <circle className={styles.thresholdRing} cx={position(1.5)} cy="95" r="15" />
      </svg>
      <figcaption>Ilustrasi alur cerita, bukan prediksi.</figcaption>
      <table className={styles.srOnly}>
        <caption>Suhu di atas tingkat praindustri dalam ilustrasi cerita</caption>
        <thead><tr><th scope="col">Skenario</th><th scope="col">Awal</th><th scope="col">Akhir</th></tr></thead>
        <tbody>
          <tr><th scope="row">Babak I · skenario abai</th><td>+1,2°C</td><td>+4,0°C</td></tr>
          <tr><th scope="row">Babak II · skenario peduli</th><td>+1,5°C</td><td>+1,5°C</td></tr>
        </tbody>
      </table>
    </figure>
  );
}
