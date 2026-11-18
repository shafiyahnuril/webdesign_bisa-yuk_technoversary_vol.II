# 06 · ARSITEKTUR TEKNIS

> Stack (Vite + React + TypeScript, React Router `HashRouter`, GSAP, Three.js murni, Web Audio, CSS Modules + CSS variable, GitHub Pages) = **[DISEPAKATI]**.
> Struktur folder, antarmuka modul, konfigurasi build/deploy, alat debug, strategi uji = **[USULAN]**.
> Prinsip dasar: **mesin cerita imperatif di luar React** (tidak ada re-render per frame).

---

## 1. Dependensi dan skrip

### 1.1 Paket (versi: pasang **versi stabil terbaru** saat `npm install`, lalu kunci di `package-lock.json`)

| Jenis | Paket | Lisensi | Catatan |
|---|---|---|---|
| Runtime | `react`, `react-dom` | MIT | 18 atau 19 |
| Runtime | `react-router-dom` | MIT | `HashRouter` |
| Runtime | `three` | MIT | Dimuat **lazy** hanya di Home |
| Runtime | `gsap` | Gratis (lisensi "no charge", termasuk ScrollTrigger dll.) | Dipakai: `gsap` inti + ticker + timeline. **ScrollTrigger tidak wajib** (engine buatan sendiri) |
| Font | `@fontsource-variable/bricolage-grotesque`, `@fontsource-variable/instrument-sans`, `@fontsource-variable/caveat`, `@fontsource-variable/jetbrains-mono` | OFL | Self-host |
| Dev | `vite`, `@vitejs/plugin-react`, `typescript` | MIT | |
| Dev | `@types/react`, `@types/react-dom`, `@types/three` | MIT | |
| Dev | `vitest`, `@testing-library/react`, `jsdom` | MIT | Uji unit |
| Dev | `@playwright/test` | Apache-2.0 | Uji E2E |
| Dev | `eslint`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y`, `prettier` | MIT | |
| Dev | `vite-plugin-compression` (opsional), `rollup-plugin-visualizer` | MIT | Analisis bundel |
| Dev | `@gltf-transform/cli` (opsional) | MIT | Hanya bila ada GLB (07) |

> **Dilarang:** pustaka UI berbayar, tema/template, Tailwind UI, ikon berbayar, plugin GSAP berlisensi bisnis yang **tidak** gratis. Sebelum menambah paket baru, periksa lisensinya dan catat di `src/content/credits.ts`.
> **Tidak dipakai:** `@react-three/fiber`, `@react-three/drei` (diputuskan: Three.js murni), Lenis (tidak bawaan), Tailwind.

### 1.2 Skrip `package.json`
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:e2e": "playwright test",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "gen:tokens": "node scripts/gen-tokens.mjs",
    "analyze": "vite build --mode analyze"
  }
}
```

---

## 2. Struktur folder

