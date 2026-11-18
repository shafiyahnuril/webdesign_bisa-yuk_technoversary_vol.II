import { test, expect } from "@playwright/test";

const routes = ["#/", "#/about", "#/konten", "#/contact"];

for (const route of routes) {
  test(`rute ${route} terbuka tanpa galat konsol`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto(`/${route}`);
    await expect(page.locator("h1").first()).toBeVisible();
    expect(errors).toEqual([]);
  });
}
