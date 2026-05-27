import { uid } from "@/lib/uid";
export type ConditionType =
  | "blinded"
  | "charmed"
  | "deafened"
  | "exhaustion"
  | "frightened"
  | "grappled"
  | "incapacitated"
  | "invisible"
  | "paralyzed"
  | "petrified"
  | "poisoned"
  | "prone"
  | "restrained"
  | "stunned"
  | "unconscious";

export interface Condition {
  type: ConditionType;
  source?: string;
  duration?: number;
}

export type CombatantType = "player" | "monster" | "npc" | "custom";

export interface DeathSaves {
  successes: number;
  failures: number;
}

export interface Combatant {
  id: string;
  name: string;
  type: CombatantType;
  initiative: number;
  hp: number;
  maxHp: number;
  tempHp: number;
  ac: number;
  conditions: Condition[];
  concentration: boolean;
  deathSaves: DeathSaves;
  isAlive: boolean;
  monsterId?: string;
  characterId?: string;
  npcId?: string;
  note?: string;
  isHidden: boolean;
}

export interface CombatState {
  combatants: Combatant[];
  round: number;
  activeIndex: number;
  isRunning: boolean;
  log: string[];
}

export interface EncounterEntry {
  monsterId: string;
  count: number;
  customHp?: number;
}

export type EncounterDifficulty = "facil" | "medio" | "dificil" | "mortal";

export interface DifficultyThresholds {
  facil: number;
  medio: number;
  dificil: number;
  mortal: number;
}

export const CONDITION_TYPES: ConditionType[] = [
  "blinded",
  "charmed",
  "deafened",
  "exhaustion",
  "frightened",
  "grappled",
  "incapacitated",
  "invisible",
  "paralyzed",
  "petrified",
  "poisoned",
  "prone",
  "restrained",
  "stunned",
  "unconscious",
];

export const CONDITION_LABEL: Record<ConditionType, string> = {
  blinded: "Cegado",
  charmed: "Hechizado",
  deafened: "Ensordecido",
  exhaustion: "Agotamiento",
  frightened: "Asustado",
  grappled: "Agarrado",
  incapacitated: "Incapacitado",
  invisible: "Invisible",
  paralyzed: "Paralizado",
  petrified: "Petrificado",
  poisoned: "Envenenado",
  prone: "Derribado",
  restrained: "Restringido",
  stunned: "Aturdido",
  unconscious: "Inconsciente",
};

export const CONDITION_COLOR: Record<ConditionType, string> = {
  blinded: "#6E7783",
  charmed: "#C28FA3",
  deafened: "#8FA7C2",
  exhaustion: "#C9956A",
  frightened: "#8F7CC2",
  grappled: "#A08262",
  incapacitated: "#C28F8F",
  invisible: "#8FC2B0",
  paralyzed: "#B89AD8",
  petrified: "#A3A3A3",
  poisoned: "#8FB36F",
  prone: "#BDA56A",
  restrained: "#D0A06A",
  stunned: "#D6A84F",
  unconscious: "#7F8790",
};

export const CONDITION_ICON: Record<ConditionType, string> = {
  blinded: "eye-off",
  charmed: "heart",
  deafened: "ear-off",
  exhaustion: "battery-low",
  frightened: "alert-triangle",
  grappled: "hand",
  incapacitated: "ban",
  invisible: "eye",
  paralyzed: "pause",
  petrified: "landmark",
  poisoned: "skull",
  prone: "arrow-down",
  restrained: "lock",
  stunned: "zap",
  unconscious: "moon",
};

export const DIFFICULTY_THRESHOLD_TABLE: Record<number, DifficultyThresholds> = {
  1: { facil: 25, medio: 50, dificil: 75, mortal: 100 },
  2: { facil: 50, medio: 100, dificil: 150, mortal: 200 },
  3: { facil: 75, medio: 150, dificil: 225, mortal: 400 },
  4: { facil: 125, medio: 250, dificil: 375, mortal: 500 },
  5: { facil: 250, medio: 500, dificil: 750, mortal: 1100 },
  6: { facil: 300, medio: 600, dificil: 900, mortal: 1400 },
  7: { facil: 350, medio: 750, dificil: 1100, mortal: 1700 },
  8: { facil: 450, medio: 900, dificil: 1400, mortal: 2100 },
  9: { facil: 550, medio: 1100, dificil: 1600, mortal: 2400 },
  10: { facil: 600, medio: 1200, dificil: 1900, mortal: 2800 },
  11: { facil: 800, medio: 1600, dificil: 2400, mortal: 3600 },
  12: { facil: 1000, medio: 2000, dificil: 3000, mortal: 4500 },
  13: { facil: 1100, medio: 2200, dificil: 3400, mortal: 5100 },
  14: { facil: 1250, medio: 2500, dificil: 3800, mortal: 5700 },
  15: { facil: 1400, medio: 2800, dificil: 4300, mortal: 6400 },
  16: { facil: 1600, medio: 3200, dificil: 4800, mortal: 7200 },
  17: { facil: 2000, medio: 3900, dificil: 5900, mortal: 8800 },
  18: { facil: 2100, medio: 4200, dificil: 6300, mortal: 9500 },
  19: { facil: 2400, medio: 4900, dificil: 7300, mortal: 10900 },
  20: { facil: 2800, medio: 5700, dificil: 8500, mortal: 20000 },
};

