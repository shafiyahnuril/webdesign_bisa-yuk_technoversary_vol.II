/// <reference types="vitest/config" />
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig(({ mode }) => ({
  // base relatif: aman di GitHub Pages (sub-path) maupun dibuka lokal
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
  plugins: [react(), ...(mode === "analyze" ? [visualizer({ filename: "dist/stats.html" })] : [])],
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
  },
}));
