import { useEffect } from "react";

/** Mengatur judul tab dan meta description halaman. */
export function useDocumentMeta(title: string, description?: string): void {
  useEffect(() => {
    document.title = title;
    if (description === undefined) return;
    let tag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!tag) {
      tag = document.createElement("meta");
      tag.name = "description";
      document.head.appendChild(tag);
    }
    tag.content = description;
  }, [title, description]);
}
