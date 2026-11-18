// Mengingat filter Galeri Artikel terakhir agar tautan "← Galeri Artikel" di detail artikel
// kembali ke tampilan yang sama (dok 05 §5.2). Detail artikel tidak membawa query string
// di URL-nya, jadi nilainya disimpan di sessionStorage (dibungkus try/catch).
const KEY = "rebottle:gallery-search";

export function rememberGallerySearch(search: string): void {
  try {
    if (search) sessionStorage.setItem(KEY, search);
    else sessionStorage.removeItem(KEY);
  } catch {
    /* penyimpanan diblokir: tautan kembali ke galeri tanpa filter */
  }
}

/** Query string yang valid ("?jenis=…&level=…") atau string kosong. */
export function readGallerySearch(): string {
  try {
    const value = sessionStorage.getItem(KEY) ?? "";
    return /^\?[\w=&%-]*$/.test(value) ? value : "";
  } catch {
    return "";
  }
}

export function galleryHref(): string {
  return `/konten${readGallerySearch()}`;
}
