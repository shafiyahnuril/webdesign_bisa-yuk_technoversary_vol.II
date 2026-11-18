# 08 · SPESIFIKASI AUDIO (sintesis Web Audio)

> Audio **mati secara bawaan**, dinyalakan lewat tombol suara, memakai Web Audio API, berubah mengikuti `progress`, dengan bunyi pendek saat botol masuk tempat sampah, dan hanya sumber CC0 = **[DISEPAKATI]** (konsep bagian 14.2).
> Jenis suara per bab, parameter, dan seluruh rancangan sintesis (tanpa berkas) = **[USULAN D15]**. Nilai angka = **[PROTOTIPE]**.

---

## 1. Prinsip

1. **Bonus, bukan penopang.** Cerita harus utuh tanpa suara.
2. **Nol berkas.** Semua suara disintesis (osilator + derau tersaring). Ukuran aset 0 KB, tidak ada isu lisensi.
3. **Mengikuti `shown`.** Suhu dan bab menggerakkan filter, gain, dan lapisan (tidak per frame: pembaruan **10 kali per detik**).
4. **Lembut dan tidak mengejutkan.** Tidak ada bunyi keras mendadak. Pintu masuk 1,5 detik (fade-in) saat dinyalakan.
5. **Hemat.** Maks. 24 node aktif; tidak ada `ScriptProcessor`; jeda total saat tab tersembunyi.
6. **Pusat nada:** **D**. Babak I memakai D–A–F (minor, dingin). Babak II memakai D–A–F♯ (mayor, lapang).

---

## 2. Grafik audio

```
 [Drone layer]──┐
 [Noise bed]────┤
 [Pulse]────────┼─► [Ambient bus] ─► [LowShelf/Lowpass "world"] ─┐
 [Texture]──────┘                                                 │
                                                                  ├─► [Master gain 0–0.35] ─► [DynamicsCompressor] ─► destination
 [SFX one-shots]───────────► [SFX bus] ───────────────────────────┘
        └── duck: ambient × 0.5 saat panel menu terbuka
```
- `world filter`: lowpass untuk efek bawah air (Bab 4 bawah, Bab 5–6) dan "hening" (punchline).
- Compressor: `threshold −24 dB, ratio 4, attack 0.01, release 0.25`.
- Master gain tertinggi **0,35**; fade-in 1,5 detik (`linearRampToValueAtTime`).

---

## 3. Pembangun dasar (di `audio/synths.ts`)

| Pembangun | Isi | Parameter |
|---|---|---|
| `Drone(notes[], type)` | 2–3 osilator `sine`/`triangle` terdetune ±4 sen, masing-masing lewat `GainNode` + LFO amplitudo 0,05–0,15 Hz | `notes`, `gain`, `cutoff` |
| `NoiseBed(kind)` | `AudioBufferSource` loop derau putih/merah 4 detik → `BiquadFilter` (lowpass/bandpass) → gain | `kind: "water"\|"wind"\|"hum"\|"hiss"`, `cutoff`, `Q`, `gain` |
| `Pulse(bpm)` | Osilator `sine` 55 Hz, envelope pendek (attack 0,02, decay 0,35) dipicu penjadwal | `bpm`, `gain` |
| `Tick(rate)` | Klik pendek acak (derau 8 ms, highpass 2 kHz), selang acak | `rate` (per detik), `gain` |
| `Swell(dir)` | Derau → bandpass dengan frekuensi menyapu naik/turun selama 1–3 detik | `dir: "up"\|"down"`, `dur` |
| `Note(freq, dur)` | Satu nada pad: dua osilator `triangle` + attack 1,2 detik, release 2 detik | `freq`, `dur`, `gain` |

Semua bunyi dibuat **sekali** saat audio dinyalakan; lapisan hanya dinaik-turunkan gain-nya (`setTargetAtTime`, konstanta waktu 0,4 detik).

---

## 4. Profil per bab (lapisan dan nilai awal)

Frekuensi: D2 73,4 · A2 110 · D3 146,8 · F3 174,6 · F♯3 185 · A3 220 · D4 293,7.

