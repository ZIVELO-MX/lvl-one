import { describe, expect, it } from "vitest";
import type { Campaign } from "@/types/campaign";
import type { Character } from "@/types/character";
import type { NPC } from "@/types/npc";
import type { Quest } from "@/types/quest";
import {
  fromCampaign,
  fromCharacter,
  fromNPC,
  fromQuest,
  fromSession,
  toCampaign,
  toCharacter,
  toNPC,
  toQuest,
  toSession,
  type DbCampaign,
  type DbCharacter,
  type DbNPC,
  type DbQuest,
  type DbSession,
} from "@/types/supabase";

const createdAt = "2026-05-25T12:00:00.000Z";
const updatedAt = "2026-05-25T13:00:00.000Z";

function expectNoUndefined(value: unknown) {
  if (Array.isArray(value)) {
    value.forEach(expectNoUndefined);
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      expect(item, `expected ${key} to be serialized without undefined`).not.toBeUndefined();
      expectNoUndefined(item);
    }
  }
}

function dbCharacter(overrides: Partial<DbCharacter> = {}): DbCharacter {
  return {
    id: "char-1",
    user_id: "user-1",
    name: "Ilyra",
    race_id: "human",
    subrace_id: null,
    class_id: "wizard",
    subclass_id: null,
    background_id: "sage",
    base_stats: { FUE: 8, DES: 14, CON: 13, INT: 16, SAB: 10, CAR: 12 },
    selected_skills: ["Arcanos", "Historia"],
    alignment: "Neutral Bueno",
    story: "Aprendiz de una torre costera.",
    ideals: "Conocimiento",
    bonds: "Su grimorio",
    flaws: "Curiosidad peligrosa",
    level: 2,
    age: "28",
    status: "ready",
    concept_id: "arcane-scholar",
    stats_method: "standard",
    equipment: ["spellbook", "dagger"],
    equipped_items: ["dagger"],
    spells: ["magic_missile", "shield"],
    feats: ["war_caster"],
    hp_current: 7,
    hp_temp: 3,
    gold: 12,
    spell_slots_used: { 1: 1 },
    asi_bonuses: { INT: 1 },
    created_at: createdAt,
    updated_at: updatedAt,
    ...overrides,
  };
}

function dbSession(overrides: Partial<DbSession> = {}): DbSession {
  return {
    id: "session-1",
    campaign_id: "campaign-1",
    number: 1,
    title: "Llegada a Phandalin",
    status: "completed",
    summary: "El grupo negocia con Sildar.",
    npcs: ["npc-1"],
    npcs_encountered: ["npc-1"],
    loot: "50 po",
    loot_obtained: ["gold-50"],
    xp_awarded: 200,
    quests_started: ["quest-1"],
    quests_completed: [],
    deaths: 0,
    key_decisions: "Ayudan a la alianza.",
    decisions: [
      {
        id: "decision-1",
        description: "Proteger Phandalin",
        session_id: "session-1",
        made_by: "party",
        created_at: createdAt,
      },
    ],
    date: "2026-05-25",
    created_at: createdAt,
    updated_at: updatedAt,
    ...overrides,
  };
}

function dbNPC(overrides: Partial<DbNPC> = {}): DbNPC {
  return {
    id: "npc-1",
    campaign_id: "campaign-1",
    name: "Sildar",
    race: "Humano",
    occupation: "Caballero",
    disposition: "friendly",
    affiliations: ["lords-alliance"],
    relations: [],
    memory: [{ id: "mem-1", text: "Fue rescatado.", session_id: "session-1", created_at: createdAt }],
    session_ids: ["session-1"],
    tags: ["ally"],
    armor_class: 16,
    hit_points: 27,
    is_alive: true,
    created_at: createdAt,
    updated_at: updatedAt,
    ...overrides,
  };
}

function dbQuest(overrides: Partial<DbQuest> = {}): DbQuest {
  return {
    id: "quest-1",
    campaign_id: "campaign-1",
    title: "Rescatar a Gundren",
    type: "main",
    status: "active",
    description: "Encontrar al explorador perdido.",
    objectives: [{ id: "obj-1", description: "Interrogar a los trasgos", completed: true, completed_at: updatedAt }],
    reward: "500 po",
    consequences: "La mina queda abierta.",
    quest_giver_id: "npc-1",
    related_npc_ids: ["npc-1"],
    notes: "Vinculada a Wave Echo Cave.",
    created_at: createdAt,
    updated_at: updatedAt,
    ...overrides,
  };
}

