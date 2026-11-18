import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import sharp from "sharp";

export const ROOT = resolve(import.meta.dirname, "..");
export const HERO_BACKGROUND = "#0B2B80";

async function save(path, buffer) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, buffer);
}

export async function writePoster(source, name) {
  const path = resolve(ROOT, "public/img", name);
  for (const quality of [80, 76, 70, 64, 58, 50, 42, 33, 25]) {
    const webp = await sharp(source).flatten({ background: HERO_BACKGROUND }).webp({ quality }).toBuffer();
    if (webp.length <= 60_000) {
      await save(path, webp);
      return;
    }
  }
  throw new Error(`${name} melebihi 60 KB. Periksa noise dan detail pada tangkapan.`);
}

async function svgAt(path, width) {
  return sharp(await readFile(resolve(ROOT, path))).resize({ width }).png().toBuffer();
}

export async function writeSocialCard(bottleLayer) {
  const wordmark = await svgAt("public/img/wordmark.svg", 582);
  const tagline = await svgAt("scripts/og-tagline.svg", 340);
  const stage = sharp({
    create: { width: 1200, height: 630, channels: 3, background: HERO_BACKGROUND },
  });
  const original = await stage.composite([
    { input: bottleLayer, left: 590, top: 0 },
    { input: wordmark, left: 62, top: 218 },
    { input: tagline, left: 85, top: 358 },
  ]).removeAlpha().png().toBuffer();
  for (const colours of [256, 192, 128, 96, 64]) {
    const png = await sharp(original).png({ palette: true, colours, dither: .23 }).toBuffer();
    if (png.length <= 120_000) {
      await save(resolve(ROOT, "public/og-image.png"), png);
      return;
    }
  }
  throw new Error("og-image.png melebihi 120 KB.");
}

export async function backdrop(source, width, height, centerX, centerY, bottleHeight) {
  const bottle = await sharp(source).trim({ background: "#00000000", threshold: 7 })
    .resize({ height: bottleHeight }).png().toBuffer();
  const { width: objectWidth } = await sharp(bottle).metadata();
  const cx = width * centerX;
  const cy = height * centerY;
  const shadow = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
    <defs><radialGradient id="shade"><stop stop-color="#05080F" stop-opacity=".34"/>
    <stop offset="1" stop-color="#05080F" stop-opacity="0"/></radialGradient></defs>
    <ellipse cx="${cx}" cy="${cy + bottleHeight / 2 + 7}" rx="${objectWidth * .75}"
      ry="${bottleHeight * .034}" fill="url(#shade)"/>
  </svg>`);
  return sharp({ create: { width, height, channels: 3, background: HERO_BACKGROUND } })
    .composite([ { input: shadow }, { input: bottle, left: Math.round(cx - objectWidth / 2),
      top: Math.round(cy - bottleHeight / 2) } ]).png().toBuffer();
}
