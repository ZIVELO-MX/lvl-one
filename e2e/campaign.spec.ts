import { test, expect } from "@playwright/test";

test.describe("Flujo de Campaña: Crear → Players → Sessions → Notes", () => {
  test("creación completa de campaña con jugadores, sesiones y notas", async ({ page }) => {
    // ── Register & Onboarding (prerequisite) ──
    await page.goto("/register");
    await page.waitForLoadState("networkidle");
    await page.fill('input[placeholder="ej. Kael"]', "DME2E");
    await page.fill('input[placeholder="tu@email.com"]', "dm-e2e@lvlone.app");
    await page.fill('input[placeholder="••••••••"]', "e2etest1");
    await page.click('button:has-text("Crear mi cuenta")');
    await page.waitForURL("**/onboarding", { timeout: 5000 });

    await page.click('button:has-text("Nunca")');
    await page.waitForTimeout(450);
    await page.click('button:has-text("Crear una partida")');
    await page.waitForTimeout(450);
    await page.click('button:has-text("Dungeon Master")');
    await page.waitForTimeout(450);
    await page.click('button:has-text("Rápida")');
    await page.waitForURL("**/dashboard", { timeout: 5000 });

    // ── Navigate to campaigns list ──
    await page.goto("/campaigns");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).toContainText(/campañas|sin campañas/i);

    // ── Create new campaign ──
    await page.click('a[href="/campaigns/new"], button:has-text("Nueva campaña")');
    await page.waitForURL("**/campaigns/new", { timeout: 5000 });
    await page.waitForLoadState("networkidle");

    await page.fill('input[placeholder*="nombre"]', "La Mina del Eco");
    await page.fill('textarea[placeholder*="ambientación"]', "Una mina abandonada en las montañas grises.");
    await page.fill('textarea[placeholder*="descripción"]', "Los aventureros investigan extraños ecos que provienen de las profundidades.");

    // Select color (first available)
    await page.click('button[title*="color"], input[type="radio"]');

    // Rules: allow feats
    await page.click('button:has-text("Feats permitidos")');

    await page.click('button:has-text("Crear campaña")');
    await page.waitForURL(/\/campaigns\/[^\/]+$/, { timeout: 5000 });
    await page.waitForLoadState("networkidle");

    // Verify campaign overview
    await expect(page.locator("body")).toContainText("La Mina del Eco");
    await expect(page.locator("body")).toContainText(/jugadores|sesiones|notas/i);

    // ── Add players ──
    await page.goto(page.url() + "/players");
    await page.waitForLoadState("networkidle");

    await page.fill('input[placeholder*="nombre"]', "Lia Elfa");
    await page.click('button:has-text("Agregar")');
    await page.waitForTimeout(300);
    await expect(page.locator("body")).toContainText("Lia Elfa");

    await page.fill('input[placeholder*="nombre"]', "Gimli Enano");
    await page.click('button:has-text("Agregar")');
    await page.waitForTimeout(300);
    await expect(page.locator("body")).toContainText("Gimli Enano");

    // ── Create sessions ──
    await page.goto(page.url().replace("/players", "/sessions"));
    await page.waitForLoadState("networkidle");

    await page.click('button:has-text("Nueva sesión"), a:has-text("Nueva sesión")');
    await page.waitForTimeout(300);
    await page.fill('input[placeholder*="título"]', "Entrada a la mina");
    await page.fill('input[type="date"]', "2026-06-01");
    await page.click('button:has-text("Guardar")');
    await page.waitForTimeout(500);
    await expect(page.locator("body")).toContainText("Entrada a la mina");

    await page.click('button:has-text("Nueva sesión"), a:has-text("Nueva sesión")');
    await page.waitForTimeout(300);
    await page.fill('input[placeholder*="título"]', "El eco responde");
    await page.fill('input[type="date"]', "2026-06-15");
    await page.click('button:has-text("Guardar")');
    await page.waitForTimeout(500);
    await expect(page.locator("body")).toContainText("El eco responde");

    // ── Edit session details ──
    await page.click('button:has-text("Entrada a la mina")');
    await page.waitForURL(/\/sessions\/[^\/]+$/, { timeout: 5000 });
    await page.waitForLoadState("networkidle");

    await page.click('button:has-text("Editar")');
    await page.fill('textarea[placeholder*="resumen"]', "El grupo derrotó a los kobolds de entrada y encontró un mapa antiguo.");
    await page.fill('input[placeholder*="XP"]', "150");
    await page.click('button:has-text("Guardar")');
    await page.waitForTimeout(300);
    await expect(page.locator("body")).toContainText("kobolds");

    // ── Notes ──
    const campaignBaseUrl = page.url().replace(/\/sessions\/[^\/]+$/, "");
    await page.goto(campaignBaseUrl + "/notes");
    await page.waitForLoadState("networkidle");

    await page.fill('input[placeholder*="título"]', "Villano secreto");
    await page.fill('textarea[placeholder*="contenido"]', "El verdadero villano es el hermano del rey.");
    await page.click('button:has-text("Guardar")');
    await page.waitForTimeout(300);
    await expect(page.locator("body")).toContainText("Villano secreto");
    await expect(page.locator("body")).toContainText("hermano del rey");

    // Delete note
    await page.click('button[title*="eliminar"], button:has-text("Eliminar")');
    await page.waitForTimeout(300);
    await expect(page.locator("body")).not.toContainText("Villano secreto");
  });
});