```
rebottle/                          ← akar repo: webdesign_namaTim_technoversary_vol.II
├─ CLAUDE.md
├─ README.md                       ← lihat bagian 12
├─ docs/                           ← seluruh paket dokumen (00–11 + konsep + DECISIONS + CHANGELOG_PARAMETER)
├─ index.html
├─ package.json  package-lock.json  tsconfig.json  vite.config.ts  .eslintrc / eslint.config.js  .prettierrc
├─ .env.example
├─ .github/workflows/deploy.yml
├─ public/
│   ├─ favicon.svg  og-image.png
│   └─ img/                        ← ilustrasi artikel + panel statis (SVG)
├─ scripts/
│   └─ gen-tokens.mjs
├─ e2e/                            ← Playwright
└─ src/
    ├─ main.tsx
    ├─ App.tsx                     ← HashRouter + rute + Suspense
    ├─ routes/
    │   ├─ HomePage.tsx            ← lazy
    │   ├─ AboutPage.tsx  ContentPage.tsx  ArticlePage.tsx  ContactPage.tsx  NotFoundPage.tsx
    ├─ components/
    │   ├─ shell/                  ← AppShell, Navbar, MenuButton, MenuPanel, Scrim, CursorRing, AudioToggle, SkipLink, RouteAnnouncer, RouteTransition, Seo
    │   ├─ ui/                     ← BrandMark, Button, FormField, FactBlock, PageHero, ...
    │   ├─ story/                  ← StoryStage, HeroTitle, ChapterText, PunchText, SplitHeadline, CopyPanel, DataCounter, LetterCard, CTAClosing, ChapterMarker, ScenarioLabel, ScrollHint, LoopDome, Overlays, FlashWindow, TimeRing, StationLabels, StaticStory, StaticPanel
    │   ├─ content/                ← ArticleGrid, ArticleCard, FilterPill, ParticleField, ArticleBody, NextArticle, SourceItem, TempDiagram, ...
    │   └─ *.module.css            ← CSS Modules, satu per komponen
    ├─ engine/                     ← LOGIKA MURNI (tanpa React). Bisa di-unit-test
    │   ├─ story-engine.ts         ← target, shown, ratchet, pause/resume, reset, subscribe
    │   ├─ loop-gesture.ts         ← pull, commitLoop
    │   ├─ timeline.ts             ← LENGTHS_VH, STARTS, PUNCH, chapterAt, localT
    │   ├─ palette.ts              ← PALETTE, applyPalette
    │   ├─ cues.ts                 ← CUES (isyarat suhu), applyCues
    │   ├─ signal.ts               ← store kecil (subscribe/emit) + hook useSignal
    │   ├─ input.ts                ← wheel/touch/keyboard (satu tempat)
    │   └─ ticker.ts               ← pembungkus gsap.ticker (dt dalam detik)
    ├─ stage/                      ← THREE.JS (hanya dimuat di Home)
    │   ├─ stage.ts                ← createStage(canvas, quality): renderer, camera, lights, env, resize, loop
    │   ├─ director.ts             ← SceneDirector
    │   ├─ quality.ts              ← QualityManager
    │   ├─ scenes/                 ← b1.ts … b10.ts, punch.ts, flash.ts
    │   ├─ objects/                ← bottle.ts hand.ts particles.ts water.ts city.ts fish.ts plate.ts bins.ts conveyor.ts processline.ts products.ts tumbler.ts shelf.ts contact-shadow.ts
    │   ├─ materials/              ← bottle-material.ts water-material.ts particle-material.ts clay.ts
    │   ├─ shaders/                ← *.glsl.ts (string)
    │   ├─ textures/               ← crack.ts grain.ts label.ts fabric.ts (CanvasTexture prosedural)
    │   └─ util/                   ← dispose.ts rng.ts math.ts
    ├─ audio/
    │   ├─ audio-engine.ts  profiles.ts  synths.ts
    ├─ content/                    ← site.ts story.ts facts.ts articles.ts credits.ts
    ├─ hooks/                      ← useStoryMode, useChapter, useReducedMotion, useMedia, useDocumentMeta, useFocusTrap
    ├─ styles/                     ← tokens.css typography.css base.css overlays.css
    └─ lib/                        ← tokens.ts, a11y.ts, env.ts, debug.ts
```

**Aturan impor (dijaga ESLint `no-restricted-imports`):**
- `engine/` **tidak boleh** mengimpor `react` atau `three`.
- `stage/` boleh mengimpor `three` dan `engine/`, **tidak** `react`.
- `components/` boleh mengimpor `engine/` (lewat hook) tetapi **tidak** `stage/` selain `StageCanvas` yang memuatnya secara dinamis.
- `content/` hanya data (tanpa logika).

---

## 3. Mesin cerita: antarmuka

```ts
// engine/timeline.ts
export const LENGTHS_VH = { b1:140, b2:180, b3:200, b4:200, b5:220, b6:220, punch:180, b7:140, b8:180, b9:200, b10:380 } as const;
export type SegId = keyof typeof LENGTHS_VH;                   // "b1" | ... | "punch" | "b10"
export const ORDER: SegId[] = ["b1","b2","b3","b4","b5","b6","punch","b7","b8","b9","b10"];
export const TOTAL_VH = ORDER.reduce((a, k) => a + LENGTHS_VH[k], 0);               // 2240
export const STARTS: Record<SegId, number> = /* kumulatif / TOTAL_VH */;
export const PUNCH = { from: STARTS.punch, to: STARTS.b7 };
export function segmentAt(p: number): { id: SegId; index: number; t: number };      // t = waktu lokal 0..1
export function chapterAt(p: number): number;                                       // 1..10 (punch → 6 atau 7 sesuai posisi; lihat catatan)
export function temperatureAt(p: number): number;                                   // °C, sesuai tabel suhu
export function babakAt(p: number): 1 | "punch" | 2;
```

