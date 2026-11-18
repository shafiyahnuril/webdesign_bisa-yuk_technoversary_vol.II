import { expect, test } from "@playwright/test";

interface ParamCall {
  op: "setValueAtTime" | "linearRampToValueAtTime" | "setTargetAtTime";
  value: number;
}

interface AudioProbeSnapshot {
  contextStates: string[];
  ambientValue: number | null;
  ambientLastTarget: number | null;
  masterValue: number | null;
  masterLastTarget: number | null;
}

test("alur Web Audio nyata pada mode=static: lazy init, ducking menu, fade non-Home 0.8s, kembali Home, dan matikan", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });

  await page.addInitScript(() => {
    const win = window as Window & {
      AudioContext?: typeof AudioContext;
      webkitAudioContext?: typeof AudioContext;
      __audioProbe?: () => AudioProbeSnapshot;
    };
    const OrigAudioContext = win.AudioContext ?? win.webkitAudioContext;
    if (!OrigAudioContext) return;

    const contexts: AudioContext[] = [];
    const gainNodes: GainNode[] = [];
    const paramCalls = new WeakMap<AudioParam, ParamCall[]>();

    const wrapParam = (
      method: "setValueAtTime" | "linearRampToValueAtTime" | "setTargetAtTime",
    ) => {
      const orig = AudioParam.prototype[method] as (...args: number[]) => AudioParam;
      AudioParam.prototype[method] = function (...args: number[]) {
        const list = paramCalls.get(this);
        if (list) {
          list.push({ op: method, value: args[0] ?? 0 });
        }
        return orig.apply(this, args);
      };
    };

    wrapParam("setValueAtTime");
    wrapParam("linearRampToValueAtTime");
    wrapParam("setTargetAtTime");

    class InstrumentedAudioContext extends OrigAudioContext {
      constructor(options?: AudioContextOptions) {
        super(options);
        contexts.push(this);
      }

      override createGain(): GainNode {
        const node = super.createGain();
        gainNodes.push(node);
        paramCalls.set(node.gain, []);
        return node;
      }
    }

    win.AudioContext = InstrumentedAudioContext as typeof AudioContext;
    if (win.webkitAudioContext) {
      win.webkitAudioContext = InstrumentedAudioContext as typeof AudioContext;
    }

    win.__audioProbe = () => {
      const ambient = gainNodes[0] ?? null;
      const master = gainNodes[2] ?? null;
      const ambientCalls = ambient ? (paramCalls.get(ambient.gain) ?? []) : [];
      const masterCalls = master ? (paramCalls.get(master.gain) ?? []) : [];
      return {
        contextStates: contexts.map((c) => c.state),
        ambientValue: ambient ? ambient.gain.value : null,
        ambientLastTarget: ambientCalls.length
          ? ambientCalls[ambientCalls.length - 1]!.value
          : null,
        masterValue: master ? master.gain.value : null,
        masterLastTarget: masterCalls.length
          ? masterCalls[masterCalls.length - 1]!.value
          : null,
      };
    };
  });

  const readProbe = () =>
    page.evaluate(() => {
      const w = window as Window & { __audioProbe?: () => AudioProbeSnapshot };
      return w.__audioProbe!();
    });

  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/?mode=static#/");
  await expect(page.locator("[data-static-story]")).toBeVisible();

  // 1. Default mati: 0 AudioContext sebelum klik
  const toggle = page.getByRole("button", { name: "Nyalakan suara" });
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  expect((await readProbe()).contextStates).toHaveLength(0);

  // 2. Klik Nyalakan suara -> tepat 1 AudioContext dalam state running
  await toggle.click();
  const toggleOff = page.getByRole("button", { name: "Matikan suara" });
  await expect(toggleOff).toHaveAttribute("aria-pressed", "true");
  await expect
    .poll(async () => (await readProbe()).contextStates)
    .toEqual(["running"]);
  await expect
    .poll(async () => (await readProbe()).masterValue ?? 0)
    .toBeGreaterThan(0.1);

  // 3. Buka menu -> ambientBus duck ke 0.5; tutup menu -> kembali ke 1
  const menuBtn = page.locator("[data-menu-button]");
  await menuBtn.click();
  await expect(page.locator("[data-menu-panel]")).toHaveAttribute("data-open", "true");
  await expect
    .poll(async () => (await readProbe()).ambientLastTarget)
    .toBe(0.5);
  await expect
    .poll(async () => (await readProbe()).ambientValue ?? 1)
    .toBeLessThan(0.65);

  await menuBtn.click();
  await expect(page.locator("[data-menu-panel]")).toHaveAttribute("data-open", "false");
  await expect
    .poll(async () => (await readProbe()).ambientLastTarget)
    .toBe(1);
  await expect
    .poll(async () => (await readProbe()).ambientValue ?? 0)
    .toBeGreaterThan(0.85);

  // 4. Pindah ke halaman non-Home -> masterGain fade-out 0.8s ke 0, pilihan ON bertahan
  await page.locator("header nav a", { hasText: "About" }).click();
  await expect(page).toHaveURL(/#\/about/);
  await expect(toggleOff).toHaveAttribute("aria-pressed", "true");
  await expect
    .poll(async () => (await readProbe()).masterLastTarget)
    .toBe(0);
  await expect
    .poll(async () => (await readProbe()).masterValue ?? 1)
    .toBeLessThan(0.02);

  // 5. Kembali ke Home -> pilihan ON bertahan, tetap 1 AudioContext running, masterGain fade-in
  await page.locator("header nav a", { hasText: "Home" }).click();
  await expect(page.locator("[data-static-story]")).toBeVisible();
  await expect(toggleOff).toHaveAttribute("aria-pressed", "true");
  expect((await readProbe()).contextStates).toEqual(["running"]);
  await expect
    .poll(async () => (await readProbe()).masterValue ?? 0)
    .toBeGreaterThan(0.1);

  // 6. Matikan suara -> tombol kembali mati & masterGain menuju 0
  await toggleOff.click();
  await expect(page.getByRole("button", { name: "Nyalakan suara" })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await expect
    .poll(async () => (await readProbe()).masterLastTarget)
    .toBe(0);
  await expect
    .poll(async () => (await readProbe()).masterValue ?? 1)
    .toBeLessThan(0.02);

  expect(errors).toEqual([]);
});
