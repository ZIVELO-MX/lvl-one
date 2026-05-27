import { describe, expect, it } from "vitest";
import {
  deleteFaction,
  deleteLocation,
  deleteWorldLore,
  saveFaction,
  saveLocation,
  saveWorldLore,
  setLocationPin,
  upsertFactionRelation,
} from "@/data/worldStore";
import { createCampaign } from "@/lib/campaignStore";
import { migrateCampaignCollections, reducer, type AppState } from "@/lib/store";
import { newFaction, newLocation, newWorldLore } from "@/types/world";
import type { Campaign } from "@/types/campaign";

function state(campaigns: Campaign[] = []): AppState {
  return {
    user: null,
    isLoading: false,
    characters: [],
    draftCharacter: null,
    campaigns,
    progress: { m00: { pct: 0, completedLessons: [] } },
    onboardingAnswers: null,
    ui: { limitModalOpen: false, toast: null },
  };
}

function campaign(overrides: Partial<Campaign> = {}): Campaign {
  return createCampaign("Costa de la Espada", "dm-1", {
    id: "campaign-1",
    createdAt: 1,
    updatedAt: 1,
    inviteCode: "WORLD001",
    ...overrides,
  });
}

describe("world store locations", () => {
  it("saves, updates, deletes, and pins locations", () => {
    const phandalin = newLocation("campaign-1", {
      id: "loc-1",
      name: "  Phandalin  ",
      type: "village",
      description: "  Pueblo minero fronterizo.  ",
      npcIds: ["npc-1", "npc-1", " "],
      questIds: ["quest-1"],
      factionIds: ["faction-1", "faction-1"],
      tags: ["frontera", "frontera", "minas"],
      createdAt: 1,
      updatedAt: 1,
    });

    const saved = saveLocation([], phandalin);
    const pinned = setLocationPin(saved, "loc-1", { x: 120, y: -10 });
    const updated = saveLocation(pinned, { ...pinned[0], name: "Phandalin", description: "Base del grupo." });
    const deleted = deleteLocation(updated, "loc-1");

    expect(saved[0]).toMatchObject({
      name: "Phandalin",
      description: "Pueblo minero fronterizo.",
      npcIds: ["npc-1"],
      factionIds: ["faction-1"],
      tags: ["frontera", "minas"],
    });
    expect(pinned[0].pin).toEqual({ locationId: "loc-1", x: 100, y: 0 });
    expect(updated).toHaveLength(1);
    expect(updated[0].description).toBe("Base del grupo.");
    expect(deleted).toEqual([]);
  });

  it("persists location CRUD through the app reducer", () => {
    const current = campaign();
    const location = newLocation(current.id, { id: "loc-1", name: "Neverwinter", type: "city" });

    const saved = reducer(state([current]), { type: "LOCATION_SAVE", campaignId: current.id, location });
    const updated = reducer(saved, {
      type: "LOCATION_SAVE",
      campaignId: current.id,
      location: { ...location, government: "Consejo de nobles" },
    });
    const deleted = reducer(updated, { type: "LOCATION_DELETE", campaignId: current.id, locationId: location.id });

    expect(saved.campaigns[0].locations).toHaveLength(1);
    expect(updated.campaigns[0].locations[0].government).toBe("Consejo de nobles");
    expect(deleted.campaigns[0].locations).toEqual([]);
  });
});

