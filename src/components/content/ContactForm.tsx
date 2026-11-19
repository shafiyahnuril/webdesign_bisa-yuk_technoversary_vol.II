import { useEffect, useRef, useState, type FormEvent } from "react";
import { COPY } from "@/content/copy";
import {
  LIMITS,
  validateAll,
  validateField,
  type ContactErrors,
  type ContactField,
  type ContactValues,
} from "./contact-validate";
import styles from "./ContactForm.module.css";

type Status = "idle" | "sending" | "success" | "error";

/** Jeda sebelum "Kirim pesan lain" aktif setelah sukses (dok 05 §6.2). */
export const RESEND_LOCK_MS = 5000;

interface ContactFormProps {
  /** Endpoint Formspree; kosong berarti mode cadangan mailto. Default: VITE_FORMSPREE_ENDPOINT. */
  endpoint?: string;
  /** Alamat tujuan mailto pada mode cadangan. */
  email: string;
  /** Pembuka mailto; diganti pada uji. */
  openMailto?: (url: string) => void;
  /**
   * Dilaporkan setiap kali jumlah kolom valid (0 sampai 3) atau status sukses berubah.
   * Hanya untuk hiasan di halaman induk; tidak memengaruhi validasi maupun pengiriman.
   */
  onProgress?: (progress: ContactProgress) => void;
}

export interface ContactProgress {
  valid: number;
  done: boolean;
}

const EMPTY: ContactValues = { name: "", email: "", message: "" };
const FIELDS: readonly ContactField[] = ["name", "email", "message"];

const defaultEndpoint = (): string => {
  const value = import.meta.env.VITE_FORMSPREE_ENDPOINT as string | undefined;
  return value?.trim() ?? "";
};

const defaultOpenMailto = (url: string) => {
  window.location.href = url;
};

