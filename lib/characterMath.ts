import type { StatKey } from "@/types/character";

export const STAT_KEYS: StatKey[] = ["FUE", "DES", "CON", "INT", "SAB", "CAR"];

export const STAT_LABELS: Record<StatKey, string> = {
  FUE: "Fuerza",
  DES: "Destreza",
  CON: "Constitución",
  INT: "Inteligencia",
  SAB: "Sabiduría",
  CAR: "Carisma",
};

export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];
export const MAX_FREE_CHARACTERS = 2;

export const SKILLS_BY_STAT: Record<StatKey, string[]> = {
  FUE: ["Atletismo"],
  DES: ["Acrobacias", "Juego de manos", "Sigilo"],
  CON: [],
  INT: ["Arcanos", "Historia", "Investigación", "Naturaleza", "Religión"],
  SAB: ["Manejo de animales", "Medicina", "Percepción", "Perspicacia", "Supervivencia"],
  CAR: ["Actuación", "Engaño", "Intimidación", "Persuasión"],
};

export const ALL_SKILLS = Object.values(SKILLS_BY_STAT).flat();

export function modOf(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function fmtMod(m: number): string {
  if (m > 0) return "+" + m;
  if (m < 0) return "−" + Math.abs(m);
  return "+0";
}

export function proficiencyBonusForLevel(level: number): number {
  return Math.floor((Math.max(1, level) - 1) / 4) + 2;
}

export function avgHitDie(hitDie: number): number {
  switch (hitDie) {
    case 6: return 4;
    case 8: return 5;
    case 10: return 6;
    case 12: return 7;
    default: return Math.ceil(hitDie / 2) + 1;
  }
}

export function hpForLevel(hitDie: number, conMod: number, level: number): number {
  const lvl = Math.max(1, level);
  const first = hitDie + conMod;
  const perLevel = avgHitDie(hitDie) + conMod;
  return Math.max(1, first + (lvl - 1) * perLevel);
}

export function levelGrantsASI(level: number): boolean {
  return [4, 6, 8, 12, 16, 19].includes(level);
}

export function asiCountUpToLevel(level: number): number {
  return [4, 6, 8, 12, 16, 19].filter(l => l <= level).length;
}
