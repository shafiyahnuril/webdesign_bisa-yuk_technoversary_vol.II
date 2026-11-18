import { matchPath, useLocation } from "react-router-dom";
import { ARTICLES } from "@/content/articles";
import { COPY } from "@/content/copy";
import { SITE } from "@/content/site";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

function titleFor(pathname: string): string {
  if (pathname === "/") return COPY["page.home.title"];
  if (pathname === "/about") return `${COPY["page.about.title"]} | ${SITE.name}`;
  if (pathname === "/konten") return `${COPY["page.content.title"]} | ${SITE.name}`;
  if (pathname === "/contact") return `${COPY["page.contact.title"]} | ${SITE.name}`;
  const article = matchPath("/konten/:slug", pathname);
  if (article) {
    const found = ARTICLES.find((a) => a.slug === article.params.slug);
    if (found) return `${found.title} | ${SITE.name}`;
  }
  return `${COPY["page.notfound.title"]} | ${SITE.name}`;
}

function descriptionFor(pathname: string): string {
  if (pathname === "/about") return COPY["seo.about.description"];
  if (pathname === "/konten") return COPY["seo.content.description"];
  if (pathname === "/contact") return COPY["seo.contact.description"];
  if (pathname === "/") return COPY["site.description"];
  // Detail artikel: ArticlePage menimpa dengan lede artikel (efeknya jalan setelah Seo).
  const article = matchPath("/konten/:slug", pathname);
  if (article && ARTICLES.some((a) => a.slug === article.params.slug)) {
    return COPY["site.description"];
  }
  return COPY["seo.notfound.description"];
}

/** Mengatur judul tab dan meta description per halaman. */
export function Seo() {
  const { pathname } = useLocation();
  useDocumentMeta(titleFor(pathname), descriptionFor(pathname));
  return null;
}
