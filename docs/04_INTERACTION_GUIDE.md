# 04 · PANDUAN INTERAKSI

> Mesin `progress`, ratchet, loop "tarik penuh", navbar mengempis, panel menu, penanda bab, "Re:", kursor cincin = **[DISEPAKATI]** (konsep bagian 4, 7, 9–13). Nilai parameter berlabel [PROTOTIPE]. Pengubahan kecepatan ratchet menjadi berbasis waktu (D10), tombol suara (D8), pemetaan masukan lengkap, dan aturan transisi rute = **[USULAN]**.
> Kode di sini adalah **algoritma acuan dalam TypeScript**. Struktur berkas dan antarmuka lengkap ada di `06_ARCHITECTURE.md`.

---

## 1. Model mental

```
INPUT (wheel / touch / keyboard / scrollbar)
        │
        ▼
 scrollY ──► target (0..1)  ──► [RATCHET: kecepatan maks] ──► shown (0..1)
                                                              │
                      ┌───────────────┬─────────────┬─────────┴────────┬─────────────┐
                      ▼               ▼             ▼                  ▼             ▼
                 SceneDirector   applyPalette   updateChapters   updateRe/Nav    Audio
                 (3D, kamera)    (CSS vars)     (penanda bab)    (data-re,...)   (gain/filter)

 shown ≥ 0.999 + masukan gulir maju ──► LoopGesture (pull 0..1) ──► commitLoop() ──► shown = 0
```

**Hukum:** semua visual cerita membaca **`shown`**, tidak pernah `scrollY`/`target`. Satu-satunya pengecualian sah: `LoopGesture` membaca masukan mentah (roda/sentuh/keyboard) karena gestur terjadi di akhir ketika `scrollY` sudah mentok.

---

## 2. Halaman Home sebagai "panggung tetap + penggulir tinggi"

```html
<div id="app">
  <div class="stage">        <!-- position: fixed; inset: 0 : kanvas, judul hero, teks, overlay -->
  <div class="scroller" style="height: calc((var(--total-vh) + 100) * 1dvh)"></div>   <!-- hanya pemberi tinggi gulir -->
</div>
```
- Dokumen yang digulir **nyata** (agar roda, sentuh, trackpad, keyboard bekerja natural). Panggung `fixed` menampilkan hasil.
- `target = scrollY / (scrollHeight − innerHeight)` dihitung di `scroll` event (passive) dan **di-cache** saat resize.
- Scrollbar tersembunyi: `html { scrollbar-width: none } html::-webkit-scrollbar { display:none }`.
- `html, body { overscroll-behavior: none }` agar tidak ada *bounce* iOS/Chrome yang menggeser `target` di luar 0–1.
- `history.scrollRestoration = "manual"` dan saat Home mount: `window.scrollTo(0, 0)` (Home selalu mulai dari hero [DISEPAKATI]).
- Tinggi `dvh`: dihitung ulang saat `visualViewport` berubah (bar alamat HP). Hindari `vh` murni.

---

## 3. Ratchet (penjaga alur) [DISEPAKATI] — berbasis waktu [USULAN D10]

Konsep awal memakai `MAX_STEP = 0.004` per frame. Itu bergantung frame rate (120 Hz = 2× lebih cepat). Versi ini memakai laju per detik:

```ts
// engine/story-engine.ts (inti)
const MAX_SPEED_VH = 70;                         // [PROTOTIPE] vh cerita per detik
const MAX_RATE     = MAX_SPEED_VH / TOTAL_VH;    // 0,03125 per detik (≈ 0,00052 per frame @60Hz)
const CHASE        = 8;                          // 1/detik, kehalusan pengejaran

let target = 0, shown = 0;

function tick(dt: number) {                      // dt dalam detik, dari gsap.ticker
  const diff  = target - shown;
  const eased = diff * (1 - Math.exp(-CHASE * dt));              // pengejaran halus
  const cap   = MAX_RATE * dt;                                   // batas laju
  shown += Math.max(-cap, Math.min(cap, eased));
  if (Math.abs(target - shown) < 1e-5) shown = target;
  render(shown);
}
```

