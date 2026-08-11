import type { CharacterDraft } from "@/types/character";

interface SnakeChar {
  id: string;
  name: string;
  race_id: string | null;
  subrace_id: string | null;
  class_id: string | null;
  subclass_id: string | null;
  background_id: string | null;
  base_stats: Record<string, number> | null;
  selected_skills: string[] | null;
  alignment: string | null;
  story: string | null;
  ideals: string | null;
  bonds: string | null;
  flaws: string | null;
  level: number;
  age: string | null;
  status: string;
  concept_id: string | null;
  stats_method: string | null;
  equipment: string[] | null;
  equipped_items: string[] | null;
  spells: string[] | null;
  hp_current: number | null;
  hp_temp: number | null;
  gold: number | null;
  silver: number | null;
  copper: number | null;
  platinum: number | null;
  spell_slots_used: Record<number, number> | null;
  gender: string | null;
  asi_bonuses: Record<string, number> | null;
  // Casillas de la hoja oficial (migración 010). Opcionales porque las filas
  // creadas antes de la migración llegan sin ellas.
  personality_traits?: string | null;
  inspiration?: boolean | null;
  hit_dice_used?: number | null;
  death_saves?: { successes: number; failures: number } | null;
  electrum?: number | null;
  xp?: number | null;
  other_proficiencies?: string | null;
  height?: string | null;
  weight?: string | null;
  eyes?: string | null;
  skin?: string | null;
  hair?: string | null;
  allies?: string | null;
  treasure?: string | null;
  created_at: string;
  updated_at: string;
}

function toSnake(ch: Partial<CharacterDraft>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (ch.name !== undefined) out.name = ch.name;
  if (ch.raceId !== undefined) out.race_id = ch.raceId;
  if (ch.subraceId !== undefined) out.subrace_id = ch.subraceId;
  if (ch.classId !== undefined) out.class_id = ch.classId;
  if (ch.subclassId !== undefined) out.subclass_id = ch.subclassId;
  if (ch.backgroundId !== undefined) out.background_id = ch.backgroundId;
  if (ch.baseStats !== undefined) out.base_stats = ch.baseStats;
  if (ch.selectedSkills !== undefined) out.selected_skills = ch.selectedSkills;
  if (ch.alignment !== undefined) out.alignment = ch.alignment;
  if (ch.story !== undefined) out.story = ch.story;
  if (ch.ideals !== undefined) out.ideals = ch.ideals;
  if (ch.bonds !== undefined) out.bonds = ch.bonds;
  if (ch.flaws !== undefined) out.flaws = ch.flaws;
  if (ch.level !== undefined) out.level = ch.level;
  if (ch.age !== undefined) out.age = ch.age;
  if (ch.status !== undefined) out.status = ch.status;
  if (ch.conceptId !== undefined) out.concept_id = ch.conceptId;
  if (ch.statsMethod !== undefined) out.stats_method = ch.statsMethod;
  if (ch.equipment !== undefined) out.equipment = ch.equipment;
  if (ch.equippedItems !== undefined) out.equipped_items = ch.equippedItems;
  if (ch.spells !== undefined) out.spells = ch.spells;
  if (ch.hpCurrent !== undefined) out.hp_current = ch.hpCurrent ?? null;
  if (ch.hpTemp !== undefined) out.hp_temp = ch.hpTemp ?? null;
  if (ch.gold !== undefined) out.gold = ch.gold ?? null;
  if (ch.silver !== undefined) out.silver = ch.silver ?? null;
  if (ch.copper !== undefined) out.copper = ch.copper ?? null;
  if (ch.platinum !== undefined) out.platinum = ch.platinum ?? null;
  if (ch.spellSlotsUsed !== undefined) out.spell_slots_used = ch.spellSlotsUsed ?? null;
  if (ch.gender !== undefined) out.gender = ch.gender ?? null;
  if (ch.asiBonuses !== undefined) out.asi_bonuses = ch.asiBonuses ?? null;
  // Casillas de la hoja oficial (migración 010).
  if (ch.personalityTraits !== undefined) out.personality_traits = ch.personalityTraits ?? null;
  if (ch.inspiration !== undefined) out.inspiration = ch.inspiration;
  if (ch.hitDiceUsed !== undefined) out.hit_dice_used = ch.hitDiceUsed;
  if (ch.deathSaves !== undefined) out.death_saves = ch.deathSaves;
  if (ch.electrum !== undefined) out.electrum = ch.electrum;
  if (ch.xp !== undefined) out.xp = ch.xp;
  if (ch.otherProficiencies !== undefined) out.other_proficiencies = ch.otherProficiencies ?? null;
  if (ch.height !== undefined) out.height = ch.height ?? null;
  if (ch.weight !== undefined) out.weight = ch.weight ?? null;
  if (ch.eyes !== undefined) out.eyes = ch.eyes ?? null;
  if (ch.skin !== undefined) out.skin = ch.skin ?? null;
  if (ch.hair !== undefined) out.hair = ch.hair ?? null;
  if (ch.allies !== undefined) out.allies = ch.allies ?? null;
  if (ch.treasure !== undefined) out.treasure = ch.treasure ?? null;
  return out;
}

