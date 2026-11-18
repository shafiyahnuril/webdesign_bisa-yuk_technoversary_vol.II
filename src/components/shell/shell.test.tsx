import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { createStoryEngine } from "@/engine/story-engine";
import { AppShell } from "./AppShell";
import { Navbar } from "./Navbar";

describe("Navbar & MenuPanel", () => {
  beforeEach(() => {
    document.documentElement.style.overflow = "";
    delete document.documentElement.dataset.re;
  });

  it("membuka panel menu, memasang inert hanya pada main, mengunci fokus, dan menutup dengan Escape", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AppShell>
          <Routes>
            <Route path="/" element={<div data-testid="home-content">Isi Home</div>} />
            <Route path="/about" element={<div data-testid="about-content">Isi About</div>} />
          </Routes>
        </AppShell>
      </MemoryRouter>,
    );

    const mainEl = document.getElementById("main")!;
    const menuBtn = screen.getByRole("button", { name: "Buka menu" });
    expect(menuBtn.getAttribute("aria-expanded")).toBe("false");
    expect(mainEl.hasAttribute("inert")).toBe(false);

    // Buka menu
    fireEvent.click(menuBtn);

    const closeBtn = screen.getByRole("button", { name: "Tutup menu" });
    expect(closeBtn.getAttribute("aria-expanded")).toBe("true");
    expect(mainEl.hasAttribute("inert")).toBe(true);
    expect(document.documentElement.style.overflow).toBe("hidden");

    const dialog = screen.getByRole("dialog", { name: "Menu" });
    const menuLinks = dialog.querySelectorAll<HTMLAnchorElement>("a[href]");
    expect(menuLinks.length).toBeGreaterThanOrEqual(4);

    // Fokus awal pindah ke tautan pertama di dalam panel
    expect(document.activeElement).toBe(menuLinks[0]);

    // Shift+Tab dari tautan pertama berputar ke tombol tutup di navbar
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(closeBtn);

    // Tab dari tombol tutup kembali ke tautan pertama
    fireEvent.keyDown(document, { key: "Tab", shiftKey: false });
    expect(document.activeElement).toBe(menuLinks[0]);

    // Tekan Escape menutup menu dan mengembalikan fokus ke tombol bulat
    fireEvent.keyDown(document, { key: "Escape" });
    expect(closeBtn.getAttribute("aria-expanded")).toBe("false");
    expect(mainEl.hasAttribute("inert")).toBe(false);
    expect(document.documentElement.style.overflow).toBe("");
    expect(document.activeElement).toBe(closeBtn);
  });

  it("klik Home saat sudah di Home hanya menutup menu tanpa mereset cerita", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AppShell>
          <div>Konten</div>
        </AppShell>
      </MemoryRouter>,
    );

    const menuBtn = screen.getByRole("button", { name: "Buka menu" });
    fireEvent.click(menuBtn);

    const dialog = screen.getByRole("dialog", { name: "Menu" });
    const homeLink = dialog.querySelector<HTMLAnchorElement>('a[href="/"]')!;
    fireEvent.click(homeLink);

    expect(menuBtn.getAttribute("aria-expanded")).toBe("false");
  });

  it("menerapkan histeresis shown 0.003 / 0.01 pada Navbar varian home", () => {
    window.scrollTo = () => {};
    let tickFn: ((dt: number) => void) | null = null;
    const engine = createStoryEngine({
      scheduler: {
        add(fn) {
          tickFn = fn;
          return () => {
            tickFn = null;
          };
        },
      },
    });

    const stageRoot = document.createElement("div");
    document.body.appendChild(stageRoot);
    Object.defineProperty(document.documentElement, "scrollHeight", {
      value: 10000,
      configurable: true,
    });
    Object.defineProperty(window, "innerHeight", { value: 1000, configurable: true });
    engine.mount(stageRoot);

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Navbar variant="home" engine={engine} />
      </MemoryRouter>,
    );

    const header = document.querySelector("header[data-variant='home']")!;
    expect(header.getAttribute("data-nav")).toBe("open");

    // Majukan shown melewati 0.01 -> collapsed
    Object.defineProperty(window, "scrollY", { value: 500, configurable: true });
    window.dispatchEvent(new Event("scroll"));
    act(() => {
      for (let i = 0; i < 30; i++) tickFn?.(1 / 60);
    });
    expect(engine.state.shown).toBeGreaterThan(0.01);
    expect(header.getAttribute("data-nav")).toBe("collapsed");

    // Turunkan ke 0.006 (di antara 0.003 dan 0.01) -> tetap collapsed (histeresis)
    Object.defineProperty(window, "scrollY", { value: 54, configurable: true });
    window.dispatchEvent(new Event("scroll"));
    act(() => {
      for (let i = 0; i < 40; i++) tickFn?.(1 / 60);
    });
    expect(engine.state.shown).toBeGreaterThan(0.003);
    expect(engine.state.shown).toBeLessThan(0.01);
    expect(header.getAttribute("data-nav")).toBe("collapsed");

    // Turunkan ke < 0.003 -> terbuka kembali
    Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
    window.dispatchEvent(new Event("scroll"));
    act(() => {
      for (let i = 0; i < 40; i++) tickFn?.(1 / 60);
    });
    expect(engine.state.shown).toBeLessThan(0.003);
    expect(header.getAttribute("data-nav")).toBe("open");

    engine.unmount();
    stageRoot.remove();
  });
});