| Hal | Nilai awal | Efek bila naik | Efek bila turun |
|---|---|---|---|
| `MAX_SPEED_VH` | 70 | Gulir cepat melewati bab lebih cepat (risiko tampak "melompat") | Lebih tegas, bisa terasa menahan |
| `CHASE` | 8 | Lebih responsif | Lebih mulus/licin |

**Aturan bawaan:**
1. Berlaku **dua arah** (maju dan mundur sama-sama dibatasi). Menggulir mundur diperbolehkan (kecuali dari hero: tidak ada loop mundur).
2. Pada setiap saat hanya ada **satu** `shown`.
3. Setiap bab minimal terlihat `LENGTH_vh / 70` detik walaupun pengunjung menggulir sangat cepat (bab 140 vh ≥ 2 detik; Bab 10: ≥ 5,4 detik).
4. Pengunjung menyeret scrollbar: tidak ada (tersembunyi). Menekan **End**: dicegat. **Home**: dicegat (tidak ke atas instan).

**Celah dan penutupnya** [DISEPAKATI]:

| Celah | Penutup |
|---|---|
| Seret scrollbar | Disembunyikan |
| End / Ctrl+End | `keydown` dicegat (`preventDefault`) |
| Home / Ctrl+Home | Dicegat |
| PageDown / Space | Dibiarkan menggulir **satu layar** lewat `window.scrollBy({ top: innerHeight * 0.9 })`, tetap dibatasi ratchet |
| Pencarian teks / tab fokus yang menggulir | Elemen cerita tidak fokusable; teks cerita `aria-hidden` terhadap pencarian |
| Hash/anchor | Tidak ada anchor di Home |
| Gulir super cepat | Ratchet |
| Klik penanda bab | Penanda bab hanya-baca (`pointer-events: none`) |

---

## 4. Urutan pembaruan per frame (`render(shown)`)

Satu pemanggilan per frame, **urutan tetap** agar tidak ada ketidakselarasan:

| # | Langkah | Membaca | Menulis |
|---|---|---|---|
| 1 | `computeLocal(shown)` | `STARTS` | bab aktif `k`, waktu lokal `t`, apakah punchline |
| 2 | `applyPalette(shown)` | PALETTE | `--bg-a/b`, `--ink-a/b`, `--accent-a/b`, `--mix` |
| 3 | `applyCues(shown)` | CUES (02 bagian 5) | `--grain`, `--vignette`, `--melt`, `--crack`, shimmer, intensitas lampu |
| 4 | `updateRe(shown)` | `PUNCH.to` | `html[data-re]` |
| 5 | `updateNav(shown)` | ambang 0,01 / 0,003 | timeline navbar |
| 6 | `updateChapters(shown, temp)` | `STARTS`, `PUNCH` | `aside[data-view]`, kelas aktif, `--y` |
| 7 | `updateText(k, t)` | naskah bab | opacity/transform teks, counter |
| 8 | `scene.update(t, shown, dt)` | — | objek 3D, kamera |
| 9 | `renderer.render()` | — | kanvas |
| 10 | `audio.update(shown)` | profil audio | gain/filter (jika aktif) |

Aturan: jangan menyentuh `getBoundingClientRect` di dalam `render` (paksa layout). Ukuran di-cache saat `resize`.

**Pembatasan biaya:** langkah 2–3 menulis variabel CSS hanya bila nilainya berubah (> 0,001). Langkah 7 hanya menyentuh elemen bab aktif ±1.

---

## 5. Navbar [DISEPAKATI]

### 5.1 Keadaan
| Posisi | Navbar |
|---|---|
| Home, `shown < 0,003` | **Terbuka**: logo, empat tautan, tombol bulat |
| Home, `shown > 0,01` | **Mengempis**: hanya logo + tombol bulat |
| Antara 0,003 – 0,01 | Mempertahankan keadaan sebelumnya (histeresis) |
| Loop kembali ke hero (`shown = 0`) | Terbuka lagi |
| Halaman lain | Terbuka, tidak mengempis (menempel) |
| HP (≤ 768 px) | Hanya logo + tombol bulat sejak awal |

