import { difficultyThresholds, type EncounterDifficulty } from "@/types/combat";

export type MonsterSize = "Diminuto" | "Pequeño" | "Mediano" | "Grande" | "Enorme" | "Colosal";
export type MonsterType = "bestia" | "humanoides" | "no-muerto" | "dragón" | "aberración" | "bestia-magica" | "constructo" | "elemental" | "hada" | "demonio" | "monstruosidad" | "limo" | "planta" | "gigante" | "inmortal";
export type MonsterAlignment = "legal-bueno" | "legal-neutral" | "legal-maligno" | "neutral-bueno" | "neutral" | "neutral-maligno" | "caotico-bueno" | "caotico-neutral" | "caotico-maligno" | "no-alineado";

export interface MonsterAction {
  name: string;
  desc: string;
  attackBonus?: number;
  damage?: string;
  damageType?: string;
}

export interface MonsterAbility {
  name: string;
  desc: string;
}

export interface Monster {
  id: string;
  name: string;
  short: string;
  cr: number; // Challenge Rating
  xp: number;
  type: MonsterType;
  size: MonsterSize;
  alignment: MonsterAlignment;
  ac: number;
  hp: number;
  speed: string;
  stats: {
    FUE: number;
    DES: number;
    CON: number;
    INT: number;
    SAB: number;
    CAR: number;
  };
  senses?: string;
  languages?: string;
  traits?: MonsterAbility[];
  actions: MonsterAction[];
  reactions?: MonsterAction[];
  legendaryActions?: MonsterAction[];
  legendaryActionsPerRound?: number;
  spellcasting?: {
    desc: string;
    saveDC?: number;
    attackBonus?: number;
  };
  tags: string[];
  environment: string[]; // bosque, cueva, ciudad, etc.
  portraitPrompt: string; // prompt para generar asset PNG
}

export function crToXp(cr: number): number {
  // Tabla oficial D&D 5e XP por CR
  const table: Record<number, number> = {
    0: 10, 0.125: 25, 0.25: 50, 0.5: 100,
    1: 200, 2: 450, 3: 700, 4: 1100, 5: 1800,
    6: 2300, 7: 2900, 8: 3900, 9: 5000, 10: 5900,
    11: 7200, 12: 8400, 13: 10000, 14: 11500, 15: 13000,
    16: 15000, 17: 18000, 18: 20000, 19: 22000, 20: 25000,
    21: 33000, 22: 41000, 23: 50000, 24: 62000, 25: 75000,
    26: 90000, 27: 105000, 28: 120000, 29: 135000, 30: 155000,
  };
  return table[cr] ?? 0;
}

export function monsterDifficulty(partySize: number, partyLevel: number, totalMonsterXp: number): EncounterDifficulty {
  const t = difficultyThresholds(partyLevel);
  const size = Number.isFinite(partySize) ? Math.max(1, Math.round(partySize)) : 1;
  const xp = Number.isFinite(totalMonsterXp) ? Math.max(0, Math.round(totalMonsterXp)) : 0;
  const party = {
    dificil: t.dificil * size,
    mortal: t.mortal * size,
  };

  // Beginner scale used by LVL ONE: tiny encounters stay facil, while real party
  // encounters surface as medio before reaching the full-party hard threshold.
  if (xp <= t.facil) return "facil";
  if (xp < party.dificil) return "medio";
  if (xp < party.mortal) return "dificil";
  return "mortal";
}
