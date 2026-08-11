import { CLASSES } from "@/data/classes";
import { proficiencyBonusForLevel } from "@/types/character";
import type { SpellcastingProgression } from "@/types/character";

export interface ClassLevel {
  level: number;
  proficiencyBonus: number;
  features: string[];
  asiLevel: boolean;
  cantripsKnown?: number;
  spellsKnown?: number;
  spellSlots?: number[];
}

export type ClassProgression = ClassLevel[];

export const maxAttunedItems = 3;

export const FULL_CASTER_SPELL_SLOTS: number[][] = [
  [2, 0, 0, 0, 0, 0, 0, 0, 0],
  [3, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 2, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 2, 0, 0, 0, 0, 0, 0],
  [4, 3, 3, 0, 0, 0, 0, 0, 0],
  [4, 3, 3, 1, 0, 0, 0, 0, 0],
  [4, 3, 3, 2, 0, 0, 0, 0, 0],
  [4, 3, 3, 3, 1, 0, 0, 0, 0],
  [4, 3, 3, 3, 2, 0, 0, 0, 0],
  [4, 3, 3, 3, 2, 1, 0, 0, 0],
  [4, 3, 3, 3, 2, 1, 0, 0, 0],
  [4, 3, 3, 3, 2, 1, 1, 0, 0],
  [4, 3, 3, 3, 2, 1, 1, 0, 0],
  [4, 3, 3, 3, 2, 1, 1, 1, 0],
  [4, 3, 3, 3, 2, 1, 1, 1, 0],
  [4, 3, 3, 3, 2, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 2, 1, 1],
];

export const HALF_CASTER_SPELL_SLOTS: Record<number, number[]> = {
  2: [2, 0, 0, 0, 0, 0, 0, 0, 0],
  3: [3, 0, 0, 0, 0, 0, 0, 0, 0],
  4: [3, 0, 0, 0, 0, 0, 0, 0, 0],
  5: [4, 2, 0, 0, 0, 0, 0, 0, 0],
  6: [4, 2, 0, 0, 0, 0, 0, 0, 0],
  7: [4, 3, 0, 0, 0, 0, 0, 0, 0],
  8: [4, 3, 0, 0, 0, 0, 0, 0, 0],
  9: [4, 3, 2, 0, 0, 0, 0, 0, 0],
  10: [4, 3, 2, 0, 0, 0, 0, 0, 0],
  11: [4, 3, 3, 0, 0, 0, 0, 0, 0],
  12: [4, 3, 3, 0, 0, 0, 0, 0, 0],
  13: [4, 3, 3, 1, 0, 0, 0, 0, 0],
  14: [4, 3, 3, 1, 0, 0, 0, 0, 0],
  15: [4, 3, 3, 2, 0, 0, 0, 0, 0],
  16: [4, 3, 3, 2, 0, 0, 0, 0, 0],
  17: [4, 3, 3, 3, 1, 0, 0, 0, 0],
  18: [4, 3, 3, 3, 1, 0, 0, 0, 0],
  19: [4, 3, 3, 3, 2, 0, 0, 0, 0],
  20: [4, 3, 3, 3, 2, 0, 0, 0, 0],
};

export const PACT_MAGIC_SLOTS: Record<number, number[]> = Object.fromEntries(
  Array.from({ length: 20 }, (_, index) => {
    const level = index + 1;
    const slotCount = level < 2 ? 1 : level < 11 ? 2 : level < 17 ? 3 : 4;
    const slotLevel = level < 3 ? 1 : level < 5 ? 2 : level < 7 ? 3 : level < 9 ? 4 : 5;
    return [level, Array.from({ length: 9 }, (_slot, slotIndex) => slotIndex === slotLevel - 1 ? slotCount : 0)];
  }),
);

export const MULTICLASS_REQUIREMENTS: Record<string, Record<string, number>> = {
  barbarian: { str: 13 },
  bard: { cha: 13 },
  cleric: { wis: 13 },
  druid: { wis: 13 },
  fighter: { str: 13 },
  monk: { dex: 13, wis: 13 },
  paladin: { str: 13, cha: 13 },
  ranger: { dex: 13, wis: 13 },
  rogue: { dex: 13 },
  sorcerer: { cha: 13 },
  warlock: { cha: 13 },
  wizard: { int: 13 },
};