### 5.2 Animasi (timeline GSAP, dua arah)
```ts
const collapse = gsap.timeline({ paused: true, defaults: { ease: "power3.inOut" } });
collapse
  .to(linkEls, {
    x: (i, el) => burgerLeft - el.getBoundingClientRect().left,   // dihitung sekali (cache) saat build/resize
    opacity: 0, duration: 0.55,
    stagger: { each: 0.05, from: "end" }                          // yang terdekat ke tombol bergerak dulu
  })
  .set(linksWrap, { visibility: "hidden" });                       // keluar dari urutan Tab
```
- Buka kembali = `collapse.reverse()`; `visibility: visible` dipasang **di awal** reverse.
- Pemicu **bukan** `scrollY`, melainkan `shown`.
- Tautan tersembunyi tidak fokusable. Saat navbar mengempis, fokus yang ada di tautan dipindah ke tombol bulat.

### 5.3 Interaksi dengan panel menu
| Aksi | Navbar |
|---|---|
| Buka menu saat navbar terbuka (hero) | Timeline mengempis dulu agar tautan tidak bertumpuk di atas panel |
| Tutup menu, `shown < 0,003` | Tautan kembali (reverse) |
| Tutup menu, `shown ≥ 0,003` | Tetap mengempis |

---

## 6. Panel menu [DISEPAKATI]

### 6.1 Urutan buka
1. Klik tombol bulat atau tekan **Enter/Space** pada tombol terfokus.
2. `menuOpen = true` → engine `pause()` (ratchet berhenti, masukan gulir diabaikan), audio *duck* (−6 dB).
3. Navbar mengempis (bila perlu), tombol berganti ikon ✕ (0,4 detik).
4. Scrim memudar masuk (0,4 detik), panel meluncur dari kanan (0,5 detik `--ease-gate`), tautan muncul bergantian (60 ms).
5. `app.inert = true` pada pembungkus konten (bukan navbar dan bukan panel).
6. Fokus pindah ke **tautan pertama**; fokus **terkunci** di dalam panel (Tab/Shift+Tab bersiklus: tautan → … → tombol ✕ di navbar → tautan pertama).

### 6.2 Penutupan
| Pemicu | Perilaku |
|---|---|
| Tombol ✕ | Tutup |
| **Esc** | Tutup |
| Klik scrim | Tutup |
| HP: ketuk 12% kiri | Tutup (itu scrim) |
| HP: geser ke kanan (> 80 px, kecepatan > 0,3 px/ms) | Tutup |
| Klik tautan ke halaman lain | Tutup + navigasi |
| Klik **Home** saat sudah di Home | Tutup saja. **Cerita tidak diulang** |

Setelah tutup: `app.inert = false`, `engine.resume()`, fokus kembali ke tombol bulat, `aria-expanded="false"`, audio kembali.

### 6.3 Aturan
- Posisi cerita tidak berubah saat menu dibuka/ditutup.
- `scroll lock`: `html { overflow: hidden }` + `engine.pause()`. Tidak mengubah `scrollTop`.
- `role="dialog"`, `aria-modal="true"`, `aria-label="Menu"`.
- `prefers-reduced-motion`: panel langsung muncul, tanpa meluncur dan tanpa stagger.
- Panel tidak memuat daftar bab (agar bukan jalan pintas) [DISEPAKATI].

---

## 7. Loop "tarik penuh" [DISEPAKATI]

### 7.1 Prinsip
- **Tanpa animasi pergantian apa pun.** Hanya gestur setengah lingkaran biru yang mengikuti masukan pengunjung.
- **Hanya maju.** Menggulir ke atas dari hero tidak berefek.
- Hanya masukan **langsung dan terus-menerus** yang memicu. Gulir sesaat tidak.
- Aktif **hanya** saat `shown ≥ 0,999` (setelah seluruh Bab 10 diputar penuh).