describe("world store factions", () => {
  it("saves, updates, deletes, and upserts faction relations", () => {
    const lordsAlliance = newFaction("campaign-1", {
      id: "faction-1",
      name: "  Alianza de los Lores  ",
      description: "  Red política y militar.  ",
      playerReputation: 8,
      locationIds: ["loc-1", "loc-1"],
      npcIds: ["npc-1"],
      tags: ["orden", "orden", "ciudades"],
      createdAt: 1,
      updatedAt: 1,
    });

    const saved = saveFaction([], lordsAlliance);
    const related = upsertFactionRelation(saved[0], {
      targetFactionId: "faction-2",
      type: "ally",
      notes: "Cooperan en la frontera.",
    });
    const updatedRelation = upsertFactionRelation(related, {
      targetFactionId: "faction-2",
      type: "hostile",
      notes: "Ruptura diplomática.",
    });
    const updated = saveFaction(saved, updatedRelation);
    const deleted = deleteFaction(updated, "faction-1");

    expect(saved[0]).toMatchObject({
      name: "Alianza de los Lores",
      description: "Red política y militar.",
      playerReputation: 5,
      locationIds: ["loc-1"],
      tags: ["orden", "ciudades"],
    });
    expect(updated[0].relations).toHaveLength(1);
    expect(updated[0].relations[0]).toMatchObject({ targetFactionId: "faction-2", type: "hostile" });
    expect(deleted).toEqual([]);
  });

  it("persists faction CRUD through the app reducer", () => {
    const current = campaign();
    const faction = newFaction(current.id, { id: "faction-1", name: "Harpistas" });

    const saved = reducer(state([current]), { type: "FACTION_SAVE", campaignId: current.id, faction });
    const updated = reducer(saved, {
      type: "FACTION_SAVE",
      campaignId: current.id,
      faction: { ...faction, playerReputation: -2 },
    });
    const deleted = reducer(updated, { type: "FACTION_DELETE", campaignId: current.id, factionId: faction.id });

    expect(saved.campaigns[0].factions).toHaveLength(1);
    expect(updated.campaigns[0].factions[0].playerReputation).toBe(-2);
    expect(deleted.campaigns[0].factions).toEqual([]);
  });
});

describe("world lore", () => {
  it("saves, updates, and deletes lore entries", () => {
    const lore = newWorldLore("campaign-1", {
      id: "lore-1",
      title: "  La Forja de los Conjuros  ",
      content: "  Un lugar de poder perdido.  ",
      category: "legend",
      tags: ["magia", "magia", "mina"],
      createdAt: 1,
      updatedAt: 1,
    });

    const saved = saveWorldLore([], lore);
    const updated = saveWorldLore(saved, { ...saved[0], content: "La leyenda apunta a Wave Echo Cave." });
    const deleted = deleteWorldLore(updated, "lore-1");

    expect(saved[0]).toMatchObject({
      title: "La Forja de los Conjuros",
      content: "Un lugar de poder perdido.",
      tags: ["magia", "mina"],
    });
    expect(updated).toHaveLength(1);
    expect(updated[0].content).toBe("La leyenda apunta a Wave Echo Cave.");
    expect(deleted).toEqual([]);
  });

  it("persists lore CRUD through the app reducer", () => {
    const current = campaign();
    const lore = newWorldLore(current.id, { id: "lore-1", title: "Culto del Dragón", category: "religion" });

    const saved = reducer(state([current]), { type: "WORLD_LORE_SAVE", campaignId: current.id, lore });
    const updated = reducer(saved, {
      type: "WORLD_LORE_SAVE",
      campaignId: current.id,
      lore: { ...lore, content: "Rituales antiguos en ruinas del norte." },
    });
    const deleted = reducer(updated, { type: "WORLD_LORE_DELETE", campaignId: current.id, loreId: lore.id });

    expect(saved.campaigns[0].worldLore).toHaveLength(1);
    expect(updated.campaigns[0].worldLore[0].content).toBe("Rituales antiguos en ruinas del norte.");
    expect(deleted.campaigns[0].worldLore).toEqual([]);
  });
});

describe("world migration", () => {
  it("hydrates old campaigns with empty world collections", () => {
    const oldCampaign = {
      ...campaign(),
      locations: undefined,
      factions: undefined,
      worldLore: undefined,
    } as unknown as Campaign;

    const migrated = migrateCampaignCollections(oldCampaign);

    expect(migrated.locations).toEqual([]);
    expect(migrated.factions).toEqual([]);
    expect(migrated.worldLore).toEqual([]);
  });
});
