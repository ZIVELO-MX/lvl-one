import { test, expect } from "@playwright/test";

test.describe("Flujo 1: Registro → Onboarding → Crear personaje (8 pasos) → Hoja", () => {
  test("creación completa de personaje Guerrero Humano", async ({ page }) => {
    // ── Register ──
    await page.goto("/register");
    await page.waitForLoadState("networkidle");
    await page.fill('input[placeholder="ej. Kael"]', "E2ETester");
    await page.fill('input[placeholder="tu@email.com"]', "e2e@lvlone.app");
    await page.fill('input[placeholder="••••••••"]', "e2etest1");
    await page.click('button:has-text("Crear mi cuenta")');
    await page.waitForURL("**/onboarding", { timeout: 5000 });

    // ── Onboarding (4 preguntas) ──
    await page.click('button:has-text("Nunca")');
    await page.waitForTimeout(450);
    await page.click('button:has-text("Crear un personaje")');
    await page.waitForTimeout(450);
    await page.click('button:has-text("Jugador")');
    await page.waitForTimeout(450);
    await page.click('button:has-text("Rápida")');
    await page.waitForURL("**/dashboard", { timeout: 5000 });
    await expect(page.locator("h1")).toContainText("Hola");

    // ── Iniciar wizard ──
    await page.goto("/characters/new");
    await page.waitForURL("**/edit/1", { timeout: 5000 });
    await page.waitForLoadState("networkidle");

    // ── Step 1: Identidad ──
    await expect(page.locator("h1")).toContainText("¿Quién será");
    await page.fill('input[placeholder="ej. Kael Stormveil"]', "Kael Humano");
    await page.click('button:has-text("Guerrero")');
    await page.click('button:has-text("Continuar")');
    await page.waitForURL("**/edit/2", { timeout: 5000 });

    // ── Step 2: Raza ──
    await expect(page.locator("h1")).toContainText(/raza/i);
    await page.click('button:has-text("Humano")');
    await page.click('button:has-text("Continuar")');
    await page.waitForURL("**/edit/3", { timeout: 5000 });

    // ── Step 3: Clase ──
    await expect(page.locator("h1")).toContainText(/clase/i);
    await page.click('button:has-text("Guerrero")');
    await page.click('button:has-text("Continuar")');
    await page.waitForURL("**/edit/4", { timeout: 5000 });

    // ── Step 4: Stats ──
    await expect(page.locator("h1")).toContainText(/estadísticas/i);
    await page.click('button:has-text("Continuar")');
    await page.waitForURL("**/edit/5", { timeout: 5000 });

    // ── Step 5: Trasfondo ──
    await expect(page.locator("h1")).toContainText(/trasfondo/i);
    await page.click('button:has-text("Soldado")');
    await page.click('button:has-text("Continuar")');
    await page.waitForURL("**/edit/6", { timeout: 5000 });

    // ── Step 6: Equipo ──
    await expect(page.locator("h1")).toContainText(/equipo/i);
    await page.click('button:has-text("Continuar")');
    await page.waitForURL("**/edit/7", { timeout: 5000 });

    // ── Step 7: Historia ──
    await expect(page.locator("h1")).toContainText(/historia/i);
    await page.click('button:has-text("Leal Bueno")');
    await page.fill('textarea[id="field-story"]', "Un guerrero en busca de gloria.");
    await page.fill('textarea[id="field-ideals"]', "La justicia guía mi espada.");
    await page.fill('textarea[id="field-bonds"]', "Proteger a mi compañía.");
    await page.fill('textarea[id="field-flaws"]', "Confío demasiado rápido.");
    await page.click('button:has-text("Continuar")');
    await page.waitForURL("**/edit/8", { timeout: 5000 });

    // ── Step 8: Revisar y Guardar ──
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1")).toContainText(/tu personaje/i);
    await page.click('button:has-text("Guardar personaje")');

    // ── Verificar redirección a /characters ──
    await page.waitForURL("**/characters", { timeout: 5000 });
    await expect(page.locator("body")).toContainText("Kael Humano");
  });
});
