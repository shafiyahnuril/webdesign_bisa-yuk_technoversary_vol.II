/* global document, window */
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "@playwright/test";
import sharp from "sharp";
import { HERO_BACKGROUND, ROOT, writePoster, writeSocialCard } from "./raster-assets.mjs";

const baseUrl = process.argv[2] ?? "http://localhost:5173/";
const browser = await chromium.launch({
  executablePath: process.env.REBOTTLE_CHROMIUM_PATH || undefined,
});

async function frame(page, progress, mode) {
  const url = new URL(baseUrl);
  url.hash = "/";
  url.searchParams.set("q", "high");
  url.searchParams.set("freeze", String(progress));
  url.searchParams.set("noaudio", "");
  url.searchParams.set("capture", mode);

  await page.goto(url.toString(), { waitUntil: "domcontentloaded" });
  await page.locator("canvas[data-capture-stage]").waitFor({ state: "visible" });
  await page.waitForFunction(
    (target) => {
      const root = document.documentElement;
      return (
        root.dataset.captureReady === "true" &&
        root.dataset.captureProgress !== undefined &&
        Math.abs(Number(root.dataset.captureProgress) - target) <= 0.00001
      );
    },
    progress,
    { timeout: 15_000 },
  );
  await page.evaluate(() => document.fonts.ready.then(() => {}));
}

try {
  const page = await browser.newPage({
    viewport: { width: 1600, height: 900 },
    reducedMotion: "no-preference",
  });
  await frame(page, 0, "poster");
  const segments = await page.evaluate(() => window.__REBOTTLE_CAPTURE_SEGMENTS__);
  const order = ["b1", "b2", "b3", "b4", "b5", "b6", "punch", "b7", "b8", "b9", "b10"];
  if (
    !Array.isArray(segments) ||
    segments.length !== order.length ||
    segments.some(
      (segment, i) =>
        segment.id !== order[i] || !Number.isFinite(segment.length) || segment.length <= 0,
    )
  )
    throw new Error("Scene harus memasok urutan serta panjang semua 11 segmen untuk tangkapan.");

  const desktop = await page.screenshot({ animations: "disabled" });
  await page.setViewportSize({ width: 800, height: 1200 });
  await frame(page, 0, "poster");
  const mobile = await page.screenshot({ animations: "disabled" });
  await page.setViewportSize({ width: 1600, height: 900 });

  const collection = resolve(ROOT, "docs/shots");
  await mkdir(collection, { recursive: true });
  const total = segments.reduce((sum, { length }) => sum + length, 0);
  let start = 0;
  for (const { id, length } of segments) {
    await frame(page, (start + 0.4 * length) / total, "shot");
    await page.screenshot({ path: resolve(collection, `${id}.png`), animations: "disabled" });
    start += length;
  }

  const strip = await sharp(desktop)
    .extract({ left: 432, top: 45, width: 736, height: 810 })
    .resize(610, 630, { fit: "contain", background: HERO_BACKGROUND })
    .png()
    .toBuffer();
  await writePoster(desktop, "hero-poster.webp");
  await writePoster(mobile, "hero-poster-m.webp");
  await writeSocialCard(strip);
} finally {
  await browser.close();
}
