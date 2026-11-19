import styles from "./ContactIcon.module.css";

export type ContactIconName = "mail" | "account" | "theme" | "event" | "about" | "articles";

// Ikon garis 24x24, satu goresan tipis; warna dari token lewat CSS (currentColor).
const PATHS: Record<ContactIconName, string[]> = {
  mail: ["M3.5 6.5h17v11h-17z", "M3.5 7l8.5 6.5L20.5 7"],
  account: [
    "M12 12.5a4.25 4.25 0 1 0 0-8.5 4.25 4.25 0 0 0 0 8.5z",
    "M4.5 20c.9-3.6 3.9-5.5 7.5-5.5s6.6 1.9 7.5 5.5",
  ],
  theme: ["M5 19c0-8 5-13 14-14 0 9-5 14-13 14", "M5 19c2-4 5-7 9-9"],
  event: ["M5 20.5V4", "M5 5h13l-2.5 3.5L18 12H5"],
  about: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z", "M12 11v5.5", "M12 7.75v.01"],
  articles: [
    "M4 4.5h6.5v6.5H4z",
    "M13.5 4.5H20v6.5h-6.5z",
    "M4 14h6.5v6.5H4z",
    "M13.5 14H20v6.5h-6.5z",
  ],
};

/** Ikon dekoratif (aria-hidden). Makna disampaikan oleh teks di sebelahnya. */
export function ContactIcon({ name }: { name: ContactIconName }) {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {PATHS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
