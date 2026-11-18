import { lazy, Suspense } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/shell/AppShell";
import { AudioToggle } from "@/components/shell/AudioToggle";
import { RouteFallback } from "@/components/shell/RouteFallback";
import AboutPage from "@/routes/AboutPage";
import ContactPage from "@/routes/ContactPage";
import ContentPage from "@/routes/ContentPage";
import ArticlePage from "@/routes/ArticlePage";
import NotFoundPage from "@/routes/NotFoundPage";

// Home di chunk terpisah (nanti memuat Three.js hanya di rute ini).
const HomePage = lazy(() => import("@/routes/HomePage"));

export function App() {
  return (
    <HashRouter>
      <AppShell audioSlot={<AudioToggle />}>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/konten" element={<ContentPage />} />
            <Route path="/konten/:slug" element={<ArticlePage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </AppShell>
    </HashRouter>
  );
}