### 7.2 Parameter (titik awal [DISEPAKATI], setel di prototipe)
| Konstanta | Nilai | Arti |
|---|---|---|
| `GAIN` | `1/1400` | 1.400 px masukan roda/sentuh berkelanjutan mengisi `pull` dari 0 ke 1 |
| `REST_DELAY` | `90 ms` | Jeda tanpa masukan sebelum lingkaran mulai kembali |
| `DECAY` | `0,12` per frame @60 Hz | Kecepatan kembali (jadikan berbasis `dt`: `1 − (1−0,12)^(dt·60)`) |
| Penghalusan tampilan | `0,35` | `shownPull` mengejar `pull` |
| Panah bawah ditahan | `+60` per key-repeat | Mengisi gestur |
| End / PageDown / Space | **tidak** mengisi | Dicegat |

### 7.3 Algoritma
```ts
let pull = 0, shownPull = 0, lastInput = 0, busy = false;

function addPull(dy: number) {
  if (busy || engine.shown < 0.999 || dy <= 0) return;
  pull = Math.min(1, pull + dy * GAIN);
  lastInput = performance.now();
}
// sumber masukan
on(window, "wheel",      e => addPull(e.deltaY), { passive: true });
on(window, "touchmove",  e => { const y = e.touches[0].clientY; addPull((lastY ?? y) - y); lastY = y; }, { passive: true });
on(window, "touchstart", e => { lastY = e.touches[0].clientY; }, { passive: true });
on(window, "touchend",   () => { lastY = null; });
on(window, "keydown",    e => { if (e.key === "ArrowDown") addPull(60); });

function tickLoop(dt: number) {
  if (busy) return;
  if (performance.now() - lastInput > REST_DELAY) pull = Math.max(0, pull - (1 - Math.pow(1 - DECAY, dt * 60)));
  shownPull += (pull - shownPull) * (reduced ? 1 : 0.35);
  dome.style.setProperty("--pull", String(shownPull));
  hint.hidden = shownPull > 0.05;                       // (Terus gulir) hilang saat mulai menarik
  if (pull >= 1) commitLoop();
}

function commitLoop() {
  busy = true;
  dome.style.setProperty("--pull", "1");                // layar kini biru hero
  requestAnimationFrame(() => {
    root.classList.add("snap");                         // matikan semua transisi CSS
    engine.reset();                                     // shown = target = 0; scrollTo(0,0); scene → Bab 1; "Re:" pudar; navbar terbuka; daftar bab Babak I
    dome.style.setProperty("--pull", "0");              // dome hilang TANPA animasi
    pull = shownPull = 0;
    requestAnimationFrame(() => { root.classList.remove("snap"); busy = false; });
  });
}
```
**Catatan implementasi penting**
- `engine.reset()` menggulir dokumen ke 0 **secara instan** (`behavior: "instant"`), menyetel `shown = target = 0`, dan memicu `render(0)` sinkron **sebelum** `snap` dilepas.
- Karena `shown` sudah 1 dan dokumen sudah di dasar, masukan roda tidak menggeser dokumen. Itu sebabnya gestur memakai masukan mentah.
- Saat `busy`, semua masukan diabaikan 2 frame.
- `prefers-reduced-motion`: penghalusan dimatikan (`shownPull = pull`); lingkaran tetap mengikuti masukan tetapi tanpa interpolasi.

### 7.4 Bentuk dan warna dome
```css
.dome {
  --pull: 0;
  position: fixed; left: 50%; top: 100dvh;
  width:  max(220vw, 240dvh); height: max(220vw, 240dvh);
  border-radius: 50%;
  background: var(--hero-bg);                                   /* #0B2B80, sama dengan hero */
  transform: translate(-50%, calc(var(--pull) * -135dvh));
  will-change: transform; pointer-events: none; z-index: 50;
}
```
Pada Bab 10 (latar sage `#D9E6D6`) dome biru muncul dari bawah: kontras kuat sehingga terbaca sebagai "tarikan". Saat penuh, adegan diganti tak terlihat.

