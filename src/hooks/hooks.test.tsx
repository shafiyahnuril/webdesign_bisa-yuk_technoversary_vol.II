import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { storySignals } from "@/engine/signal";
import { useDocumentMeta } from "./useDocumentMeta";
import { useStorySignals } from "./useSignal";

describe("hooks", () => {
  it("useDocumentMeta mengatur judul dan deskripsi", () => {
    renderHook(() => useDocumentMeta("Judul Uji | Re:bottle", "deskripsi uji"));
    expect(document.title).toBe("Judul Uji | Re:bottle");
    expect(document.querySelector('meta[name="description"]')?.getAttribute("content")).toBe(
      "deskripsi uji",
    );
  });

  it("useStorySignals mengikuti perubahan store", () => {
    const { result } = renderHook(() => useStorySignals());
    expect(result.current.chapter).toBe(1);
    act(() => storySignals.set({ ...storySignals.get(), chapter: 3 }));
    expect(result.current.chapter).toBe(3);
    act(() => storySignals.set({ ...storySignals.get(), chapter: 1 }));
  });
});