| Segmen | Drone | Derau/tekstur | Denyut | Filter dunia (lowpass) | Catatan |
|---|---|---|---|---|---|
| **Bab 1 Lahir** | D2 + A2 + D3 (sine), gain 0,10 | hum sangat tipis (0,02) | — | 8 kHz | Bersih, jernih, lapang |
| **Bab 2 Sekali Pakai** | D2 + A2 + F3, gain 0,10 | **Glug** 3 burst (derau bandpass 500 Hz, 120 ms) saat minum; **whoosh** saat lempar (Swell up, 0,4 s) | — | 7 kHz | Ritme kebiasaan, ringan |
| **Bab 3 Tersesat** | D2 + A2 + F3, 0,09 | **Air** (`water`: lowpass 900 Hz, gain 0,10) + **hum kota** (`hum` 120 Hz, 0,05) | — | 6 kHz | Di kolong jembatan: reverb palsu (feedback delay 0,35 s, 0,25) selama 1,5 detik |
| **Bab 4 Lautan** | D2 + A2 + F3 + gesekan tidak harmonis (D♯3, 0,03) | **Ombak** (`water` gain naik 0,10 → 0,28 mengikuti amplitudo ombak) + `wind` (0,05 → 0,12) | — | 6 kHz → **400 Hz** saat menyelam (`t 0,48–0,78`) | Menyelam: peredaman frekuensi tinggi |
| **Bab 5 Terurai** | D2 saja (gain 0,08), menurun halus | **Tick** retak (rate 0,2 → 3 per detik mengikuti `uCrack`); pada `t 0,5`: **shatter** (Swell bandpass 3 kHz + burst 150 ms); lalu `hiss` butiran (0,04 → 0,10) | — | 1,2 kHz | Hening 0,2 detik sebelum shatter (gain ambient → 0,02) |
| **Bab 6 Kembali ke Kita** | D2 (0,06) | `hiss` halus, swish ikan (Swell kecil acak) | **Pulse 50 BPM** (gain 0,08 → 0,18) | 900 Hz | Di akhir: pulse berhenti, tersisa nada tipis A5 (880 Hz, gain 0,02) |
| **Punchline** | Mati bertahap (0,06 → 0 di `t 0–0,3`) | **Reverse swell** (Swell down yang diputar maju: filter menyapu turun, `t 0,08–0,40`) | — | 600 Hz | `t 0,40`: **satu Note D4** lembut saat teks muncul; `t 0,9` semua mati |
| **Bab 7 Di Tempat yang Benar** | D2 + A2 + **F♯3** (mayor), 0,10 | Gemericik jernih (`water` 1,2 kHz, 0,06) saat kilas | — | 10 kHz | "Re:" menyala: **chime** (Note A4, 0,6 s, gain 0,10). **SFX tung** saat botol masuk |
| **Bab 8 Perjalanan Kedua** | D2 + A2 + F♯3, 0,09 | **Mesin** (`hum` 90 Hz, 0,07) + **klik pendorong** (Tick 1–2/detik) + **semprot** (`hiss` highpass, 0,10) di lorong cuci | Ritme sabuk 90 BPM (ketuk halus 0,04) | 9 kHz | Ritmis, rapi, "bersih" |
| **Bab 9 Hidup Baru** | D2 + A2 + F♯3, 0,10 | Derak cacah (Tick rapat, 8/detik saat stasiun 1), desis tungku (`hiss` lowpass 2 kHz, 0,10 saat stasiun 3) | — | 8 kHz | Nada pad cerah A4 saat tote terbentuk |
| **Bab 10 Surat Terakhir** | D2 + A2 + F♯3 + D3, 0,08 | Napas ruang (`hum` 60 Hz sangat tipis) | — | 10 kHz | 10d: nada rendah D3 naik pelan ke A3 selama `t 0,42–0,72`; 10e: hanya drone lembut (0,05) |

Transisi antar profil: `crossfade` 1,2 detik (gain lapisan lama turun, lapisan baru naik) saat bab berganti; filter dunia berubah dengan `setTargetAtTime(…, 0.6)`.

---

## 5. SFX satu kali

