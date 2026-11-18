/** Pembacaan variabel lingkungan Vite; nilai kosong dianggap tidak ada. */
export const env = {
  formspreeEndpoint: import.meta.env.VITE_FORMSPREE_ENDPOINT || null,
  siteUrl: import.meta.env.VITE_SITE_URL || null,
} as const;
