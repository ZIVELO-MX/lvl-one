import { NextResponse } from "next/server";

export function pick<T extends string>(
  obj: Record<string, unknown>,
  keys: readonly T[],
): Record<T, unknown> {
  const result = {} as Record<T, unknown>;
  for (const key of keys) {
    if (key in obj) result[key] = obj[key];
  }
  return result;
}

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const CAMPAIGN_FIELDS = [
  "name", "description", "cover_image", "setting", "cover_color",
  "status", "invite_code", "rules",
] as const;

export const NPC_FIELDS = [
  "name", "race", "archetype", "occupation", "location", "alignment",
  "disposition", "appearance", "personality", "ideals", "bonds", "flaws",
  "secrets", "backstory", "notes", "affiliations", "relations", "memory",
  "session_ids", "tags", "armor_class", "hit_points", "challenge_rating", "is_alive",
] as const;

export const SESSION_FIELDS = [
  "number", "title", "status", "summary", "npcs_encountered", "loot_obtained",
  "xp_awarded", "quests_started", "quests_completed", "deaths", "key_decisions",
  "decisions", "date",
] as const;

export const QUEST_FIELDS = [
  "title", "type", "status", "description", "objectives", "reward",
  "consequences", "quest_giver_id", "related_npc_ids", "time_limit",
  "notes", "completed_session_id",
] as const;

export const LOCATION_FIELDS = [
  "name", "type", "description", "climate", "government", "economy",
  "population", "npc_ids", "quest_ids", "faction_ids", "parent_location_id",
  "notes", "tags", "pin",
] as const;

export const FACTION_FIELDS = [
  "name", "description", "goals", "secrets", "symbol",
  "headquarters_location_id", "relations", "player_reputation",
  "location_ids", "npc_ids", "tags", "notes",
] as const;

export const CHARACTER_FIELDS = [
  "name", "race_id", "subrace_id", "class_id", "subclass_id", "background_id",
  "base_stats", "selected_skills", "alignment", "story", "ideals", "bonds", "flaws",
  "level", "age", "status", "concept_id", "stats_method", "equipment", "equipped_items",
  "spells", "hp_current", "hp_temp", "gold", "silver", "copper", "platinum",
  "spell_slots_used", "gender", "asi_bonuses",
  // Casillas de la hoja oficial añadidas en la migración 010. Si un campo no
  // está en esta lista, pick() lo descarta y el guardado lo pierde en silencio.
  "race_skills",
  "personality_traits", "inspiration", "hit_dice_used", "death_saves",
  "electrum", "xp", "other_proficiencies",
  "height", "weight", "eyes", "skin", "hair", "allies", "treasure",
  // Dotes (migración 012).
  "feats", "feat_bonuses",
] as const;

export const PLAYER_FIELDS = ["user_id", "name", "role", "character_id"] as const;

export const LORE_FIELDS = ["title", "content", "category", "tags"] as const;

export function apiError(e: unknown) {
  const msg = e instanceof Error ? e.message : "Internal error";
  if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
  if (msg === "Forbidden") return NextResponse.json({ error: msg }, { status: 403 });
  if (msg === "Not found") return NextResponse.json({ error: msg }, { status: 404 });
  return NextResponse.json({ error: "Internal error" }, { status: 500 });
}
