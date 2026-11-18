// Menghasilkan src/styles/tokens.generated.css dari src/lib/tokens.ts.
// Cara: tokens.ts ditranspilasi dengan API `typescript` (sudah jadi devDependency)
// lalu diimpor lewat data URL. Tidak butuh dependensi tambahan dan stabil di Node >= 20.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const src = resolve(root, "src/lib/tokens.ts");
const out = resolve(root, "src/styles/tokens.generated.css");

const js = ts.transpileModule(readFileSync(src, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
}).outputText;
const t = await import(`data:text/javascript;base64,${Buffer.from(js).toString("base64")}`);

const kebab = (s) => s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
const lines = [];
const add = (name, value) => lines.push(`  --${name}: ${value};`);

for (const [id, c] of Object.entries(t.PALETTE)) {
  add(`${id}-bg`, c.bg);
  add(`${id}-accent`, c.accent);
  add(`${id}-ink`, c.ink);
}
for (const [id, v] of Object.entries(t.TEMP)) add(`${id}-temp`, v);
for (const [k, v] of Object.entries(t.COLORS)) add(kebab(k), v);
for (const [k, v] of Object.entries(t.SPACE)) add(`s-${k}`, v);
for (const [k, v] of Object.entries(t.RADIUS)) add(`r-${k}`, v);
for (const [k, v] of Object.entries(t.Z)) add(`z-${kebab(k)}`, v);
for (const [k, v] of Object.entries(t.BREAKPOINTS)) add(`bp-${k}`, `${v}px`);
for (const [k, v] of Object.entries(t.EASE)) add(`ease-${kebab(k)}`, v);
for (const [k, v] of Object.entries(t.SIZE)) add(`size-${kebab(k)}`, v);
for (const [k, v] of Object.entries(t.MENU)) add(`menu-${kebab(k)}`, v);
for (const [k, v] of Object.entries(t.RING)) add(`ring-${kebab(k)}`, v);
for (const [k, v] of Object.entries(t.MARKER)) add(`marker-${kebab(k)}`, v);
for (const [k, v] of Object.entries(t.RE)) add(`re-${kebab(k)}`, v);
for (const [k, v] of Object.entries(t.LINE)) add(`line-${kebab(k)}`, v);
for (const [k, v] of Object.entries(t.READ)) add(`read-${kebab(k)}`, v);

// Token durasi: dipakai di transisi/animasi DAN direset oleh prefers-reduced-motion.
const durationVars = [];
for (const [k, v] of Object.entries(t.DUR)) {
  const name = `dur-${kebab(k)}`;
  add(name, `${v}s`);
  durationVars.push(name);
}
for (const [k, v] of Object.entries(t.STAGGER)) {
  const name = `stagger-${kebab(k)}`;
  add(name, `${v}s`);
  durationVars.push(name);
}

// hero-bg sudah ditulis dari COLORS.heroBg; buang duplikat bila ada
const seen = new Set();
const unique = lines.filter((l) => {
  const key = l.split(":")[0];
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});

const dupes = lines.length - unique.length;
if (dupes > 0) throw new Error(`gen-tokens: ${dupes} nama variabel duplikat`);

// Seluruh durasi ikut nol saat pengguna meminta gerak berkurang.
const reduced = durationVars.map((name) => `    --${name}: 0s;`).join("\n");

const css = `/* Dihasilkan otomatis oleh scripts/gen-tokens.mjs dari src/lib/tokens.ts. Jangan diedit tangan. */
:root {
${unique.join("\n")}
}

@media (prefers-reduced-motion: reduce) {
  :root {
${reduced}
  }
}
`;
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, css);
console.log(`gen-tokens: ${unique.length} variabel, ${durationVars.length} durasi -> ${out.replace(root, ".")}`);
