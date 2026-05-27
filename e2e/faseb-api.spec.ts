import { test, expect } from "@playwright/test";

test.describe("Fase B: API persistence for campaigns, characters, and sub-items", () => {
  const UUID_RE = /[0-9a-f-]{36}/;

  test("creates campaign with NPCs, quests, locations, factions and persists on refresh", async ({ page }) => {
    // ── Register & Onboarding ──
    await page.goto("/register");
    await page.waitForLoadState("networkidle");
    await page.fill('input[placeholder="ej. Kael"]', "FaseB");
    await page.fill('input[placeholder="tu@email.com"]', "faseb@lvlone.app");
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

    // ── Create campaign ──
    await page.goto("/campaigns");
    await page.waitForLoadState("networkidle");
    await page.click('a[href="/campaigns/new"], button:has-text("Nueva campaña")');
    await page.waitForURL("**/campaigns/new", { timeout: 5000 });

    await page.fill('input[placeholder*="nombre"]', "API Persist Test");
    await page.fill('textarea[placeholder*="ambientación"]', "Testing API persistence across refresh.");
    await page.fill('textarea[placeholder*="descripción"]', "E2E test for Fase B API sync.");
    await page.click('button:has-text("Crear campaña")');
    await page.waitForURL(/\/campaigns\/[^\/]+$/, { timeout: 5000 });
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).toContainText("API Persist Test");

    const campaignUrl = page.url();
    const campaignId = campaignUrl.match(/\/campaigns\/([^/]+)/)?.[1] ?? "";
    expect(campaignId).toMatch(UUID_RE);

    // ── Create NPC ──
    await page.click('text=NPCs');
    await page.waitForLoadState("networkidle");
    await page.click('a:has-text("Nuevo NPC")');
    await page.waitForURL(/\/npcs\/new$/, { timeout: 5000 });

    await page.fill('input[placeholder="Ej: Enna la tabernera"]', "Gorim el Herrero");
    await page.fill('input[placeholder="Ej: Halfling"]', "Enano");
    await page.fill('input[placeholder="Ej: Tabernera, Mercader"]', "Herrero");
    await page.click('button:has-text("Crear NPC")');
    await page.waitForURL(/\/npcs\/[^/]+\/$/, { timeout: 5000 });
    await expect(page.locator("body")).toContainText("Gorim el Herrero");

    // ── Create Quest ──
    await page.click('text=Quests');
    await page.waitForLoadState("networkidle");
    await page.click('a:has-text("Nueva quest")');
    await page.waitForURL(/\/quests\/new$/, { timeout: 5000 });

    await page.fill('input[placeholder="Ej: Rescatar a los aldeanos"]', "Forjar la Espada");
    await page.fill('textarea[placeholder*="descrip"]', "Ayudar a Gorim a recuperar su martillo.");
    await page.click('button:has-text("Crear quest")');
    await page.waitForURL(/\/quests\/[^/]+\/$/, { timeout: 5000 });
    await expect(page.locator("body")).toContainText("Forjar la Espada");

    // ── Create Location ──
    await page.click('text=Mundo');
    await page.waitForLoadState("networkidle");
    await page.click('a:has-text("Nueva ubicacion")');
    await page.waitForURL(/\/world\/locations\/new$/, { timeout: 5000 });

    await page.fill('input[placeholder="Ej: Ciudad de Waterdeep"]', "Fragua del Norte");
    await page.click('button:has-text("Crear ubicacion")');
    await page.waitForURL(/\/world\/locations\/[^/]+\/$/, { timeout: 5000 });
    await expect(page.locator("body")).toContainText("Fragua del Norte");

    // ── Create Faction ──
    await page.click('text=Mundo');
    await page.waitForLoadState("networkidle");
    await page.click('a:has-text("Nueva faccion")');
    await page.waitForURL(/\/world\/factions\/new$/, { timeout: 5000 });

    await page.fill('input[placeholder="Ej: La Orden del Fenix"]', "Gremio de Herreros");
    await page.click('button:has-text("Crear faccion")');
    await page.waitForURL(/\/world\/factions\/[^/]+\/$/, { timeout: 5000 });
    await expect(page.locator("body")).toContainText("Gremio de Herreros");

    // ── REFRESH: verify all data persists via API sync ──
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Verify campaign title persists
    await expect(page.locator("body")).toContainText("API Persist Test");

    // Verify NPCs persist
    await page.click('text=NPCs');
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).toContainText("Gorim el Herrero");

    // Verify Quests persist
    await page.click('text=Quests');
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).toContainText("Forjar la Espada");

    // Verify Locations persist via Mundo tab
    await page.click('text=Mundo');
    await page.waitForLoadState("networkidle");
    await page.click('text=Ubicaciones');
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).toContainText("Fragua del Norte");

    // Verify Factions persist
    await page.click('text=Mundo');
    await page.waitForLoadState("networkidle");
    await page.click('text=Facciones');
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).toContainText("Gremio de Herreros");
  });

  test("creates a character and persists on refresh", async ({ page }) => {
    // ── Register ──
    await page.goto("/register");
    await page.waitForLoadState("networkidle");
    await page.fill('input[placeholder="ej. Kael"]', "CharAPI");
    await page.fill('input[placeholder="tu@email.com"]', "charapi@lvlone.app");
    await page.fill('input[placeholder="••••••••"]', "e2etest1");
    await page.click('button:has-text("Crear mi cuenta")');
    await page.waitForURL("**/onboarding", { timeout: 5000 });

    await page.click('button:has-text("Nunca")');
    await page.waitForTimeout(450);
    await page.click('button:has-text("Crear un personaje")');
    await page.waitForTimeout(450);
    await page.click('button:has-text("Jugador")');
    await page.waitForTimeout(450);
    await page.click('button:has-text("Rápida")');
    await page.waitForURL("**/dashboard", { timeout: 5000 });

    // ── Create character via wizard ──
    await page.goto("/characters/new");
    await page.waitForURL("**/edit/1", { timeout: 5000 });

    // Step 1: Identity
    await page.fill('input[placeholder="ej. Kael Stormveil"]', "Kael API");
    await page.click('button:has-text("Guerrero")');
    await page.click('button:has-text("Continuar")');
    await page.waitForURL("**/edit/2", { timeout: 5000 });

    // Step 2: Race
    await page.click('button:has-text("Humano")');
    await page.click('button:has-text("Continuar")');
    await page.waitForURL("**/edit/3", { timeout: 5000 });

    // Step 3: Class
    await page.click('button:has-text("Guerrero")');
    await page.click('button:has-text("Continuar")');
    await page.waitForURL("**/edit/4", { timeout: 5000 });

    // Step 4: Stats
    await page.click('button:has-text("Continuar")');
    await page.waitForURL("**/edit/5", { timeout: 5000 });

    // Step 5: Background
    await page.click('button:has-text("Soldado")');
    await page.click('button:has-text("Continuar")');
    await page.waitForURL("**/edit/6", { timeout: 5000 });

    // Step 6: Equipment
    await page.click('button:has-text("Continuar")');
    await page.waitForURL("**/edit/7", { timeout: 5000 });

    // Step 7: Story & Alignment
    await page.click('button:has-text("Leal Bueno")');
    await page.fill('textarea[id="field-story"]', "Un guerrero de prueba API.");
    await page.fill('textarea[id="field-ideals"]', "El código es ley.");
    await page.fill('textarea[id="field-bonds"]', "Mi editor de texto.");
    await page.fill('textarea[id="field-flaws"]', "Escribo pruebas frágiles.");
    await page.click('button:has-text("Continuar")');
    await page.waitForURL("**/edit/8", { timeout: 5000 });

    // Step 8: Review & Save
    await page.waitForLoadState("networkidle");
    await page.click('button:has-text("Guardar personaje")');
    await page.waitForURL("**/characters", { timeout: 5000 });
    await expect(page.locator("body")).toContainText("Kael API");

    // ── REFRESH: verify character persists via API ──
    await page.reload();
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).toContainText("Kael API");
  });
});