### 7.5 Uji gestur (wajib; catat hasil di `docs/CHANGELOG_PARAMETER.md`)
| Perangkat | Uji | Lulus bila |
|---|---|---|
| Mouse roda berjenjang | 15 putaran cepat | `pull` penuh; 3 putaran lalu berhenti → kembali ke 0 |
| Trackpad laptop | Satu lecutan kuat | Penuh dalam satu lecutan (inersia) |
| Trackpad | Dua jari pelan | Naik pelan, kembali jika dilepas |
| HP (sentuh) | Seret ke atas panjang | Penuh dengan ±1,5–2 seret panjang |
| HP | Seret pendek lalu lepas | Kembali turun |
| Keyboard | Tahan ↓ 2 detik | Penuh |
| Salah pemicu | Menggulir cepat ke akhir lalu berhenti | **Tidak** looping |

---

## 8. Penanda bab (kiri layar) [DISEPAKATI]

- Dua `<ol>` bertumpuk (Babak I: 01–06; Babak II: 07–10), `data-view` ∈ {`1`, `none`, `2`}.
- `data-view` dihitung dari `shown`: `< PUNCH.from` → `1`; `PUNCH.from … PUNCH.to` → `none`; `≥ PUNCH.to` → `2`.
- Pergantian daftar: memudar silang 0,4 detik di awal Bab 7 bersamaan dengan "Re:" menyala. Saat loop: instan (`snap`).
- Bab aktif ditentukan oleh `chapterAt(shown)` dengan histeresis ±0,005 agar tidak berkedip di batas.
- Suhu (`+2,0°C`) tampil di label aktif; teks diperbarui hanya saat bab berganti (bukan tiap frame).
- **Hanya-baca:** `pointer-events: none`, tidak fokusable, tanpa `aria-live`. Wadah memiliki `aria-label` dan isi tidak di-`aria-hidden` (pembaca layar boleh membacanya sebagai daftar).
- Kotak penanda: `transform: translateY(var(--y))`, `--y` dihitung dari `offsetTop` yang **di-cache** saat resize.
- HP/tablet ≤ 1024 px: teks disembunyikan, hanya garis + titik 5px.

---

## 9. "Re:" pudar/menyala [DISEPAKATI]

```ts
function updateRe(p: number) {
  const on = p >= PUNCH.to ? "on" : "off";          // dihitung dari POSISI, bukan riwayat
  if (html.dataset.re !== on) html.dataset.re = on;
}
```
| Keadaan | `data-re` |
|---|---|
| Hero → akhir punchline | `off` |
| Awal Bab 7 → akhir Bab 10 | `on` |
| Loop → hero | `off` (di bawah `snap`, instan) |
| Menggulir mundur Bab 7 → 6 | `off` (transisi 0,9 detik meredup) |
| About, Konten, Contact | `on` statis (`<html data-re="on">`) |

Diterapkan serentak ke: logo navbar, judul hero, blok identitas di panel menu (semuanya membaca satu atribut yang sama).

---

## 10. Kursor cincin [DISEPAKATI]

### 10.1 Cakupan
Aktif di **Home dan Galeri Artikel** pada perangkat `pointer: fine` [DISEPAKATI]. Halaman About, Contact, dan detail artikel memakai kursor bawaan (kursor cincin tidak dipasang di sana).

### 10.2 Mesin keadaan
| Keadaan | Pemicu | Tampilan |
|---|---|---|
| `idle` | Tidak bergerak | Cincin bulat R=21, stroke 1,5px |
| `move` | Kecepatan > 0,5 px/frame | Meregang searah gerak, `stretch ≤ 0,4` (≈ 2:1), rotasi jalur terpendek |
| `hover` | Di atas `a, button, [data-hover]` | Skala 1,7× |
| `card` | Di atas kartu artikel (`[data-cursor="card"]`) | Skala 1,7× + label "Baca" |
| `input` | Di atas `input, textarea, select` | Cincin tersembunyi, kursor bawaan |
| `out` | Mouse keluar jendela | Memudar |
| `calm` | `prefers-reduced-motion` | Mengikuti mouse tanpa peregangan |