| ID | Pemicu | Resep |
|---|---|---|
| `sfx.glug` | Bab 2, tiap 1/3 durasi minum | Derau → bandpass 500 Hz Q 4, envelope 120 ms, 3 kali |
| `sfx.whoosh` | Bab 2 lempar | Swell up 0,4 detik, 1 kHz → 4 kHz |
| `sfx.splash` | Bab 2/3 botol mendarat | Derau → highpass 800 Hz, envelope 250 ms, ditambah sinus 200 Hz turun |
| `sfx.crack` | Bab 5 retak | Klik pendek (derau 6 ms, highpass 3 kHz) acak amplitudo |
| `sfx.shatter` | Bab 5 `t 0,5` | Swell bandpass 3 kHz + burst derau 150 ms + ekor 0,6 detik |
| `sfx.chime` | Bab 7 awal ("Re:" menyala) | Note A4 triangle, attack 0,01, release 0,8 detik, gain 0,10 |
| **`sfx.thunk`** | **Bab 7 botol masuk** [DISEPAKATI] | Sinus 180 → 90 Hz selama 120 ms + derau lowpass 600 Hz 40 ms; gain 0,22; pantul kecil 60 ms kemudian (gain 0,08) |
| `sfx.lid` | Bab 7 tutup menutup | Klik lembut 30 ms |
| `sfx.piston` | Bab 8 | Derau pendek 50 ms lowpass 1,5 kHz |
| `sfx.spray` | Bab 8 lorong cuci | `hiss` highpass 3 kHz 1,2 detik |
| `sfx.warm` | Bab 9 tote terbentuk | Note A4 pad (attack 0,6) |

Semua SFX hanya diputar bila audio aktif dan **tidak diulang** bila pengunjung menggulir bolak-balik dalam 1 detik (anti-spam).

---

## 6. Pemetaan `shown` → parameter

```ts
// audio/audio-engine.ts (inti)
const UPDATE_HZ = 10;
function update(shown: number) {
  const { id, t } = segmentAt(shown);
  const profile = PROFILES[id];
  const g = profile.layers.map(l => l.gainAt(t));         // gain per lapisan sebagai fungsi t lokal
  setGain(layers, g, TC = 0.4);
  world.frequency.setTargetAtTime(profile.cutoffAt(t), now, 0.6);
  profile.events.forEach(e => { if (crossed(e.at, lastT, t)) e.fire(); });     // SFX terjadwal pada t tertentu
}
```
- Pemicu SFX: berdasarkan **lintas ambang `t`** (bukan waktu jam), sehingga sinkron dengan gulir. Mundur melewati ambang tidak memicu ulang (kecuali `sfx.chime` yang boleh).
- Kecepatan gulir sangat cepat: ratchet sudah membatasi `shown`, jadi jumlah SFX per detik terbatas.

---

## 7. Perilaku sistem

| Situasi | Perilaku |
|---|---|
| Halaman baru dibuka | Mati. Tombol suara menampilkan "Suara mati" |
| Klik tombol suara | `AudioContext` dibuat/di-`resume`; fade-in 1,5 detik; `aria-pressed="true"` |
| Menu terbuka | `ambient × 0,5` (duck, 0,3 detik) |
| Tab tersembunyi | `ctx.suspend()` |
| Pindah ke halaman selain Home | Fade-out 0,8 detik; tidak memutar apa pun (halaman lain senyap) |
| Kembali ke Home | Hanya melanjutkan bila `soundOn` dan sudah ada interaksi sebelumnya |
| Loop (reset) | Profil Bab 1 masuk dengan crossfade 0,4 detik (tanpa lonjakan) |
| `prefers-reduced-motion` | Audio **tidak** dimatikan otomatis (ini pilihan eksplisit pengguna), tetapi tidak ada bunyi kejut |
| Tanpa dukungan Web Audio | Tombol suara tidak ditampilkan |
| Pilihan tersimpan | `localStorage["rebottle:sound"]` (try/catch). **Tidak pernah memutar otomatis** |

---

## 8. Uji audio

- [ ] Tidak ada klik/pop saat dinyalakan/dimatikan/transisi.
- [ ] Puncak sinyal ≤ −6 dBFS di semua bab (periksa dengan `AnalyserNode`).
- [ ] Punchline terasa hening (hanya satu nada).
- [ ] SFX thunk sinkron dengan botol masuk (±80 ms).
- [ ] Menu terbuka menurunkan volume.
- [ ] Penggunaan CPU rata-rata < 4% di laptop menengah, < 10% di HP menengah (profiler).
- [ ] Tab tersembunyi tidak membuat suara.
- [ ] Gulir cepat bolak-balik tidak menimbulkan SFX berulang.
