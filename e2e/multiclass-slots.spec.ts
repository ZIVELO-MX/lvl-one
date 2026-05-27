import { test, expect } from "@playwright/test";

test.describe("M12: Spell slot tracking and multiclass slot combination", () => {
  test("wizard level 1→2: slots display correctly and can be spent/restored", async ({ page }) => {
    // ── Login bypass ──
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await page.click('button:has-text("bypass")');
    await page.waitForURL("**/dashboard", { timeout: 5000 });

    // ── Create wizard character ──
    await page.goto("/characters/new");
    await page.waitForURL(/\/edit\/1/, { timeout: 5000 });
    await page.waitForLoadState("networkidle");

    await expect(page.locator("h1")).toContainText("¿Quién será");
    await page.fill('input[placeholder="ej. Kael Stormveil"]', "Slots E2E");
    await page.locator('button:has-text("Una maga curiosa")').click();
    await page.click('button:has-text("Continuar")');
    await page.waitForURL(/\/edit\/2/, { timeout: 5000 });

    await expect(page.locator("h1")).toContainText(/raza/i);
    await page.click('button:has-text("Continuar")');
    await page.waitForURL(/\/edit\/3/, { timeout: 5000 });

    await expect(page.locator("h1")).toContainText(/clase/i);
    await page.click('button:has-text("Continuar")');
    await page.waitForURL(/\/edit\/4/, { timeout: 5000 });

    await expect(page.locator("h1")).toContainText(/estadísticas/i);
    await page.click('button:has-text("Continuar")');
    await page.waitForURL(/\/edit\/5/, { timeout: 5000 });

    await expect(page.locator("h1")).toContainText(/trasfondo/i);
    await page.click('button:has-text("Sabio")');
    await page.click('button:has-text("Continuar")');
    await page.waitForURL(/\/edit\/6/, { timeout: 5000 });

    await expect(page.locator("h1")).toContainText(/equipo/i);
    await page.click('button:has-text("Continuar")');
    await page.waitForURL(/\/edit\/7/, { timeout: 5000 });

    await expect(page.locator("h1")).toContainText(/historia/i);
    await page.click('button:has-text("Leal Bueno")');
    await page.fill('textarea[id="field-story"]', "Test de slots.");
    await page.fill('textarea[id="field-ideals"]', "Perfección.");
    await page.fill('textarea[id="field-bonds"]', "Mi magia.");
    await page.fill('textarea[id="field-flaws"]', "Impaciente.");
    await page.click('button:has-text("Continuar")');
    await page.waitForURL(/\/edit\/8/, { timeout: 5000 });

    await page.waitForLoadState("networkidle");
    await page.click('button:has-text("Guardar personaje")');
    await page.waitForURL("**/characters", { timeout: 5000 });

    // ── Go to character sheet ──
    await page.locator('button:has-text("Ver ficha")').first().click();
    await page.waitForURL(/\/characters\/[^/]+$/, { timeout: 5000 });
    await page.waitForLoadState("networkidle");

    // ── Verify level 1 wizard has 2 level-1 spell slots ──
    await expect(page.locator("body")).toContainText("Nivel 1");
    await expect(page.locator("body")).toContainText("Espacios de conjuro");
    await expect(page.locator("body")).toContainText("Niv. 1");
    await expect(page.locator("body")).toContainText("2/2");

    // ── Click to spend 1 slot ──
    const firstSlot = page.locator('button[title="Gastar espacio"]').first();
    await firstSlot.click();
    await page.waitForTimeout(300);
    await expect(page.locator("body")).toContainText("1/2");

    // ── Click spent slot to restore ──
    const spentSlot = page.locator('button[title="Recuperar espacio"]').first();
    await spentSlot.click();
    await page.waitForTimeout(300);
    await expect(page.locator("body")).toContainText("2/2");

    // ── Spend all, then Long Rest ──
    const allSlots = page.locator('button[title="Gastar espacio"]');
    const count = await allSlots.count();
    for (let i = 0; i < count; i++) {
      await allSlots.nth(0).click();
      await page.waitForTimeout(150);
    }
    await expect(page.locator("body")).toContainText("0/2");

    await page.click('button:has-text("Descanso largo")');
    await page.waitForTimeout(300);
    await expect(page.locator("body")).toContainText("2/2");

    // ════════════════════════════════════════
    // LEVEL UP to 2 → verify 3 slots level 1
    // ════════════════════════════════════════
    await page.click('button:has-text("Subir de Nivel")');
    await expect(page.locator(".levelup-card")).toBeVisible();
    await expect(page.locator(".levelup-card")).toContainText("Nivel 1 → Nivel 2");

    // Wizard unlocks subclass at level 2 → must pick one
    await page.locator('.levelup-card button:has-text("Escuela de Evocación")').click();
    await page.click('.levelup-card button:has-text("Confirmar")');
    await expect(page.locator(".levelup-overlay")).not.toBeVisible({ timeout: 3000 });

    await expect(page.locator("body")).toContainText("Nivel 2");
    // Wizard level 2 = 3 slots level 1
    await expect(page.locator("body")).toContainText("3/3");
  });
});