### 10.3 Aturan teknis (acuan di konsep bagian 13.4)
- Interpolasi tidak bergantung frame rate: `ease(k, f) = 1 − (1 − k)^f` dengan `f = dt/16,667`.
- Memanjang cepat (0,28), mengendur lambat (0,09); posisi mengejar 0,2.
- `ry = R / (1 + stretch)` (luas relatif terjaga). Rotasi dengan jalur terpendek mod π.
- Arah diperbarui **hanya** saat bergerak.
- `mix-blend-mode: difference`; cadangan: garis putih polos bila lambat.
- Kelas `has-ring` pada `<html>` hanya diberikan jika JS berjalan.
- Posisi menulis lewat `transform` (tanpa `left/top` per frame).
- Cincin **tidak** menggantikan indikator fokus keyboard.

---

## 11. Audio dan tombol suara [USULAN]

- Default **mati**. `AudioContext` dibuat **hanya** saat klik pertama tombol suara (kebijakan autoplay).
- Tombol: kiri-bawah, lingkaran 56px; `aria-pressed`; label "Nyalakan suara"/"Matikan suara".
- Pilihan tersimpan di `localStorage` (`rebottle:sound`) dalam `try/catch`. Namun **tidak pernah memulai otomatis**; halaman baru tetap mati sampai klik.
- Saat panel menu terbuka: *duck* −6 dB. Saat tab tersembunyi (`visibilitychange`): `suspend()`. Saat kembali: `resume()` hanya bila sebelumnya aktif.
- Detail suara per bab: `08_AUDIO_SPEC.md`.

---

## 12. Peta masukan lengkap

### 12.1 Keyboard
| Tombol | Di Home (menu tertutup) | Di panel menu | Di form Contact |
|---|---|---|---|
| ↓ / J | Gulir pelan; di akhir Bab 10, mengisi gestur loop | Pindah fokus | Normal |
| ↑ / K | Gulir mundur | — | Normal |
| PageDown / Space | Gulir 0,9 layar (dibatasi ratchet) | — | Normal (Space di tombol = klik) |
| PageUp | Gulir mundur 0,9 layar | — | Normal |
| End / Home | **Dicegat** (tidak ada efek) | — | Normal di input |
| Tab | Ke navbar (tombol bulat, tautan jika terbuka, tombol suara) | Siklus terkunci di panel | Normal |
| Esc | — | Tutup panel | — |
| Enter/Space | Aktifkan tombol/tautan terfokus | Aktifkan tautan | — |

### 12.2 Pointer dan sentuh
| Gestur | Aksi |
|---|---|
| Roda / trackpad | Gulir cerita; di akhir: isi gestur loop |
| Seret sentuh vertikal | Gulir cerita; di akhir: isi gestur loop |
| Ketuk tombol bulat | Buka/tutup menu |
| Ketuk scrim | Tutup menu |
| Geser kanan pada panel (HP) | Tutup menu |
| Ketuk tombol suara | Nyalakan/matikan |
| Ketuk elemen cerita | **Tidak ada aksi** (cerita bukan antarmuka) |

### 12.3 Urutan fokus Home
`Lewati ke konten` (hanya muncul saat fokus) → logo → tautan navbar (jika terbuka) → tombol bulat → tombol suara. Tidak ada elemen fokusable di dalam cerita.

> **"Lewati ke konten" di Home** melompat ke tombol bulat/menu (tidak melompat bab; mematuhi aturan bab tidak bisa dilewati).

---

## 13. Navigasi antar halaman [USULAN D21]

