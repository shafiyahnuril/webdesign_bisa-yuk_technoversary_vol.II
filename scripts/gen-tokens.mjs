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
add("hero-bg", t.COLORS.heroBg);
for (const [k, v] of Object.entries(t.SPACE)) add(`s-${k}`, v);
for (const [k, v] of Object.entries(t.RADIUS)) add(`r-${k}`, v);
for (const [k, v] of Object.entries(t.Z)) add(`z-${kebab(k)}`, v);
for (const [k, v] of Object.entries(t.BREAKPOINTS)) add(`bp-${k}`, `${v}px`);
for (const [k, v] of Object.entries(t.EASE)) add(`ease-${kebab(k)}`, v);
for (const [k, v] of Object.entries(t.DUR)) add(`dur-${kebab(k)}`, `${v}s`);

// hero-bg sudah ditulis dari COLORS.heroBg; buang duplikat bila ada
const seen = new Set();
const unique = lines.filter((l) => {
  const key = l.split(":")[0];
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});

const css = `/* Dihasilkan otomatis oleh scripts/gen-tokens.mjs dari src/lib/tokens.ts. Jangan diedit tangan. */\n:root {\n${unique.join("\n")}\n}\n`;
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, css);
console.log(`gen-tokens: ${unique.length} variabel -> ${out.replace(root, ".")}`);