function dbCampaign(overrides: Partial<DbCampaign> = {}): DbCampaign {
  return {
    id: "campaign-1",
    dm_id: "dm-1",
    name: "La Mina Perdida",
    description: "Campaña de iniciación.",
    setting: "Costa de la Espada",
    cover_color: "#4A5D78",
    status: "active",
    players: [{ id: "player-1", user_id: "dm-1", name: "DM", role: "dm", joined_at: createdAt }],
    sessions: [dbSession()],
    notes: [{ id: "note-1", title: "Secreto", content: "El mapa está incompleto.", is_dm_only: true, created_at: createdAt, updated_at: updatedAt }],
    npcs: [dbNPC()],
    quests: [dbQuest()],
    locations: [],
    factions: [],
    world_lore: [],
    invite_code: "M13CODE",
    rules: {
      allowMulticlass: true,
      allowFeats: true,
      allowHomebrew: false,
      startingLevel: 1,
      statGeneration: "standard",
    },
    created_at: createdAt,
    updated_at: updatedAt,
    ...overrides,
  };
}

describe("Supabase character converters", () => {
  it("hydrates characters preserving stats, HP, spells, feats, and derived fields", async () => {
    const client = {
      from: () => ({
        select: () => ({
          single: async () => ({ data: dbCharacter(), error: null }),
        }),
      }),
    };

    const { data } = await client.from().select().single();
    const character = toCharacter(data) as Character & { feats: string[] };

    expect(character.baseStats).toMatchObject({ DES: 14, INT: 16 });
    expect(character.stats.INT).toBe(18);
    expect(character.hpCurrent).toBe(7);
    expect(character.hpTemp).toBe(3);
    expect(character.spells).toEqual(expect.arrayContaining(["magic_missile", "shield"]));
    expect(character.feats).toEqual(["war_caster"]);
    expect(character.hp).toBeGreaterThan(0);
    expect(character.proficiencyBonus).toBe(2);
  });

  it("serializes characters to snake_case without undefined values", () => {
    const character = toCharacter(dbCharacter({ subclass_id: null, copper: null, silver: null }));
    const row = fromCharacter(character);

    expect(row).toMatchObject({
      id: "char-1",
      race_id: "human",
      class_id: "wizard",
      base_stats: { FUE: 8, DES: 14, CON: 13, INT: 16, SAB: 10, CAR: 12 },
      hp_current: 7,
      hp_temp: 3,
      spells: expect.arrayContaining(["magic_missile", "shield"]),
      feats: ["war_caster"],
      created_at: createdAt,
      updated_at: updatedAt,
    });
    expectNoUndefined(row);
  });
});

describe("Supabase campaign converters", () => {
  it("roundtrips campaign aggregates through DB-shaped rows", () => {
    const campaign = toCampaign(dbCampaign()) as Campaign;
    const row = fromCampaign(campaign);

    expect(campaign).toMatchObject({
      id: "campaign-1",
      dmId: "dm-1",
      name: "La Mina Perdida",
      players: [{ userId: "dm-1", role: "dm" }],
      sessions: [{ campaignId: "campaign-1", decisions: [{ madeBy: "party" }] }],
      notes: [{ isDmOnly: true }],
      npcs: [{ name: "Sildar" }],
      quests: [{ title: "Rescatar a Gundren" }],
    });
    expect(row).toMatchObject({
      id: "campaign-1",
      dm_id: "dm-1",
      invite_code: "M13CODE",
      sessions: [{ campaign_id: "campaign-1", decisions: [{ session_id: "session-1" }] }],
      notes: [{ is_dm_only: true }],
    });
    expectNoUndefined(row);
  });
});

describe("Supabase entity converters", () => {
  it("roundtrips sessions", () => {
    const session = toSession(dbSession());
    const row = fromSession(session);

    expect(session).toMatchObject({
      id: "session-1",
      campaignId: "campaign-1",
      npcsEncountered: ["npc-1"],
      decisions: [{ sessionId: "session-1", madeBy: "party" }],
    });
    expect(row).toMatchObject({
      id: "session-1",
      campaign_id: "campaign-1",
      npcs_encountered: ["npc-1"],
      decisions: [{ session_id: "session-1", made_by: "party" }],
    });
    expectNoUndefined(row);
  });

  it("roundtrips NPCs", () => {
    const npc = toNPC(dbNPC()) as NPC;
    const row = fromNPC(npc);

    expect(npc).toMatchObject({
      id: "npc-1",
      campaignId: "campaign-1",
      memory: [{ sessionId: "session-1" }],
      armorClass: 16,
      isAlive: true,
    });
    expect(row).toMatchObject({
      id: "npc-1",
      campaign_id: "campaign-1",
      memory: [{ session_id: "session-1" }],
      armor_class: 16,
      is_alive: true,
    });
    expectNoUndefined(row);
  });

  it("roundtrips quests", () => {
    const quest = toQuest(dbQuest()) as Quest;
    const row = fromQuest(quest);

    expect(quest).toMatchObject({
      id: "quest-1",
      campaignId: "campaign-1",
      questGiverId: "npc-1",
      objectives: [{ completed: true, completedAt: Date.parse(updatedAt) }],
    });
    expect(row).toMatchObject({
      id: "quest-1",
      campaign_id: "campaign-1",
      quest_giver_id: "npc-1",
      objectives: [{ completed_at: updatedAt }],
    });
    expectNoUndefined(row);
  });
});
