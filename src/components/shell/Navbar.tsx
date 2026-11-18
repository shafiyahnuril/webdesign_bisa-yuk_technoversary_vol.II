import { NavLink } from "react-router-dom";
import { COPY } from "@/content/copy";
import styles from "./Navbar.module.css";

interface NavbarProps {
  /** `static` = menempel di halaman non-Home. Varian Home (mengempis) dibuat di T1.7. */
  variant?: "static";
}

const LINKS = [
  { to: "/", label: COPY["nav.home"] },
  { to: "/about", label: COPY["nav.about"] },
  { to: "/konten", label: COPY["nav.content"] },
  { to: "/contact", label: COPY["nav.contact"] },
] as const;

export function Navbar({ variant = "static" }: NavbarProps) {
  return (
    <header className={styles.navbar} data-variant={variant}>
      <NavLink to="/" className={styles.brand} aria-label="Re:bottle, ke halaman utama">
        <span className={styles.re}>Re:</span>bottle
      </NavLink>
      <nav aria-label="Utama">
        <ul className={styles.links}>
          {LINKS.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  isActive ? `${styles.link} ${styles.active}` : styles.link
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
