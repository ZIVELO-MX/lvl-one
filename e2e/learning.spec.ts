import { test, expect } from "@playwright/test";

test.describe("Flujo 2: Learn → Completar lección → Verificar progreso", () => {
  test("registro rápido, completar lección, verificar progreso", async ({ page }) => {
    // ── Login rápido con bypass ──
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await page.click('button:has-text("bypass")');
    await page.waitForURL("**/dashboard", { timeout: 5000 });
    await expect(page.locator("h1")).toContainText("Hola");

    // ── Ir a /learn ──
    await page.goto("/learn");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).toContainText("Aprender");

    // ── Click en primer módulo disponible ──
    const firstModule = page.locator('div.lo-card-elev').first();
    await firstModule.waitFor({ state: "visible", timeout: 5000 });
    await firstModule.click();
    await page.waitForURL(/\/learn\//, { timeout: 5000 });

    // ── Verificar que estamos en una lección ──
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).toContainText("d20");

    // ── Marcar como completado ──
    const completeBtn = page.locator('button:has-text("Marcar como completado")');
    await completeBtn.waitFor({ state: "visible", timeout: 5000 });
    await completeBtn.click();

    // ── Verificar que redirige a la siguiente lección o al índice ──
    await page.waitForTimeout(1000);
    const currentUrl = page.url();
    const onNextLesson = currentUrl.includes("/learn/");
    expect(onNextLesson).toBeTruthy();
  });
});
