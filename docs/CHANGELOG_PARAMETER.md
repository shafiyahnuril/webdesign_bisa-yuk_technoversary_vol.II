# Perubahan parameter

Revisi 18 November 2026 berdasarkan evaluasi pengguna terhadap gulir yang terlalu cepat. Angka merupakan prototipe; belum menggantikan pengujian perangkat fisik.

| Parameter | Awal | Sekarang | Verifikasi |
|---|---|---|---|
| MAX_SPEED_VH | 70 | 40 vh/detik | Unit 60/120/144 Hz dan batas dua arah |
| CHASE | 8 | 4,5 | Pendekatan eksponensial berbasis dt |
| LENGTHS_VH | 2240 total | 4480 total (setiap segmen ×2) | STARTS dan rasio keyframe tetap |
| Wheel | native | normalisasi deltaMode, ×0,55; satu event maksimum 0,4 viewport sebelum gain | Regresi input wheel besar |
| Sentuh | native | ×0,8 | Pergerakan mengikuti jarak jari |
| Antrean pointer | tidak dibatasi | ±0,9 viewport dari shown | Regresi burst tanpa frame tambahan |
| GAIN loop | 1/1400 | 1/1400 | Gestur loop tetap terpisah dari wheel cerita |
| REST_DELAY loop | 90 ms | 350 ms | Jeda antar-input lebih toleran; tarikan penuh diproses sebelum decay |
| DECAY loop | 0,12 | 0,12 per 60 Hz, dinormalisasi dt | Unit loop gesture |

Tidak memakai ScrollTrigger kedua: engine dan seluruh tampilan tetap berbagi satu shown dan ticker GSAP. Input pointer Home sengaja non-passive agar sentakan dinormalisasi; scroll/resize dan mode statis tetap mengikuti perilaku browser. Pengukuran mouse/trackpad dan HP fisik masih diperlukan untuk penyetelan lanjutan.

## Koreksi gerak dan bahan

B3–B5 menggunakan fase gelombang berbasis waktu, terpisah dari progres gulir. B3/B4 memakai redaman kritis posisi dan slerp dengan batas kemiringan ±5°; B5 menghapus getaran berfrekuensi tinggi. Pengujian mencakup scrub maju-mundur, reset, dt=0, serta sampling CPU dan shader air.

Pakaian memakai shell kain bervolume dengan bahu/lengan jatuh, lipatan gravitasi, kelim melengkung, dan flutter maksimum 0,004 unit. Tas memakai sag; kayu, keramik, dan metal tetap rigid. Normal kain diperkecil menjadi 0,14–0,20 dan anyaman diperkecil skalanya agar tidak tampak seperti permukaan plastik timbul.