const STANDARD_ASI_LEVELS = [4, 8, 12, 16, 19];
const CLASS_ASI_LEVELS: Record<string, number[]> = {
  fighter: [4, 6, 8, 12, 14, 16, 19],
  rogue: [4, 8, 10, 12, 16, 19],
};

const CASTER_WEIGHT: Record<string, 0 | 0.5 | 1> = {
  bard: 1,
  cleric: 1,
  druid: 1,
  sorcerer: 1,
  wizard: 1,
  paladin: 0.5,
  ranger: 0.5,
  barbarian: 0,
  fighter: 0,
  monk: 0,
  rogue: 0,
  warlock: 0,
};

const CANTRIPS_KNOWN: Record<string, number[]> = {
  bard: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
  cleric: [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
  druid: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
  sorcerer: [4, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
  warlock: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
  wizard: [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
};

const SPELLS_KNOWN: Record<string, number[]> = {
  bard: [4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 15, 16, 18, 19, 19, 20, 22, 22, 22],
  ranger: [0, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11],
  sorcerer: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 13, 13, 14, 14, 15, 15, 15, 15],
  warlock: [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15],
  wizard: [6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44],
};

function asiLevelsForClass(classId: string): number[] {
  return CLASS_ASI_LEVELS[classId] ?? STANDARD_ASI_LEVELS;
}

function emptySlots(): number[] {
  return [0, 0, 0, 0, 0, 0, 0, 0, 0];
}

function spellSlotsForClass(level: number, progression?: SpellcastingProgression): number[] | undefined {
  if (!progression || level < progression.startsAtLevel) return undefined;
  if (progression.type === "full") return [...FULL_CASTER_SPELL_SLOTS[level - 1]];
  if (progression.type === "half") return [...(HALF_CASTER_SPELL_SLOTS[level] ?? emptySlots())];
  if (progression.type === "pact") return [...(PACT_MAGIC_SLOTS[level] ?? emptySlots())];
  return undefined;
}

function classLevelFor(classId: string, level: number): ClassLevel {
  const cls = CLASSES.find((entry) => entry.id === classId);
  const progression = cls?.spellcastingProgression;
  const features = cls?.classFeatures?.filter((feature) => feature.level === level).map((feature) => feature.name) ?? [];
  const asiLevel = asiLevelsForClass(classId).includes(level);

  if (asiLevel) features.push("Mejora de característica / dote");

  return {
    level,
    proficiencyBonus: proficiencyBonusForLevel(level),
    features,
    asiLevel,
    cantripsKnown: CANTRIPS_KNOWN[classId]?.[level - 1],
    spellsKnown: SPELLS_KNOWN[classId]?.[level - 1],
    spellSlots: spellSlotsForClass(level, progression),
  };
}

export const CLASS_PROGRESSION: Record<string, ClassProgression> = Object.fromEntries(
  CLASSES.map((cls) => [
    cls.id,
    Array.from({ length: 20 }, (_unused, index) => classLevelFor(cls.id, index + 1)),
  ]),
);

export function combineSpellSlots(classes: { classId: string; level: number }[]): number[] {
  const casterLevel = classes.reduce((total, entry) => {
    const safeLevel = Math.max(0, Math.min(20, Math.floor(entry.level)));
    const weight = CASTER_WEIGHT[entry.classId] ?? 0;
    if (weight === 1) return total + safeLevel;
    if (weight === 0.5) return total + Math.floor(safeLevel / 2);
    return total;
  }, 0);

  if (casterLevel < 1) return emptySlots();
  return [...FULL_CASTER_SPELL_SLOTS[Math.min(20, casterLevel) - 1]];
}

/**
 * Capacidad de carga, en KILOS.
 *
 * El manual la da como Fuerza × 15 libras, y así estaba escrita. Pero el
 * catálogo guarda los pesos en weightKg, así que compararlos habría dado casi
 * el doble de margen del real. 15 libras son 6,8 kg.
 */
export function weightCapacity(str: number): number {
  return Math.round(Math.max(0, Math.floor(str)) * 6.8 * 10) / 10;
}

export function preparedSpells(level: number, mod: number): number {
  return Math.max(1, Math.floor(level) + Math.floor(mod));
}