export function ContactForm({
  endpoint = defaultEndpoint(),
  email,
  openMailto = defaultOpenMailto,
  onProgress,
}: ContactFormProps) {
  const fallback = endpoint === "";
  const [values, setValues] = useState<ContactValues>(EMPTY);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [locked, setLocked] = useState(false);
  const sendingRef = useRef(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const [summaryTick, setSummaryTick] = useState(0);

  // Fokus pindah ke ringkasan galat setiap kali kirim gagal validasi.
  useEffect(() => {
    if (summaryTick > 0) summaryRef.current?.focus();
  }, [summaryTick]);

  useEffect(() => {
    if (!locked) return;
    const id = setTimeout(() => setLocked(false), RESEND_LOCK_MS);
    return () => clearTimeout(id);
  }, [locked]);

  const validCount = FIELDS.filter((f) => validateField(f, values[f]) === null).length;
  const done = status === "success";
  useEffect(() => {
    onProgress?.({ valid: validCount, done });
  }, [onProgress, validCount, done]);

  const setField = (field: ContactField, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    // Galat yang sudah tampil dibersihkan begitu isian menjadi valid.
    if (errors[field] && validateField(field, value) === null) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const onBlur = (field: ContactField) => {
    const error = validateField(field, values[field]);
    setErrors((prev) => ({ ...prev, [field]: error ?? undefined }));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sendingRef.current) return;
    const found = validateAll(values);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      setSummaryTick((n) => n + 1);
      return;
    }
    // Kolom jebakan: bot mengisinya; tolak tanpa mengirim dan tanpa memberi petunjuk.
    const trap = new FormData(event.currentTarget).get("_gotcha");
    if (typeof trap === "string" && trap !== "") {
      setStatus("success");
      setLocked(true);
      return;
    }

    const clean: ContactValues = {
      name: values.name.trim(),
      email: values.email.trim(),
      message: values.message.trim(),
    };

    if (fallback) {
      const subject = encodeURIComponent(COPY["contact.mailto.subject"]);
      const body = encodeURIComponent(`${clean.message}\n\n${clean.name} <${clean.email}>`);
      openMailto(`mailto:${email}?subject=${subject}&body=${body}`);
      setStatus("success");
      setLocked(true);
      return;
    }

    sendingRef.current = true;
    setStatus("sending");
    try {
      const body = new FormData();
      body.set("name", clean.name);
      body.set("email", clean.email);
      body.set("message", clean.message);
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { Accept: "application/json" },
        body,
      });
      if (!response.ok) throw new Error(String(response.status));
      setStatus("success");
      setLocked(true);
    } catch {
      // Data isian tetap ada agar pengguna bisa mencoba lagi.
      setStatus("error");
    } finally {
      sendingRef.current = false;
    }
  };

  const reset = () => {
    setValues(EMPTY);
    setErrors({});
    setStatus("idle");
  };

  if (status === "success") {
    return (
      <div className={styles.done}>
        <svg className={styles.check} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
          <circle cx="24" cy="24" r="21" className={styles.checkRing} />
          <path d="M14.5 25l6.5 6.5L33.5 17" className={styles.checkMark} />
        </svg>
        <p role="status" className={`t-body-lg ${styles.doneText}`}>
          {fallback ? COPY["contact.fallback.opened"] : COPY["contact.success"]}
        </p>
        <button
          type="button"
          className={styles.button}
          onClick={reset}
          disabled={locked}
          data-cursor="button"
        >
          <span className={styles.buttonLabel}>{COPY["contact.again"]}</span>
        </button>
      </div>
    );
  }

  const sending = status === "sending";
  const errorEntries = FIELDS.filter((f) => errors[f]);

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      {errorEntries.length > 0 ? (
        <div ref={summaryRef} tabIndex={-1} role="alert" className={styles.summary}>
          <p className="t-ui">{COPY["contact.error.summary"]}</p>
          <ul>
            {errorEntries.map((f) => (
              <li key={f}>{errors[f]}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {status === "error" ? (
        <p role="alert" className={`t-body ${styles.banner}`}>
          {COPY["contact.error.generic"]}
        </p>
      ) : null}

      <div className={styles.field}>
        <label htmlFor="contact-name" className="t-ui">
          {COPY["contact.field.name"]}
        </label>
        <div className={styles.control}>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            maxLength={LIMITS.nameMax + 20}
            value={values.name}
            onChange={(e) => setField("name", e.target.value)}
            onBlur={() => onBlur("name")}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? "contact-name-error" : undefined}
            className={styles.input}
            data-cursor="text"
          />
          <span className={styles.line} aria-hidden="true" />
        </div>
        {errors.name ? (
          <p id="contact-name-error" className={`t-ui ${styles.error}`}>
            {errors.name}
          </p>
        ) : null}
      </div>

      <div className={styles.field}>
        <label htmlFor="contact-email" className="t-ui">
          {COPY["contact.field.email"]}
        </label>
        <div className={styles.control}>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => setField("email", e.target.value)}
            onBlur={() => onBlur("email")}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
            className={styles.input}
            data-cursor="text"
          />
          <span className={styles.line} aria-hidden="true" />
        </div>
        {errors.email ? (
          <p id="contact-email-error" className={`t-ui ${styles.error}`}>
            {errors.email}
          </p>
        ) : null}
      </div>

      <div className={styles.field}>
        <label htmlFor="contact-message" className="t-ui">
          {COPY["contact.field.message"]}
        </label>
        <div className={styles.control}>
          <textarea
            id="contact-message"
            name="message"
            rows={6}
            maxLength={LIMITS.messageMax + 100}
            value={values.message}
            onChange={(e) => setField("message", e.target.value)}
            onBlur={() => onBlur("message")}
            aria-invalid={errors.message ? true : undefined}
            aria-describedby={
              errors.message
                ? "contact-message-count contact-message-error"
                : "contact-message-count"
            }
            className={`${styles.input} ${styles.textarea}`}
            data-cursor="text"
          />
          <span className={styles.line} aria-hidden="true" />
          <p id="contact-message-count" className={`t-ui-sm ${styles.counter}`}>
            {COPY["contact.counter"].replace("{N}", String(values.message.length))}
          </p>
        </div>
        {errors.message ? (
          <p id="contact-message-error" className={`t-ui ${styles.error}`}>
            {errors.message}
          </p>
        ) : null}
      </div>

      {/* Kolom jebakan anti-spam (Formspree `_gotcha`): tersembunyi dari pengguna dan pembaca layar. */}
      <div className={styles.trap} aria-hidden="true">
        <label htmlFor="contact-gotcha">{COPY["contact.trap"]}</label>
        <input id="contact-gotcha" name="_gotcha" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <p className={`t-ui-sm ${styles.privacy}`}>{COPY["contact.privacy"]}</p>
      {fallback ? (
        <p className={`t-ui-sm ${styles.privacy}`}>
          <strong>{COPY["contact.fallback"]}.</strong> {COPY["contact.fallback.note"]}
        </p>
      ) : null}

      <div className={styles.actions}>
        <button
          type="submit"
          className={styles.button}
          disabled={sending}
          aria-busy={sending || undefined}
          data-cursor="button"
        >
          <span className={styles.buttonLabel}>
            {sending ? (
              <span role="status">
                <span className="sr-only">{COPY["contact.sending"]}</span>
                <span className={styles.dots} aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
              </span>
            ) : (
              COPY["contact.submit"]
            )}
          </span>
        </button>
      </div>
    </form>
  );
}