function clampInteger(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function difficultyThresholds(partyLevel: number): DifficultyThresholds {
  const level = clampInteger(partyLevel, 1, 20);
  return { ...DIFFICULTY_THRESHOLD_TABLE[level] };
}

export function normalizeDeathSaves(deathSaves: Partial<DeathSaves> = {}): DeathSaves {
  return {
    successes: clampInteger(deathSaves.successes ?? 0, 0, 3),
    failures: clampInteger(deathSaves.failures ?? 0, 0, 3),
  };
}

export function combatantIsAlive(combatant: Pick<Combatant, "type" | "hp" | "deathSaves">): boolean {
  if (combatant.deathSaves.failures >= 3) return false;
  if (combatant.hp > 0) return true;
  return combatant.type === "player";
}

export const isCombatantAlive = combatantIsAlive;

export function resolveCombatantLife(combatant: Combatant): Combatant {
  const maxHp = Math.max(1, Math.round(combatant.maxHp));
  const hp = clampInteger(combatant.hp, 0, maxHp);
  const tempHp = clampInteger(combatant.tempHp, 0, 999);
  const deathSaves = normalizeDeathSaves(combatant.deathSaves);
  const resolved = { ...combatant, hp, maxHp, tempHp, deathSaves };
  return { ...resolved, isAlive: combatantIsAlive(resolved) };
}

export function newCombatant(overrides: Partial<Combatant> & Pick<Combatant, "name">): Combatant {
  const maxHp = Math.max(1, Math.round(overrides.maxHp ?? overrides.hp ?? 1));
  const combatant: Combatant = {
    id: overrides.id ?? uid(),
    name: overrides.name.trim() || "Combatiente",
    type: overrides.type ?? "custom",
    initiative: Math.round(overrides.initiative ?? 0),
    hp: overrides.hp ?? maxHp,
    maxHp,
    tempHp: overrides.tempHp ?? 0,
    ac: Math.max(0, Math.round(overrides.ac ?? 10)),
    conditions: overrides.conditions ?? [],
    concentration: overrides.concentration ?? false,
    deathSaves: normalizeDeathSaves(overrides.deathSaves),
    isAlive: overrides.isAlive ?? true,
    monsterId: overrides.monsterId,
    characterId: overrides.characterId,
    npcId: overrides.npcId,
    note: overrides.note,
    isHidden: overrides.isHidden ?? false,
  };
  return resolveCombatantLife(combatant);
}

export function newCombatState(overrides: Partial<CombatState> = {}): CombatState {
  const combatants = overrides.combatants?.map(resolveCombatantLife) ?? [];
  return {
    combatants,
    round: Math.max(1, Math.round(overrides.round ?? 1)),
    activeIndex: clampInteger(overrides.activeIndex ?? 0, 0, Math.max(0, combatants.length - 1)),
    isRunning: overrides.isRunning ?? false,
    log: overrides.log ?? [],
  };
}

export function hasCondition(combatant: Pick<Combatant, "conditions">, type: ConditionType): boolean {
  return combatant.conditions.some((condition) => condition.type === type);
}

export function addCondition(combatant: Combatant, condition: Condition): Combatant {
  const normalized: Condition = {
    ...condition,
    duration: condition.duration === undefined ? undefined : Math.max(1, Math.round(condition.duration)),
  };
  const conditions = [
    ...combatant.conditions.filter((current) => current.type !== condition.type),
    normalized,
  ];
  return resolveCombatantLife({ ...combatant, conditions });
}

export function removeCondition(combatant: Combatant, type: ConditionType): Combatant {
  return resolveCombatantLife({
    ...combatant,
    conditions: combatant.conditions.filter((condition) => condition.type !== type),
  });
}

export function tickConditionDurations(combatant: Combatant): Combatant {
  const conditions = combatant.conditions.flatMap((condition) => {
    if (condition.duration === undefined) return [condition];
    const duration = Math.round(condition.duration) - 1;
    return duration > 0 ? [{ ...condition, duration }] : [];
  });
  return resolveCombatantLife({ ...combatant, conditions });
}

export function sortCombatantsByInitiative(combatants: Combatant[]): Combatant[] {
  return [...combatants].sort((a, b) => {
    if (b.initiative !== a.initiative) return b.initiative - a.initiative;
    return a.name.localeCompare(b.name, "es");
  });
}