| Aspek | Perilaku |
|---|---|
| Rute | `HashRouter`: `#/`, `#/about`, `#/konten`, `#/konten/:slug`, `#/contact` |
| Layout induk | `AppShell` tidak di-unmount: navbar, panel menu, kursor, tombol suara, audio tetap hidup |
| Transisi konten | `opacity` 1 → 0 (0,2 detik) lalu konten baru 0 → 1 (0,3 detik). Tanpa gerak berlebih |
| Posisi gulir | Setiap rute baru: `scrollTo(0,0)` instan |
| Masuk ke Home | Engine di-*reset* (`shown = 0`), "Re:" `off`, navbar terbuka |
| Keluar dari Home | Kanvas dihentikan (`renderer` di-pause), partikel dilepas. Three.js tetap ter-cache (tidak dimuat ulang) |
| Judul tab | `Re:bottle` (Home), `About | Re:bottle`, `Galeri Artikel | Re:bottle`, `{Judul artikel} | Re:bottle`, `Contact | Re:bottle` |
| Fokus | Setelah ganti rute, fokus ke `<h1>` halaman baru (`tabIndex=-1`) dan diumumkan lewat region `aria-live="polite"` berisi judul |
| Tombol "kembali" browser | Normal. Kembali ke Home = mulai dari hero |

---

## 14. Kasus tepi (wajib ditangani)

| Kasus | Penanganan |
|---|---|
| **Resize** di tengah cerita | Hitung ulang `scrollHeight`, pertahankan `shown` (bukan piksel), render ulang kanvas, cache posisi penanda |
| Tab disembunyikan | Jeda ticker (GSAP `lagSmoothing`), `audio.suspend()`. Saat kembali, `shown` melanjutkan (tidak melompat) |
| Layar 120/144 Hz | Semua laju berbasis `dt` (ratchet, kursor, dome) |
| Zoom browser 200% | Tata letak tidak patah; teks tetap terbaca; penanda bab menjadi titik |
| Ukuran teks sistem besar | Teks panel membungkus; panel boleh bertambah tinggi (maks. 70% layar) lalu `overflow: auto` hanya pada panel salin |
| bfcache (kembali via tombol back) | Pada `pageshow` dengan `persisted`, panggil `engine.reset()` bila di Home |
| Muat ulang di tengah cerita | Selalu mulai dari hero |
| Tanpa JavaScript | `<noscript>`: pesan singkat + tautan ke Galeri Artikel dan About (statis tidak tersedia di SPA, jadi pesan saja) |
| WebGL tidak tersedia / konteks hilang | `StaticStory`; `webglcontextlost` → tampilkan panel statis dan coba pulihkan (`restored`) |
| Gulir sangat cepat sebelum aset siap | Engine menahan `target` ≤ batas muat (lihat 09 pemuatan progresif) |
| Perangkat sentuh tanpa roda (stylus/mouse bersamaan) | Kedua jalur masukan diperlakukan sama |
| Dua panel terbuka | Tidak mungkin: hanya satu dialog (menu) |

---

## 15. Perintah uji interaksi (otomatis, Playwright; lihat 09)

1. **Ratchet:** gulir ke `scrollHeight` instan → `shown` naik bertahap, tidak melewati 10 bab dalam < `TOTAL_VH/70` detik.
2. **Navbar:** `shown` 0 → 0,02: tautan hidden; kembali ke 0: terlihat. Tidak berkedip antara 0,003–0,01.
3. **Menu:** buka → fokus di tautan pertama; Tab 10× tetap di dalam panel; Esc → fokus kembali ke tombol.
4. **Loop:** `shown = 1` → 3 roda kecil → `--pull` kembali ke 0; roda 1.400 px → `shown = 0`, `data-re = off`.
5. **Re:** `shown` melewati `PUNCH.to` → `on`; mundur → `off`.
6. **Reduced motion:** `StaticStory` dirender; panel 2 tidak ada sebelum panel 1 diamati.
7. **Rute:** klik About → `scrollY = 0`, judul tab benar, `data-re = on`.
