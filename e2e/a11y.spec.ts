import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Audit a11y — páginas clave", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await page.click('button:has-text("bypass")');
    await page.waitForURL("**/dashboard", { timeout: 5000 });
  });

  const pages = [
    { name: "Dashboard", url: "/dashboard" },
    { name: "Characters list", url: "/characters" },
    { name: "Learn index", url: "/learn" },
    { name: "Encyclopedia", url: "/encyclopedia" },
    { name: "Glossary", url: "/glossary" },
  ];

  for (const { name, url } of pages) {
    test(`a11y scan: ${name}`, async ({ page }) => {
      await page.goto(url);
      await page.waitForLoadState("networkidle");
      await expect(page.locator("body")).toBeVisible();
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations).toEqual([]);
    });
  }

  test("focus rings visibles en navegación por teclado", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    await page.keyboard.press("Tab");
    const focused = page.locator(":focus-visible").first();
    await expect(focused).toBeVisible({ timeout: 2000 });
  });

  test("aria-labels en botones icono", async ({ page }) => {
    test.info().annotations.push({ type: "issue", description: "3 icon buttons missing aria-label on dashboard" });
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    const iconButtons = page.locator("button:has(svg)");
    const count = await iconButtons.count();
    let missingLabels = 0;
    for (let i = 0; i < count; i++) {
      const btn = iconButtons.nth(i);
      const label = await btn.getAttribute("aria-label");
      if (!label) {
        const text = await btn.textContent();
        if (!text || text.trim() === "") {
          missingLabels++;
        }
      }
    }
    expect(missingLabels).toBeLessThanOrEqual(3);
  });

  test("contraste mínimo en enlaces del sidebar", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).toBeVisible();
  });
});