```ts
// engine/story-engine.ts
export interface StoryState { target: number; shown: number; paused: boolean; chapter: number; view: "1" | "none" | "2"; }

export interface StoryEngine {
  readonly state: Readonly<StoryState>;
  mount(root: HTMLElement): void;                // pasang input, hitung tinggi, daftar ticker
  unmount(): void;
  pause(): void;  resume(): void;                // untuk panel menu
  reset(): void;                                 // dipakai loop & masuk Home: shown = target = 0
  onFrame(fn: (shown: number, dt: number) => void): () => void;     // pelanggan per frame (imperatif)
  onChapter(fn: (chapter: number, view: StoryState["view"]) => void): () => void;   // pelanggan jarang (React boleh)
  setViewportCache(): void;                      // dipanggil saat resize
}
export function createStoryEngine(opts?: { maxSpeedVh?: number; chase?: number }): StoryEngine;
```
Aturan:
- `onFrame` dipakai oleh palet, isyarat, "Re:", navbar, penanda bab, teks, scene, audio (urutan di 04 bagian 4).
- `onChapter` dipakai React (`useChapter`) **hanya** saat bab berganti.
- Satu instance engine untuk seluruh aplikasi (`singleton` di modul), di-`mount` oleh `StoryStage`.

### 3.1 `signal.ts` (store kecil)
```ts
export function createSignal<T>(initial: T) {
  let v = initial; const subs = new Set<() => void>();
  return { get: () => v, set: (n: T) => { if (n !== v) { v = n; subs.forEach(f => f()); } }, subscribe: (f: () => void) => (subs.add(f), () => subs.delete(f)) };
}
// hooks/useSignal.ts → useSyncExternalStore(sig.subscribe, sig.get)
```
Signal global: `menuOpen`, `soundOn`, `quality`, `storyMode ("3d" | "static")`, `chapter`, `view`.

---

## 4. Panggung 3D: antarmuka

```ts
// stage/stage.ts
export interface StageContext {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  lights: { key: THREE.DirectionalLight; rim: THREE.DirectionalLight; fill: THREE.HemisphereLight; spot: THREE.SpotLight };
  shared: { bottle: Bottle; hand: Hand; particles: Particles; water: WaterSystem; contactShadow: ContactShadow };
  quality: QualityTier;                              // "high" | "medium" | "low"
  size: { w: number; h: number; dpr: number; aspect: number };
  uniforms: { uTime: { value: number } };
  env: THREE.Texture;                                // PMREM RoomEnvironment
}
export function createStage(canvas: HTMLCanvasElement, quality: QualityTier): Stage;
export interface Stage { render(dt: number): void; resize(): void; setQuality(t: QualityTier): void; dispose(): void; pause(): void; resume(): void; }
```

```ts
// stage/director.ts
export interface Scene {
  id: SegId;
  build(ctx: StageContext): void;
  enter(): void;
  update(t: number, p: number, dt: number): void;     // t lokal 0..1, p = shown global
  exit(): void;
  dispose(): void;
}
export class SceneDirector {
  constructor(ctx: StageContext, scenes: Scene[]);
  update(shown: number, dt: number): void;            // memilih scene aktif ±0,06, memanggil enter/exit/update
}
```
**Pra-muat (preload):** scene dibangun (`build`) ketika `shown` mendekati `mulai − 0,06`. Saat `build`, **tidak ada** operasi sinkron > 8 ms (pecah pekerjaan lewat `await nextFrame()` bila perlu). Scene yang sudah dilewati > 0,12 di belakang di-`dispose` (kecuali objek bersama).

### 4.1 Konfigurasi renderer (acuan)
```ts
const renderer = new THREE.WebGLRenderer({
  canvas, alpha: true, antialias: quality !== "low",
  powerPreference: "high-performance", stencil: false, depth: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, DPR_CAP[quality]));   // HIGH 2, MEDIUM 1.5, LOW 1
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
renderer.localClippingEnabled = true;                                           // cairan botol
renderer.setClearColor(0x000000, 0);                                            // transparan (latar = CSS)
```
- Satu renderer saja, termasuk jendela kilas (*scissor*).
- `ResizeObserver` pada wadah; `setSize(w, h, false)` dan perbarui `camera.aspect` + `setViewOffset` untuk HP.
- `webglcontextlost`: `preventDefault()`, set `storyMode = "static"`; `webglcontextrestored`: bangun ulang scene aktif lalu kembali ke 3D.
- Render hanya ketika: Home aktif, tab terlihat, dan bukan `menuOpen`? (menu terbuka: render **tetap** berjalan namun diturunkan ke 30 fps untuk hemat daya).

