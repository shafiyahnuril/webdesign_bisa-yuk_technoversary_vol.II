import { backdrop, writePoster, writeSocialCard } from "./raster-assets.mjs";

const source = process.argv[2];
if (!source) throw new Error("Argumen pertama harus berupa pet-isolated.png hasil render Blender.");
const desktop = await backdrop(source, 1600, 900, .50, .50, 490);
const mobile = await backdrop(source, 800, 1200, .50, .38, 521);
const social = await backdrop(source, 610, 630, .50, .49, 457);
await writePoster(desktop, "hero-poster.webp");
await writePoster(mobile, "hero-poster-m.webp");
await writeSocialCard(social);