function toCamel(data: SnakeChar): CharacterDraft {
  return {
    id: data.id,
    name: data.name,
    raceId: data.race_id,
    subraceId: data.subrace_id,
    classId: data.class_id,
    subclassId: data.subclass_id,
    backgroundId: data.background_id,
    baseStats: data.base_stats ?? {},
    selectedSkills: data.selected_skills ?? [],
    alignment: data.alignment ?? "",
    story: data.story ?? "",
    ideals: data.ideals ?? "",
    bonds: data.bonds ?? "",
    flaws: data.flaws ?? "",
    level: data.level,
    age: data.age ?? "",
    status: data.status as CharacterDraft["status"],
    conceptId: data.concept_id,
    statsMethod: (data.stats_method as CharacterDraft["statsMethod"]) ?? "standard",
    equipment: data.equipment ?? [],
    equippedItems: data.equipped_items ?? [],
    spells: data.spells ?? [],
    hpCurrent: data.hp_current ?? undefined,
    hpTemp: data.hp_temp ?? undefined,
    gold: data.gold ?? undefined,
    silver: data.silver ?? undefined,
    copper: data.copper ?? undefined,
    platinum: data.platinum ?? undefined,
    spellSlotsUsed: data.spell_slots_used ?? undefined,
    gender: (data.gender as CharacterDraft["gender"]) ?? undefined,
    asiBonuses: data.asi_bonuses ?? undefined,
    personalityTraits: data.personality_traits ?? "",
    inspiration: data.inspiration ?? false,
    hitDiceUsed: data.hit_dice_used ?? 0,
    deathSaves: data.death_saves ?? { successes: 0, failures: 0 },
    electrum: data.electrum ?? undefined,
    xp: data.xp ?? 0,
    otherProficiencies: data.other_proficiencies ?? "",
    height: data.height ?? "",
    weight: data.weight ?? "",
    eyes: data.eyes ?? "",
    skin: data.skin ?? "",
    hair: data.hair ?? "",
    allies: data.allies ?? "",
    treasure: data.treasure ?? "",
    createdAt: new Date(data.created_at).getTime(),
    updatedAt: new Date(data.updated_at).getTime(),
  };
}

function headers() {
  return { "Content-Type": "application/json" };
}

export async function fetchCharacters(): Promise<CharacterDraft[]> {
  const res = await fetch("/api/characters");
  if (!res.ok) throw new Error("Failed to fetch characters");
  const data: SnakeChar[] = await res.json();
  return data.map(toCamel);
}

export async function createCharacter(draft: CharacterDraft): Promise<CharacterDraft> {
  const res = await fetch("/api/characters", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(toSnake(draft)),
  });
  if (!res.ok) throw new Error("Failed to create character");
  const data: SnakeChar = await res.json();
  return toCamel(data);
}

export async function updateCharacter(id: string, patch: Partial<CharacterDraft>): Promise<CharacterDraft> {
  const res = await fetch(`/api/characters/${id}`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify(toSnake(patch)),
  });
  if (!res.ok) throw new Error("Failed to update character");
  const data: SnakeChar = await res.json();
  return toCamel(data);
}

export async function deleteCharacter(id: string): Promise<void> {
  const res = await fetch(`/api/characters/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete character");
}
