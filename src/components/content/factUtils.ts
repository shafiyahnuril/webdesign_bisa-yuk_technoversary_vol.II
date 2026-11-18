import type { Fact } from "@/content/facts";

/** Fakta hanya boleh tampil bila terverifikasi dan bernilai (docs/00 bagian 4, 11 bagian 6). */
export function isShowable(fact: Fact): boolean {
  return fact.verified && fact.value !== null;
}

/** Angka berformat Indonesia (koma desimal). */
export function formatNumber(n: number, decimals = 0): string {
  return n.toLocaleString("id-ID", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function formatFactValue(fact: Fact): string {
  const v = fact.value;
  const text = typeof v === "number" ? formatNumber(v, decimalsOf(String(v))) : (v ?? "");
  return `${text}${fact.unit ? ` ${fact.unit}` : ""}`.trim();
}

/** Mengisi penanda {X} pada kalimat fakta dengan nilai yang sudah diformat. */
export function fillStatement(fact: Fact): string {
  return fact.statement.replace("{X}", formatFactValue(fact));
}

function decimalsOf(text: string): number {
  return /[.,](\d+)/.exec(text)?.[1]?.length ?? 0;
}

export interface FactParts {
  /** Teks kecil sebelum angka (mis. "lebih dari"). */
  prefix: string;
  /** Angka yang dihitung naik; null bila nilai bukan angka. */
  number: number | null;
  decimals: number;
  /** Penutup yang menempel pada angka (mis. "%"). */
  suffix: string;
  /** Satuan kecil di bawah angka. */
  unit: string;
  /** Nilai akhir bila bukan angka. */
  text: string;
}

/** Memecah nilai fakta menjadi prefiks, angka, sufiks, dan satuan untuk tampilan kartu. */
export function factParts(fact: Fact): FactParts {
  const unit = fact.unit ?? "";
  const v = fact.value;
  if (typeof v === "number") {
    return { prefix: "", number: v, decimals: decimalsOf(String(v)), suffix: "", unit, text: String(v) };
  }
  const text = v ?? "";
  const m = /^(\D*?)(\d+(?:[.,]\d+)?)(\D*)$/.exec(text);
  if (!m) return { prefix: "", number: null, decimals: 0, suffix: "", unit, text };
  const raw = m[2] ?? "";
  return {
    prefix: (m[1] ?? "").trim(),
    number: Number(raw.replace(",", ".")),
    decimals: decimalsOf(raw),
    suffix: (m[3] ?? "").trim(),
    unit,
    text,
  };
}
