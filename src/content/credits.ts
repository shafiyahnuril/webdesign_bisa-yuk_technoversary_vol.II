// Pencatatan lisensi dan atribusi. Tidak boleh ada aset tanpa baris di sini.
// Tambahkan baris baru setiap kali memakai paket atau aset baru, dan samakan tabel "Lisensi dan kredit" di README.
// TODO: keterangan penggunaan alat bantu ilustrasi menunggu info Pihak A; tidak ada klaim ditulis.
export interface Credit {
  type: "font" | "lib" | "illustration" | "audio";
  name: string;
  author?: string;
  license: string;
  url?: string;
  method?: string;
}

export const CREDITS: readonly Credit[] = [
  {
    type: "font",
    name: "Bricolage Grotesque",
    author: "Mathieu Triay",
    license: "SIL OFL 1.1",
    url: "https://github.com/ateliertriay/bricolage",
  },
  {
    type: "font",
    name: "Instrument Sans",
    author: "Instrument",
    license: "SIL OFL 1.1",
    url: "https://github.com/Instrument/instrument-sans",
  },
  {
    type: "font",
    name: "Caveat",
    author: "Impallari Type",
    license: "SIL OFL 1.1",
    url: "https://github.com/googlefonts/caveat",
  },
  {
    type: "font",
    name: "JetBrains Mono",
    author: "JetBrains",
    license: "SIL OFL 1.1",
    url: "https://github.com/JetBrains/JetBrainsMono",
  },
  { type: "lib", name: "react", license: "MIT", url: "https://react.dev" },
  { type: "lib", name: "react-router-dom", license: "MIT", url: "https://reactrouter.com" },
  { type: "lib", name: "three", license: "MIT", url: "https://github.com/mrdoob/three.js" },
  {
    type: "lib",
    name: "gsap",
    license: "Gratis (lisensi standar GSAP, tanpa biaya)",
    url: "https://gsap.com",
  },
  {
    type: "illustration",
    name: "Sampul artikel (12) dan panel statis (11)",
    author: "Tim Re:bottle",
    method: "TODO: isi metode pembuatan (SVG buatan tim)",
    license: "Hak milik tim",
  },
  {
    type: "audio",
    name: "Audio ambient dan SFX",
    author: "Tim Re:bottle",
    method: "Sintesis Web Audio (kode)",
    license: "Hak milik tim",
  },
];