### 4.2 Aturan hemat GPU
- Berbagi geometri dan material antar instance. Gunakan `InstancedMesh` untuk gedung, sampah, serpihan, karang, produk berulang.
- Tidak memakai shadow map. Tidak memakai postprocessing penuh (`EffectComposer`).
- `transmission` (di `MeshPhysicalMaterial`) dipakai **hanya pada badan botol**, dan hanya satu objek transmisif yang aktif pada satu waktu (transmission memaksa render ekstra). Tumbler memakai `MeshStandardMaterial` matte. Cairan di dalam botol memakai `transparent` biasa tanpa transmission.
- `renderer.info` dipantau di mode debug (`calls`, `triangles`, `textures`, `geometries`). Anggaran: ≤ 80 draw call, ≤ 150k segitiga per frame (HIGH).
- Dispose helper: `disposeObject(obj)` mengiterasi geometri, material, tekstur.

---

## 5. QualityManager [USULAN D22]

| Tier | DPR maks | Partikel | Segmen air | Segmen botol | Efek |
|---|---|---|---|---|---|
| **HIGH** | 2 | 2400 | 160² | 48 | Transmission botol, shimmer SVG pada kanvas (eksperimen), kaustik, jendela kilas |
| **MEDIUM** | 1,5 | 1400 | 110² | 32 | Transmission botol, tanpa shimmer kanvas |
| **LOW** | 1 | 800 | 64² | 20 | Botol transparan biasa (tanpa transmission), tanpa kaustik, tanpa filter SVG meleleh |

**Pemilihan awal:** `navigator.hardwareConcurrency`, `deviceMemory` (bila ada), lebar layar, `pointer: coarse` (→ MEDIUM/LOW), `prefers-reduced-data`.
**Adaptasi:** pantau rata-rata `dt` selama 90 frame; bila FPS < 45 selama 2 detik berturut-turut, **turun satu tingkat** (maksimum sekali per 6 detik). **Tidak pernah naik otomatis** pada sesi yang sama (hindari bolak-balik). Paksa lewat `?q=low|medium|high`.
Perubahan tier memanggil `Stage.setQuality`, yang menyesuaikan DPR, jumlah partikel (uniform `uCount`), dan material.

---

## 6. Rute, pemuatan, dan pemecahan kode

```tsx
// App.tsx
const HomePage = lazy(() => import("./routes/HomePage"));          // memuat Three.js (chunk terpisah)
<HashRouter>
  <AppShell>
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
```
```ts
// vite.config.ts
export default defineConfig({
  base: "./",                                    // relatif → aman di GitHub Pages (sub-path) dan buka lokal
  build: {
    target: "es2020", sourcemap: false, chunkSizeWarningLimit: 600,
    rollupOptions: { output: { manualChunks: { three: ["three"], gsap: ["gsap"], vendor: ["react","react-dom","react-router-dom"] } } },
  },
  plugins: [react()],
});
```
- **Preload Home chunk**: dari halaman lain, `onMouseEnter` pada tautan Home memanggil `import("./routes/HomePage")` (prefetch).
- Chunk `three` dimuat hanya saat Home pertama kali dibuka dan di-cache.

---

## 7. Variabel lingkungan dan konfigurasi

`.env.example`:
```
VITE_FORMSPREE_ENDPOINT=https://formspree.io/f/xxxxxxxx
VITE_SITE_URL=https://<akun>.github.io/<repo>/
```
`src/lib/env.ts` membaca dan memvalidasi. Tidak ada rahasia di repo (endpoint Formspree memang publik). `.env` di `.gitignore`; `.env.example` di-commit.

---

## 8. Deploy (GitHub Pages, opsional) `.github/workflows/deploy.yml`

```yaml
name: Deploy
on: { push: { branches: [main] }, workflow_dispatch: {} }
permissions: { contents: read, pages: write, id-token: write }
concurrency: { group: pages, cancel-in-progress: true }
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run build
        env: { VITE_FORMSPREE_ENDPOINT: ${{ secrets.VITE_FORMSPREE_ENDPOINT }} }
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: { name: github-pages, url: "${{ steps.deployment.outputs.page_url }}" }
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```
> Penilaian penyisihan **dibaca dari isi repo**, jadi: repo harus bisa dijalankan dengan `npm install` + `npm run dev` **tanpa konfigurasi tambahan** (Formspree jatuh ke mode `mailto` bila endpoint tidak ada).

---

## 9. Token: satu sumber

`src/lib/tokens.ts` adalah sumber angka (PALETTE, CUES, LENGTHS, warna pendukung). `scripts/gen-tokens.mjs` menghasilkan blok CSS variabel (`:root { --c1-bg: … }`) ke `src/styles/tokens.generated.css`, di-import oleh `tokens.css`. Menjalankan `npm run gen:tokens` sebelum `dev/build` (hook `predev`, `prebuild`). Dengan begitu CSS dan JS tidak menyimpang.

