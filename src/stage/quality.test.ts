import { describe, expect, it, vi } from "vitest";
import { parseQualityParam, QUALITY_PRESETS, QualityManager, type QualityTier } from "./quality";

describe("QualityManager", () => {
  it("memparsing parameter ?q= dan menyediakan preset 06/09 dengan benar", () => {
    expect(parseQualityParam("?q=low")).toBe("low");
    expect(parseQualityParam("?q=MEDIUM")).toBe("medium");
    expect(parseQualityParam("?q=high")).toBe("high");
    expect(parseQualityParam("?q=ultra")).toBeNull();

    expect(QUALITY_PRESETS.high).toMatchObject({
      dprCap: 2,
      particles: 2400,
      waterSegments: 160,
      bottleSegments: 48,
      transmission: true,
    });
    expect(QUALITY_PRESETS.medium).toMatchObject({
      dprCap: 1.5,
      particles: 1400,
      waterSegments: 110,
      bottleSegments: 32,
      transmission: true,
    });
    expect(QUALITY_PRESETS.low).toMatchObject({
      dprCap: 1,
      particles: 800,
      waterSegments: 64,
      bottleSegments: 20,
      transmission: false,
    });
  });

  it("menurunkan tier otomatis setelah 90 frame dan < 45 FPS selama 2 detik dengan cooldown 6 detik, tanpa naik otomatis", () => {
    const qm = new QualityManager("high");
    const changes: QualityTier[] = [];
    qm.subscribe((tier) => changes.push(tier));

    // 89 frame pada 30 FPS (dt = 1/30) -> belum memenuhi jendela 90 frame
    const slowDt = 1 / 30;
    for (let i = 0; i < 89; i++) {
      expect(qm.recordFrame(slowDt)).toBeNull();
    }
    expect(qm.tier).toBe("high");

    // Tambah 59 frame lagi (< 2 detik sejak jendela 90 terisi) -> belum turun
    for (let i = 0; i < 59; i++) {
      qm.recordFrame(slowDt);
    }
    expect(qm.tier).toBe("high");

    // Lewati ambang 2 detik sustained < 45 FPS -> turun ke medium
    const firstDown = qm.recordFrame(slowDt);
    expect(firstDown).toBe("medium");
    expect(qm.tier).toBe("medium");

    // Selama cooldown 6 detik (< 6s), meski FPS lambat, tidak turun lagi
    for (let i = 0; i < 160; i++) {
      expect(qm.recordFrame(slowDt)).toBeNull();
    }
    expect(qm.tier).toBe("medium");

    // Lanjutkan melewati cooldown 6s + jendela 90 frame + 2s -> turun ke low
    for (let i = 0; i < 180; i++) {
      qm.recordFrame(slowDt);
    }
    expect(qm.tier).toBe("low");
    expect(changes).toEqual(["medium", "low"]);

    // FPS pulih ke 60 FPS dalam waktu lama -> tidak pernah naik otomatis
    for (let i = 0; i < 600; i++) {
      expect(qm.recordFrame(1 / 60)).toBeNull();
    }
    expect(qm.tier).toBe("low");
  });

  it("tidak menurunkan tier jika dipaksa lewat ?q=", () => {
    const qm = new QualityManager("high", { forced: true });
    for (let i = 0; i < 400; i++) {
      expect(qm.recordFrame(1 / 20)).toBeNull();
    }
    expect(qm.tier).toBe("high");
  });

  it("mereset akumulasi waktu lambat jika FPS kembali >= 45", () => {
    const qm = new QualityManager("high");
    const slowDt = 1 / 30;
    const fastDt = 1 / 60;
    const spy = vi.fn();
    qm.subscribe(spy);

    // 90 frame mengisi jendela + 20 frame lambat (~0.67s < 2s)
    for (let i = 0; i < 110; i++) qm.recordFrame(slowDt);
    // Pulih ke 60 FPS sebelum total durasi lambat menyentuh 2 detik
    for (let i = 0; i < 90; i++) qm.recordFrame(fastDt);

    expect(qm.tier).toBe("high");
    expect(spy).not.toHaveBeenCalled();
  });
});
