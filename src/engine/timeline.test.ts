import { describe, expect, it } from "vitest";
import { TEMP } from "@/lib/tokens";
import {
  PUNCH,
  STARTS,
  TOTAL_VH,
  babakAt,
  chapterAt,
  localT,
  segmentAt,
  temperatureAt,
  viewAt,
} from "./timeline";

describe("timeline", () => {
  it("total gulir 2240 vh", () => {
    expect(TOTAL_VH).toBe(2240);
  });

  it("STARTS sesuai tabel docs/03", () => {
    expect(STARTS.b1).toBe(0);
    expect(STARTS.b2).toBeCloseTo(0.0625, 4);
    expect(STARTS.b3).toBeCloseTo(0.1429, 4);
    expect(PUNCH.from).toBeCloseTo(0.5179, 4);
    expect(PUNCH.to).toBeCloseTo(0.5982, 4);
    expect(STARTS.b10).toBeCloseTo(0.8304, 4);
  });

  it("shown = 0 -> bab 1, t = 0", () => {
    expect(chapterAt(0)).toBe(1);
    expect(localT(0, 1)).toBe(0);
    expect(segmentAt(0).id).toBe("b1");
  });

  it("awal bab 2 tepat berpindah ke bab 2", () => {
    expect(chapterAt(STARTS.b2)).toBe(2);
    expect(chapterAt(STARTS.b2 - 1e-6)).toBe(1);
    expect(localT(STARTS.b2, 2)).toBe(0);
  });

  it("PUNCH.to -> bab 7 dan babak II", () => {
    expect(chapterAt(PUNCH.to)).toBe(7);
    expect(babakAt(PUNCH.to)).toBe(2);
    expect(viewAt(PUNCH.to)).toBe("2");
    expect(localT(PUNCH.to, 7)).toBe(0);
  });

  it("punchline: babak 0, dibagi dua antara bab 6 dan 7", () => {
    expect(babakAt(PUNCH.from)).toBe(0);
    expect(viewAt(PUNCH.from)).toBe("none");
    expect(chapterAt(PUNCH.from)).toBe(6);
    expect(chapterAt((PUNCH.from + PUNCH.to) / 2 + 1e-6)).toBe(7);
  });

  it("shown = 1 -> bab 10, t = 1", () => {
    expect(chapterAt(1)).toBe(10);
    expect(localT(1, 10)).toBe(1);
    expect(segmentAt(1).t).toBe(1);
  });

  it("localT dijepit di luar rentang bab", () => {
    expect(localT(0.9, 3)).toBe(1);
    expect(localT(0, 5)).toBe(0);
  });

  it("temperatureAt mengikuti tabel TEMP dan dataran 70/30 di Babak I", () => {
    expect(temperatureAt(-0.5)).toBe(TEMP.c1);
    expect(temperatureAt(0)).toBe(TEMP.c1);
    expect(temperatureAt(STARTS.b1 + (STARTS.b2 - STARTS.b1) * 0.5)).toBe(TEMP.c1);
    expect(temperatureAt(STARTS.b2)).toBe(TEMP.c2);
    expect(temperatureAt(STARTS.b3)).toBe(TEMP.c3);
    expect(temperatureAt(STARTS.b4)).toBe(TEMP.c4);
    expect(temperatureAt(STARTS.b5)).toBe(TEMP.c5);
    expect(temperatureAt(STARTS.b6)).toBe(TEMP.c6);
    expect(temperatureAt(STARTS.b6 + (PUNCH.from - STARTS.b6) * 0.9)).toBe(TEMP.c6);
  });

  it("temperatureAt melakukan rewind di punchline (t 0.08..0.40) lalu konsisten +1.5°C di Babak II", () => {
    const span = PUNCH.to - PUNCH.from;
    expect(temperatureAt(PUNCH.from)).toBe(TEMP.cp0);
    expect(temperatureAt(PUNCH.from + span * 0.08)).toBe(TEMP.cp0);
    const midRewind = temperatureAt(PUNCH.from + span * 0.24);
    expect(midRewind).toBeLessThan(TEMP.cp0);
    expect(midRewind).toBeGreaterThan(TEMP.cp1);
    expect(temperatureAt(PUNCH.from + span * 0.4)).toBe(TEMP.cp1);
    expect(temperatureAt(PUNCH.from + span * 0.8)).toBe(TEMP.cp1);
    expect(temperatureAt(PUNCH.to)).toBe(TEMP.c7);
    expect(temperatureAt(STARTS.b8)).toBe(TEMP.c8);
    expect(temperatureAt(STARTS.b9)).toBe(TEMP.c9);
    expect(temperatureAt(STARTS.b10)).toBe(TEMP.c10);
    expect(temperatureAt(1)).toBe(TEMP.c10);
    expect(temperatureAt(1.5)).toBe(TEMP.c10);
  });
});

