/* global window */
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "@playwright/test";

const base = process.argv[2] || "http://localhost:5173/";
const browser = await chromium.launch();
const report = { date: new Date().toISOString(), samples: [], loops: [] };
try {
  for (const setup of [
    { name: "desktop-high", q: "high", width: 1600, height: 900 },
    { name: "portrait-low", q: "low", width: 390, height: 844 },
  ]) {
    const page = await browser.newPage({
      viewport: { width: setup.width, height: setup.height },
      deviceScaleFactor: 1,
    });
    const url = new URL(base);
    url.hash = "/";
    url.searchParams.set("debug", "1");
    url.searchParams.set("q", setup.q);
    url.searchParams.set("noaudio", "");
    await page.goto(url.href);
    await page.waitForFunction(() => Boolean(window.__REBOTTLE_RUNTIME__), { timeout: 20000 });
    const data = await page.evaluate(async () => {
      const { engine, stage } = window.__REBOTTLE_RUNTIME__;
      const timeline = await import("/src/engine/timeline.ts");
      const gl = stage.ctx.renderer.getContext();
      const extension = gl.getExtension("WEBGL_debug_renderer_info");
      const gpu = extension
        ? gl.getParameter(extension.UNMASKED_RENDERER_WEBGL)
        : gl.getParameter(gl.RENDERER);
      const samples = [];
      for (const id of timeline.ORDER) {
        const p = timeline.STARTS[id] + (0.4 * timeline.LENGTHS_VH[id]) / timeline.TOTAL_VH;
        engine.preview(p);
        const sample = await new Promise((resolveSample) => {
          let warmup = 15;
          const deltas = [];
          let finished = false;
          const finish = () => {
            if (finished) return;
            finished = true;
            stop();
            window.clearTimeout(timer);
            const sorted = [...deltas].sort((a, b) => a - b);
            const mean = deltas.reduce((a, b) => a + b, 0) / deltas.length;
            const info = stage.ctx.renderer.info;
            resolveSample({
              id,
              p,
              tier: stage.ctx.quality,
              frames: deltas.length,
              fps: deltas.length ? 1 / mean : null,
              fpsP1: deltas.length ? 1 / sorted[Math.floor((sorted.length - 1) * 0.99)] : null,
              calls: info.render.calls,
              triangles: info.render.triangles,
              geometries: info.memory.geometries,
              textures: info.memory.textures,
            });
          };
          const stop = engine.onFrame((_shown, dt) => {
            if (dt <= 0) return;
            if (warmup-- > 0) return;
            deltas.push(dt);
            if (deltas.length >= 120) finish();
          }, 30);
          const timer = window.setTimeout(finish, 8000);
        });
        samples.push(sample);
      }
      const loops = [];
      for (let n = 0; n < 5; n++) {
        for (const id of timeline.ORDER)
          engine.preview(timeline.STARTS[id] + (0.4 * timeline.LENGTHS_VH[id]) / timeline.TOTAL_VH);
        engine.preview(0);
        loops.push({ ...stage.ctx.renderer.info.memory });
      }
      return { gpu, userAgent: navigator.userAgent, samples, loops };
    });
    report.samples.push({ ...setup, ...data });
    process.stdout.write(`${setup.name}: ${data.samples.length} scene selesai\n`);
    await page.close();
  }
  const output = resolve("docs/bukti/perf-home.json");
  await mkdir(resolve("docs/bukti"), { recursive: true });
  await writeFile(output, JSON.stringify(report, null, 2) + "\n");
  process.stdout.write(`${output}\n`);
} finally {
  await browser.close();
}
