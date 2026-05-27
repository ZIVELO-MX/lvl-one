import { test, expect } from "@playwright/test";

test.describe("Flujo M12: Subir de nivel nv1→nv5 (wizard)", () => {
  test("creación de maga → subir nivel 4 veces: subclase, ASI, hechizos y slots", async ({ page }) => {
    // ── Login bypass ──
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await page.click('button:has-text("bypass")');
    await page.waitForURL("**/dashboard", { timeout: 5000 });

    // ── Iniciar wizard ──
    await page.goto("/characters/new");
    await page.waitForURL(/\/edit\/1/, { timeout: 5000 });
    await page.waitForLoadState("networkidle");

    // ── Step 1: Identidad → "Una maga curiosa" ──
    await expect(page.locator("h1")).toContainText("¿Quién será");
    await page.fill('input[placeholder="ej. Kael Stormveil"]', "Maga E2E");
    await page.locator('button:has-text("Una maga curiosa")').click();
    await page.click('button:has-text("Continuar")');
    await page.waitForURL(/\/edit\/2/, { timeout: 5000 });

    // ── Step 2: Raza → Elf (auto-seleccionado por concepto) ──
    await expect(page.locator("h1")).toContainText(/raza/i);
    await page.click('button:has-text("Continuar")');
    await page.waitForURL(/\/edit\/3/, { timeout: 5000 });

    // ── Step 3: Clase → Wizard (auto-seleccionado) ──
    await expect(page.locator("h1")).toContainText(/clase/i);
    await page.click('button:has-text("Continuar")');
    await page.waitForURL(/\/edit\/4/, { timeout: 5000 });

    // ── Step 4: Stats ──
    await expect(page.locator("h1")).toContainText(/estadísticas/i);
    await page.click('button:has-text("Continuar")');
    await page.waitForURL(/\/edit\/5/, { timeout: 5000 });

    // ── Step 5: Trasfondo ──
    await expect(page.locator("h1")).toContainText(/trasfondo/i);
    await page.click('button:has-text("Sabio")');
    await page.click('button:has-text("Continuar")');
    await page.waitForURL(/\/edit\/6/, { timeout: 5000 });

    // ── Step 6: Equipo ──
    await expect(page.locator("h1")).toContainText(/equipo/i);
    await page.click('button:has-text("Continuar")');
    await page.waitForURL(/\/edit\/7/, { timeout: 5000 });

    // ── Step 7: Historia ──
    await expect(page.locator("h1")).toContainText(/historia/i);
    await page.click('button:has-text("Leal Bueno")');
    await page.fill('textarea[id="field-story"]', "Una maga en busca de conocimiento.");
    await page.fill('textarea[id="field-ideals"]', "El conocimiento es poder.");
    await page.fill('textarea[id="field-bonds"]', "Mi grimorio es mi vida.");
    await page.fill('textarea[id="field-flaws"]', "Soy demasiado curiosa.");
    await page.click('button:has-text("Continuar")');
    await page.waitForURL(/\/edit\/8/, { timeout: 5000 });

    // ── Step 8: Revisar y Guardar ──
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1")).toContainText(/tu personaje/i);
    await page.click('button:has-text("Guardar personaje")');
    await page.waitForURL("**/characters", { timeout: 5000 });
    await expect(page.locator("body")).toContainText("Maga E2E");

    // ── Ir a ficha del personaje ──
    await page.locator('button:has-text("Ver ficha")').first().click();
    await page.waitForURL(/\/characters\/[^/]+$/, { timeout: 5000 });
    await page.waitForLoadState("networkidle");

    // ── Verificar nivel 1 ──
    await expect(page.locator("body")).toContainText("Nivel 1");
    const initialHpText = await page.locator('text=/PG ganados|Puntos de golpe/').first().textContent();

    // ════════════════════════════════════════
    // LEVEL UP 1 → 2 (wizard subclass at 2: pick Evocación)
    // ════════════════════════════════════════
    await page.click('button:has-text("Subir de Nivel")');
    await expect(page.locator(".levelup-card")).toBeVisible();
    await expect(page.locator(".levelup-card")).toContainText("Nivel 1 → Nivel 2");
    await expect(page.locator(".levelup-card")).toContainText("Rasgos desbloqueados");
    await expect(page.locator(".levelup-card")).toContainText("Tradición arcana");

    // Wizard unlocks subclass at level 2 → must pick one
    await expect(page.locator(".levelup-card")).toContainText("Elige tu especialización");
    await page.locator('.levelup-card button:has-text("Escuela de Evocación")').click();
    await page.click('.levelup-card button:has-text("Confirmar")');
    await expect(page.locator(".levelup-overlay")).not.toBeVisible({ timeout: 3000 });

    // ── Verify now level 2 ──
    await expect(page.locator("body")).toContainText("Nivel 2");

    // ════════════════════════════════════════
    // LEVEL UP 2 → 3 (no ASI, no subclass — just features)
    // ════════════════════════════════════════
    await page.click('button:has-text("Subir de Nivel")');
    await expect(page.locator(".levelup-card")).toBeVisible();
    await expect(page.locator(".levelup-card")).toContainText("Nivel 2 → Nivel 3");
    await page.click('.levelup-card button:has-text("Confirmar")');
    await expect(page.locator(".levelup-overlay")).not.toBeVisible({ timeout: 3000 });

    // ── Verify now level 3 ──
    await expect(page.locator("body")).toContainText("Nivel 3");

    // ════════════════════════════════════════
    // LEVEL UP 3 → 4 (ASI: +2 a INT)
    // ════════════════════════════════════════
    await page.click('button:has-text("Subir de Nivel")');
    await expect(page.locator(".levelup-card")).toBeVisible();
    await expect(page.locator(".levelup-card")).toContainText("Nivel 3 → Nivel 4");

    // ASI section visible
    await expect(page.locator(".levelup-card")).toContainText("Mejora de Característica");
    await expect(page.locator(".levelup-card")).toContainText("+2 a una");

    // Click +2 mode (already default), then click INT
    await page.locator('.levelup-card button:has-text("INT")').click();
    await page.click('.levelup-card button:has-text("Confirmar")');
    await expect(page.locator(".levelup-overlay")).not.toBeVisible({ timeout: 3000 });

    // ── Verify now level 4 ──
    await expect(page.locator("body")).toContainText("Nivel 4");

    // ════════════════════════════════════════
    // LEVEL UP 4 → 5 (new spell slot level 3)
    // ════════════════════════════════════════
    await page.click('button:has-text("Subir de Nivel")');
    await expect(page.locator(".levelup-card")).toBeVisible();
    await expect(page.locator(".levelup-card")).toContainText("Nivel 4 → Nivel 5");
    await expect(page.locator(".levelup-card")).toContainText("Espacios de conjuro");
    await expect(page.locator(".levelup-card")).toContainText("Nv.3");
    await page.click('.levelup-card button:has-text("Confirmar")');
    await expect(page.locator(".levelup-overlay")).not.toBeVisible({ timeout: 3000 });

    // ── Final verification ──
    await expect(page.locator("body")).toContainText("Nivel 5");
    await expect(page.locator("body")).toContainText("Escuela de Evocación");
  });
});
