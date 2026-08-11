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

/**
 * Clase de armadura a partir de lo que el personaje lleva puesto.
 *
 * Antes era un número fijo por clase: un mago con cota de mallas seguía
 * mostrando 10 + DES, y un guerrero sin nada encima, 18. Ahora sale de la
 * armadura equipada, con su tope de Destreza, más el escudo.
 *
 * Sin armadura se aplica la defensa sin armadura de la clase, como en el
 * manual: bárbaro 10 + DES + CON, monje 10 + DES + SAB, el resto 10 + DES.
 */
export function armorClassFrom(
  equipped: { armorClass?: string; category?: string }[],
  mods: { DES: number; CON: number; SAB: number },
  classId?: string,
): number {
  const shieldBonus = equipped.some(i => i.category === "shield") ? 2 : 0;

  // Si lleva varias armaduras encima se usa la que más protege: al no haber
  // equipado nada explícitamente, esto mira el inventario entero y acierta.
  const armors = equipped.filter(i => i.category === "armor" && i.armorClass);
  const armor = armors.length
    ? armors.reduce((mejor, i) => (acDeArmadura(i.armorClass!, mods.DES) >= acDeArmadura(mejor.armorClass!, mods.DES) ? i : mejor))
    : undefined;

  if (!armor) {
    // El monje pierde su defensa sin armadura en cuanto empuña un escudo; el
    // bárbaro la conserva.
    if (classId === "monk" && shieldBonus > 0) return 10 + mods.DES + shieldBonus;
    const base = classId === "barbarian" ? 10 + mods.DES + mods.CON
      : classId === "monk" ? 10 + mods.DES + mods.SAB
      : 10 + mods.DES;
    return base + shieldBonus;
  }

  return acDeArmadura(armor.armorClass!, mods.DES) + shieldBonus;
}

/** Interpreta los formatos del catálogo: "16", "11 + DES", "12 + DES máx 2". */
function acDeArmadura(texto: string, dexMod: number): number {
  const base = parseInt(texto.match(/^\d+/)?.[0] ?? "10", 10);
  const tope = texto.match(/máx\s*(\d+)/);
  const dex = !/DES/.test(texto) ? 0
    : tope ? Math.min(dexMod, parseInt(tope[1], 10))
    : dexMod;
  return base + dex;
}

export function levelGrantsASI(level: number): boolean {
  return [4, 6, 8, 12, 16, 19].includes(level);
}

export function asiCountUpToLevel(level: number): number {
  return [4, 6, 8, 12, 16, 19].filter(l => l <= level).length;
}
