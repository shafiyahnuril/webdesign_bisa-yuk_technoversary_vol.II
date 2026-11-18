import { FACTS, type Fact, type FactKey } from "@/content/facts";

/** Fakta hanya boleh tampil bila terverifikasi dan bernilai (docs/00 bagian 4, 11 bagian 6). */
export function isShowable(fact: Fact): boolean {
  return fact.verified && fact.value !== null;
}

export function formatFactValue(fact: Fact): string {
  return `${fact.value ?? ""}${fact.unit ? ` ${fact.unit}` : ""}`.trim();
}

/** Mengisi penanda {X} pada kalimat fakta dengan nilai yang sudah diformat. */
export function fillStatement(fact: Fact): string {
  return fact.statement.replace("{X}", formatFactValue(fact));
}

/** Props FactBlock untuk satu kunci fakta (nilai kosong bila belum terverifikasi). */
export function factProps(key: FactKey) {
  const fact: Fact = FACTS[key];
  const ok = isShowable(fact);
  return {
    value: ok ? formatFactValue(fact) : "",
    label: ok ? fillStatement(fact) : fact.statement,
    source: { id: key },
  };
}
