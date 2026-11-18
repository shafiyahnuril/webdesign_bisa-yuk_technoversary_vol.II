import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

/** Wilayah aria-live: mengumumkan judul halaman setiap rute berganti. */
export function RouteAnnouncer() {
  const { pathname } = useLocation();
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Tunda sedikit agar Seo sudah memperbarui document.title.
    const id = window.setTimeout(() => setMessage(document.title), 100);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return (
    <div aria-live="polite" aria-atomic="true" className="sr-only">
      {message}
    </div>
  );
}
