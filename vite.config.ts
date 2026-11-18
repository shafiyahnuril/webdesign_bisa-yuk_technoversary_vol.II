/// <reference types="vitest/config" />
import { fileURLToPath, URL } from "node:url";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

// Nama font kritis (docs/02 bagian 2.2.3): hanya Bricolage dan Instrument di-preload.
// Nama berkas diambil dari bundel saat build sehingga hash tidak perlu ditulis manual.
const PRELOAD_FONTS = [
  "bricolage-grotesque-latin-wdth-normal",
  "instrument-sans-latin-wdth-normal",
];

function preloadFonts(): Plugin {
  return {
    name: "rebottle:preload-fonts",
    transformIndexHtml: {
      order: "post",
      handler(html, ctx) {
        const bundle = ctx.bundle;
        if (!bundle) return html;
        const files = Object.keys(bundle)
          .filter(
            (id) =>
              id.endsWith(".woff2") &&
              PRELOAD_FONTS.some((name) => id.includes(name)),
          )
          .sort();
        if (files.length === 0) return html;
        const links = files
          .map(
            (id) =>
              `    <link rel="preload" as="font" type="font/woff2" crossorigin href="./${id}" />`,
          )
          .join("\n");
        return html.replace("</head>", `${links}\n  </head>`);
      },
    },
  };
}

export default defineConfig(({ mode }) => ({
  // base relatif: aman di sub-path mana pun maupun dibuka lokal
  base: "./",
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  build: {
    target: "es2020",
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(rawId: string) {
          const id = rawId.split("\\").join("/");
          if (!id.includes("/node_modules/")) return undefined;
          if (id.includes("/node_modules/three/")) return "three";
          if (id.includes("/node_modules/gsap/")) return "gsap";
          const vendor = ["react", "react-dom", "react-router", "react-router-dom", "scheduler"];
          if (vendor.some((pkg) => id.includes(`/node_modules/${pkg}/`))) return "vendor";
          return undefined;
        },
      },
    },
  },
  plugins: [react(), preloadFonts(), ...(mode === "analyze" ? [visualizer({ filename: "dist/stats.html" })] : [])],
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
  },
}));
