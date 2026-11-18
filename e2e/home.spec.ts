import { test, expect } from "@playwright/test";

// Server produksi default dari playwright.config.ts berada di http://localhost:4173,
// sedangkan server Vite DEV resmi berada di http://localhost:4174 (menyediakan ?debug & window.__REBOTTLE_RUNTIME__).
const DEV_BASE = "http://localhost:4174";

interface DevRuntimeWindow extends Window {
  __REBOTTLE_RUNTIME__?: {
    engine: {
      pause(): void;
      resume(): void;
      preview?(progress: number): void;
    };
  };
}

test.describe("Home Re:bottle — 3D, Input, Keyframe, Fallback, & Rute", () => {
  test("(1) Home 3D memasang canvas[data-ready], memudarkan poster, menampilkan label skenario hero, data-re=off, dan menyembunyikan scrollbar", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/#/");

    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-story-mode", "3d");
    await expect(html).toHaveAttribute("data-re", "off");

    // Canvas 3D benar-benar siap
    const canvas = page.locator("canvas[data-capture-stage]");
    await expect(canvas).toHaveAttribute("data-ready", "true", { timeout: 15_000 });

    // Poster awal tetap di DOM tetapi memudar ke opacity 0
    const poster = page.locator("[data-story-poster]");
    await expect(poster).toBeAttached();
    await expect
      .poll(async () =>
        poster.evaluate((el) => Number(getComputedStyle(el).opacity)),
      )
      .toBeLessThan(0.05);

    // Label skenario wajib di hero
    const scenario = page.locator("[data-scenario-label]");
    await expect(scenario).toContainText(
      "Skenario jika pola konsumsi plastik terus berlanjut.",
    );

    // Scrollbar hanya disembunyikan pada mode 3D
    const scrollbarStyle = await html.evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        scrollbarWidth: s.scrollbarWidth,
        overscrollBehaviorY: s.overscrollBehaviorY,
      };
    });
    expect(scrollbarStyle.scrollbarWidth).toBe("none");
    expect(scrollbarStyle.overscrollBehaviorY).toBe("none");
    expect(errors).toEqual([]);
  });

  test("(2) Gulir cepat & tombol End/Home/PageDown tetap dibatasi kecepatan ratchet, serta Navbar collapse mengikuti histeresis dua ambang", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/#/");
    await expect(page.locator("canvas[data-capture-stage]")).toHaveAttribute(
      "data-ready",
      "true",
      { timeout: 15_000 },
    );

    const nav = page.locator("header[data-nav]");
    await expect(nav).toHaveAttribute("data-nav", "open");

    // 1. Tombol End dan Home dicegah (preventDefault) agar bab tidak dapat dilompati instan
    await page.keyboard.press("End");
    await page.waitForTimeout(80);
    const scrollAfterEnd = await page.evaluate(() => window.scrollY);
    expect(scrollAfterEnd).toBe(0);
    await expect(page.locator("[data-story-root]")).toHaveAttribute(
      "data-active-chapter",
      "1",
    );

    // 2. PageDown menggerakkan gulir ke bawah secara terkendali (~0.9 * vh)
    await page.keyboard.press("PageDown");
    await expect
      .poll(async () => page.evaluate(() => window.scrollY))
      .toBeGreaterThan(500);

    // Setelah shown melewati ambang 0.01, navbar terlipat (collapsed) dan tautan keluar dari urutan Tab
    await expect(nav).toHaveAttribute("data-nav", "collapsed", {
      timeout: 5_000,
    });
    const firstNavLink = nav.locator("nav a").first();
    await expect(firstNavLink).toHaveAttribute("tabindex", "-1");

    // 3. Gulir kembali ke puncak (scrollY = 0); navbar terbuka kembali setelah shown turun di bawah ambang 0.003
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(nav).toHaveAttribute("data-nav", "open", {
      timeout: 6_000,
    });
    await expect(firstNavLink).toHaveAttribute("tabindex", "0");

    // 4. Gulir cepat ke ujung bawah dokumen: walaupun scrollY langsung di maxScroll, ratchet menahan shown agar tidak langsung melompat ke Bab 10
    await page.evaluate(() => {
      window.scrollTo(0, document.documentElement.scrollHeight);
    });
    await page.waitForTimeout(120);
    const stateDuringFastScroll = await page.evaluate(() => {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollRatio = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      const chapter = Number(
        document
          .querySelector("[data-story-root]")
          ?.getAttribute("data-active-chapter") ?? "1",
      );
      return { scrollRatio, chapter };
    });
    expect(stateDuringFastScroll.scrollRatio).toBeGreaterThan(0.95);
    expect(stateDuringFastScroll.chapter).toBeLessThan(3);
  });

  test("(3) MenuPanel menjeda cerita, memasang inert hanya pada main, mengunci fokus, menutup dengan Escape, dan klik Home di menu tidak mereset cerita", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/#/");
    await expect(page.locator("canvas[data-capture-stage]")).toHaveAttribute(
      "data-ready",
      "true",
      { timeout: 15_000 },
    );

    // Gulir sedikit agar posisi tidak di 0
    await page.evaluate(() => window.scrollTo(0, 1200));
    await page.waitForTimeout(450);
    const scrollBeforeMenu = await page.evaluate(() => window.scrollY);
    expect(scrollBeforeMenu).toBeGreaterThan(200);

    const menuBtn = page.locator('button[aria-controls="menu-panel"]');
    await menuBtn.click();

    const menuPanel = page.locator("#menu-panel");
    await expect(menuPanel).toHaveAttribute("data-open", "true");

    // Hanya <main id="main"> yang diberi inert; header navbar tidak inert
    const inertCheck = await page.evaluate(() => ({
      mainInert: document.getElementById("main")?.hasAttribute("inert") ?? false,
      headerInert:
        document.querySelector("header[data-nav]")?.hasAttribute("inert") ??
        false,
    }));
    expect(inertCheck.mainInert).toBe(true);
    expect(inertCheck.headerInert).toBe(false);

    // Focus trap berada di dalam menuPanel atau menuBtn
    const focusInside = await page.evaluate(() => {
      const active = document.activeElement;
      const panel = document.getElementById("menu-panel");
      const btn = document.querySelector('button[aria-controls="menu-panel"]');
      return Boolean(
        active && (panel?.contains(active) || btn?.contains(active)),
      );
    });
    expect(focusInside).toBe(true);

    // Tekan Escape menutup menu dan mengembalikan fokus ke tombol menu
    await page.keyboard.press("Escape");
    await expect(menuPanel).toHaveAttribute("data-open", "false");
    const mainInertAfterClose = await page.evaluate(
      () => document.getElementById("main")?.hasAttribute("inert") ?? false,
    );
    expect(mainInertAfterClose).toBe(false);

    // Buka lagi dan klik tautan Home saat sudah berada di Home -> hanya menutup menu tanpa mereset scroll/cerita
    await menuBtn.click();
    await expect(menuPanel).toHaveAttribute("data-open", "true");
    await menuPanel.locator('a[href="#/"]').click();
    await expect(menuPanel).toHaveAttribute("data-open", "false");

    const scrollAfterHomeClick = await page.evaluate(() => window.scrollY);
    expect(scrollAfterHomeClick).toBeGreaterThan(200);
  });

  test("(4) Pemeriksaan keyframe DEV via engine.preview pada B6 (tanpa TODO/{X}/Sekian persen), Punch/B7 data-re=on, B10 CTA, dan gestur loop wheel nyata mereset ke 0", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${DEV_BASE}/?debug=1#/`);
    await expect(page.locator("canvas[data-capture-stage]")).toHaveAttribute(
      "data-ready",
      "true",
      { timeout: 15_000 },
    );

    await page.waitForFunction(() =>
      Boolean((window as DevRuntimeWindow).__REBOTTLE_RUNTIME__?.engine?.preview),
    );

    const previewAt = async (progress: number) => {
      await page.evaluate((p) => {
        const eng = (window as DevRuntimeWindow).__REBOTTLE_RUNTIME__?.engine;
        eng?.pause();
        eng?.preview?.(p);
      }, progress);
    };

    // 1. Keyframe Bab 6 (shown = 0.455, berada di plateau teks B6: 0.4196..0.5179)
    await previewAt(0.455);
    const b6Segment = page.locator('[data-story-segment="b6"]');
    await expect(b6Segment).toBeVisible();
    await expect(b6Segment).toContainText(
      "Mikroplastik kini ditemukan di makanan dan minuman kita.",
    );
    const allStageText =
      (await page.locator("[data-story-stage]").textContent()) ?? "";
    expect(allStageText).not.toContain("TODO");
    expect(allStageText).not.toContain("{X}");
    expect(allStageText).not.toContain("Sekian persen");

    // 2. Keyframe Punchline (shown = 0.567, t ≈ 0.61 di dalam punch: 0.5179..0.5982): teks punchline terlihat, data-re masih off
    await previewAt(0.567);
    await expect(page.locator('[data-story-segment="punch"]')).toBeVisible();
    await expect(page.locator('[data-story-segment="punch"]')).toContainText(
      "Bagaimana jika semua ini tidak terjadi?",
    );
    await expect(page.locator("html")).toHaveAttribute("data-re", "off");

    // 3. Keyframe Bab 7 (shown = 0.629, t ≈ 0.50 di dalam b7: 0.5982..0.6607): Babak II menyalakan data-re="on" dan surat Caveat
    await previewAt(0.629);
    await expect(page.locator("html")).toHaveAttribute("data-re", "on");
    await expect(
      page.locator('[data-story-segment="b7"] [data-letter-card]'),
    ).toContainText("Kamu tidak membuangku ke sungai. Terima kasih.");

    // 4. Keyframe Bab 10 akhir (shown = 1.0) untuk memeriksa CTA, lalu resume engine dan jalankan gestur wheel loop nyata
    await previewAt(1.0);
    await expect(page.locator("[data-cta-closing]")).toContainText(
      "Bawa botolmu besok.",
    );
    await expect(page.locator("html")).toHaveAttribute("data-re", "on");

    await page.evaluate(() => {
      (window as DevRuntimeWindow).__REBOTTLE_RUNTIME__?.engine.resume();
    });

    // Kirim rentetan wheel deltaY positif (> 1400px tanpa melampaui REST_DELAY 90ms) untuk menarik kubah loop hingga penuh
    await page.mouse.move(720, 450);
    for (let i = 0; i < 8; i += 1) {
      await page.mouse.wheel(0, 300);
    }

    // Loop dome selesai -> storyEngine.reset() mengembalikan data-re="off", bab 1, dan navbar terbuka
    await expect(page.locator("html")).toHaveAttribute("data-re", "off", {
      timeout: 5_000,
    });
    await expect(page.locator("[data-story-root]")).toHaveAttribute(
      "data-active-chapter",
      "1",
    );
    await expect(page.locator("header[data-nav]")).toHaveAttribute(
      "data-nav",
      "open",
    );
  });

  test("(5) prefers-reduced-motion merender StaticStory tanpa memuat chunk Three.js, membuka panel berurutan 1,2 detik, dan mereset di akhir", async ({
    page,
  }) => {
    const requestedUrls: string[] = [];
    page.on("request", (req) => requestedUrls.push(req.url()));

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/#/");

    await expect(page.locator("html")).toHaveAttribute(
      "data-story-mode",
      "static",
    );
    const staticRoot = page.locator("[data-static-story]");
    await expect(staticRoot).toBeVisible();

    // Tidak ada canvas 3D dan tidak ada request jaringan ke chunk three-*.js atau modul stage 3D
    await expect(page.locator("canvas[data-capture-stage]")).toHaveCount(0);
    const loadedThreeChunk = requestedUrls.some(
      (url) =>
        /node_modules\/\.vite\/deps\/three/i.test(url) ||
        /\/assets\/three-.*\.js/i.test(url) ||
        /\/src\/stage\/(stage|director|scenes)/i.test(url),
    );
    expect(loadedThreeChunk).toBe(false);

    // Awal: hanya 2 panel yang terbuka (b1 & b2), tanpa tombol bypass
    await expect(page.locator("[data-static-panel]")).toHaveCount(2);
    await expect(page.locator("[data-static-unlock-next]")).toHaveCount(0);

    // Gulir ke panel 2 hingga terlihat >= 60%: sebelum 1,2 detik belum membuka panel 3, setelah >= 1,2 detik membuka panel 3
    await page
      .locator('[data-static-panel="b2"]')
      .scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await expect(page.locator("[data-static-panel]")).toHaveCount(2);

    await expect(page.locator("[data-static-panel]")).toHaveCount(3, {
      timeout: 3_000,
    });

    // Buka berurutan hingga panel ke-11
    const panelIds = [
      "b3",
      "b4",
      "b5",
      "b6",
      "punch",
      "b7",
      "b8",
      "b9",
      "b10",
    ];
    for (let i = 0; i < panelIds.length; i += 1) {
      const id = panelIds[i]!;
      const panelLoc = page.locator(`[data-static-panel="${id}"]`);
      await expect(panelLoc).toBeVisible({ timeout: 3_500 });
      await panelLoc.scrollIntoViewIfNeeded();
      if (i < panelIds.length - 1) {
        await expect(page.locator("[data-static-panel]")).toHaveCount(i + 4, {
          timeout: 3_500,
        });
      }
    }

    // Pada panel 11 (Bab 10), data-re="on" dan tombol Mulai dari awal tersedia
    await expect(page.locator("html")).toHaveAttribute("data-re", "on");
    const restartBtn = page.locator("[data-static-restart]");
    await expect(restartBtn).toBeVisible();
    await restartBtn.click();

    // Setelah direset: kembali ke 2 panel, data-re="off", fokus kembali ke judul panel 1
    await expect(page.locator("[data-static-panel]")).toHaveCount(2);
    await expect(page.locator("html")).toHaveAttribute("data-re", "off");
    const focusedId = await page.evaluate(() => document.activeElement?.id);
    expect(focusedId).toBe("static-panel-title-b1");
  });

  test("(6) webglcontextlost pada kanvas 3D mengalihkan halaman ke StaticStory secara mulus", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/#/");

    const canvas = page.locator("canvas[data-capture-stage]");
    await expect(canvas).toHaveAttribute("data-ready", "true", {
      timeout: 15_000,
    });

    // Simulasikan event webglcontextlost pada elemen canvas
    await canvas.evaluate((el) => {
      const evt = new Event("webglcontextlost", { cancelable: true });
      el.dispatchEvent(evt);
    });

    await expect(page.locator("html")).toHaveAttribute(
      "data-story-mode",
      "static",
    );
    await expect(page.locator("[data-static-story]")).toBeVisible();
  });

  test("(7) Navigasi Home -> About / Konten / Contact / 404 -> Home memulihkan warna, font, data-re, scroll, menghentikan kanvas, serta bebas overflow horizontal di mobile 390px", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/#/");
    await expect(page.locator("canvas[data-capture-stage]")).toHaveAttribute(
      "data-ready",
      "true",
      { timeout: 15_000 },
    );

    const nonHomeChecks = [
      { hash: "#/about", pageAttr: "about", expectedBg: "rgb(31, 79, 94)" },
      { hash: "#/konten", pageAttr: "konten", expectedBg: "rgb(232, 239, 229)" },
      { hash: "#/contact", pageAttr: "contact", expectedBg: "rgb(20, 64, 63)" },
      {
        hash: "#/halaman-tidak-ada",
        pageAttr: "notfound",
        expectedBg: "rgb(11, 43, 128)",
      },
    ];

    for (const item of nonHomeChecks) {
      await page.goto(`/${item.hash}`);
      await expect(page.locator("html")).toHaveAttribute(
        "data-page",
        item.pageAttr,
      );
      await expect(page.locator("html")).toHaveAttribute("data-re", "on");
      // Kanvas 3D Home sudah di-unmount
      await expect(page.locator("canvas[data-capture-stage]")).toHaveCount(0);

      const bg = await page.evaluate(
        () => getComputedStyle(document.body).backgroundColor,
      );
      expect(bg).toBe(item.expectedBg);
    }

    // Kembali ke Home: memulihkan warna hero c1 (#0B2B80), font, data-re="off", scrollY=0, dan kanvas hidup kembali
    await page.goto("/#/");
    await expect(page.locator("html")).toHaveAttribute("data-re", "off");
    await expect(page.locator("canvas[data-capture-stage]")).toHaveAttribute(
      "data-ready",
      "true",
      { timeout: 15_000 },
    );

    const homeRestored = await page.evaluate(() => {
      const root = document.documentElement;
      const bodyStyle = getComputedStyle(document.body);
      return {
        bgA: root.style.getPropertyValue("--bg-a").trim().toUpperCase(),
        mix: root.style.getPropertyValue("--mix").trim(),
        fontFamily: bodyStyle.fontFamily,
        scrollY: window.scrollY,
      };
    });
    expect(homeRestored.bgA).toBe("#0B2B80");
    expect(homeRestored.mix).toBe("0%");
    expect(homeRestored.fontFamily).toContain("Instrument Sans Variable");
    expect(homeRestored.scrollY).toBe(0);

    // Uji mobile 390px: tidak ada overflow horizontal baik di Home maupun halaman non-Home
    await page.setViewportSize({ width: 390, height: 844 });
    for (const route of ["#/", "#/about", "#/konten", "#/contact"]) {
      await page.goto(`/${route}`);
      await page.waitForTimeout(200);
      const hasOverflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth + 1,
      );
      expect(hasOverflow).toBe(false);
    }
  });
});