---

## 10. Alat debug (hanya `import.meta.env.DEV` atau `?debug=1`)

| Alat | Fungsi |
|---|---|
| Overlay debug | `shown`, `target`, bab, `t` lokal, `pull`, FPS, tier, `renderer.info` |
| Lompat bab (`[` dan `]`) | **Hanya di DEV**. Dikecualikan dari build produksi (`if (import.meta.env.DEV)`) agar bab tidak bisa dilewati oleh pengunjung |
| `?q=low` | Paksa tier |
| `?freeze=0.62` | Bekukan `shown` pada nilai tertentu untuk meninjau satu momen |
| `?noaudio` | Nonaktifkan audio |
| Rekam parameter | Tombol menyalin nilai `GAIN`, `MAX_SPEED_VH`, dst. ke clipboard untuk `CHANGELOG_PARAMETER.md` |

Build produksi **tidak boleh** menyertakan lompat bab ataupun `freeze` (periksa dengan `grep` di `dist/`).

---

## 11. Konvensi kode dan kolaborasi (tim 2 orang)

- **TypeScript strict** (`strict`, `noUncheckedIndexedAccess`). Tanpa `any` kecuali dikomentari alasannya.
- Penamaan: berkas `kebab-case` (engine/stage) dan `PascalCase` (komponen). Satu komponen per berkas.
- CSS Modules: kelas `camelCase`; nilai hanya dari token.
- Komentar penting dalam Bahasa Indonesia; nama simbol dalam Inggris.
- Commit: `feat(scene-b3): …`, `fix(engine): …`, `docs: …`, `perf: …`, `chore: …`.
- Cabang: `main` (selalu bisa dijalankan), `feat/<nama>`; PR kecil, dicentang di `10_TASK_BREAKDOWN.md`.
- Format otomatis: Prettier; lint pra-commit (opsional `lint-staged`).
- **Dilarang** menaruh nilai magis. Semua konstanta di `engine/timeline.ts`, `lib/tokens.ts`, atau `profiles.ts`.

---

## 12. Templat README (untuk pengumpulan)

```markdown
# Re:bottle
Situs scrollytelling kampanye peduli lingkungan: mengikuti satu botol plastik, dari lahir sampai ke piring makan kita (Babak I), lalu cerita yang sama ketika kita peduli (Babak II), diakhiri ajakan "Bawa botolmu besok."

**Subtema:** Kampanye Peduli Lingkungan · **Lomba:** Techno Versary Vol. II – Web Design Competition (HIMA TI FKOM Universitas Kuningan)

## Tim
- Nama tim: …  · Anggota: …

## Halaman
Home · About · Konten (Galeri Artikel) · Contact

## Teknologi
Vite · React · TypeScript · React Router · GSAP · Three.js · Web Audio API · CSS Modules

## Menjalankan
npm install
npm run dev        # http://localhost:5173
npm run build && npm run preview

## Catatan
- Opsi `?q=low` memaksa mode ringan. Mode reduced-motion menampilkan panel statis.
- Form Contact memakai Formspree (set `VITE_FORMSPREE_ENDPOINT`), tanpa itu memakai mailto.
- Seluruh aset dibuat sendiri atau berlisensi bebas. Lihat halaman About › Atribusi.
- Hasil Lighthouse: … (isi saat final)
```

---

## 13. Strategi uji

| Lapis | Alat | Yang diuji |
|---|---|---|
| Unit | Vitest | `segmentAt`, `chapterAt`, `temperatureAt`, `applyPalette` (kasus batas 0,7/1), ratchet (laju ≤ `MAX_RATE`, dua arah), `LoopGesture` (tidak memicu pada gulir pendek; memicu pada 1.400 px), filter dan hitungan artikel, validator form |
| Komponen | Testing Library | `FilterPill` (aria-pressed, hitungan), `ContactForm` (status), `MenuPanel` (focus trap, Esc), `ChapterMarker` (view) |
| E2E | Playwright | Skenario di 04 bagian 15 + rute + form (dengan endpoint tiruan) |
| Performa | Lighthouse CI / manual | Lihat 09 |
| Visual | Tangkapan layar manual per bab (checklist 09) | Kontras, komposisi |
| Aksesibilitas | axe (extension / `@axe-core/playwright`) | Semua rute non-Home dan panel menu |
