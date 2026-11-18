import { COPY } from "@/content/copy";

export interface ContactValues {
  name: string;
  email: string;
  message: string;
}
export type ContactField = keyof ContactValues;
export type ContactErrors = Partial<Record<ContactField, string>>;

export const LIMITS = {
  nameMin: 2,
  nameMax: 80,
  messageMin: 10,
  messageMax: 1000,
} as const;

// Regex longgar (dok 05 §6.2): ada teks, "@", domain bertitik. Validasi sebenarnya di penerima.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Mengembalikan pesan galat untuk satu kolom, atau null bila valid. Spasi tepi dipangkas. */
export function validateField(field: ContactField, raw: string): string | null {
  const value = raw.trim();
  switch (field) {
    case "name":
      if (value.length < LIMITS.nameMin) return COPY["contact.error.name"];
      if (value.length > LIMITS.nameMax) return COPY["contact.error.name.max"];
      return null;
    case "email":
      return EMAIL.test(value) ? null : COPY["contact.error.email"];
    case "message":
      if (value.length < LIMITS.messageMin) return COPY["contact.error.message"];
      if (value.length > LIMITS.messageMax) return COPY["contact.error.message.max"];
      return null;
  }
}

export function validateAll(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {};
  for (const field of ["name", "email", "message"] as const) {
    const error = validateField(field, values[field]);
    if (error) errors[field] = error;
  }
  return errors;
}
