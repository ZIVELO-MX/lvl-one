export type StatKey = "FUE" | "DES" | "CON" | "INT" | "SAB" | "CAR";
export type CharacterStatus = "draft" | "ready" | "archived";
export type Plan = "free" | "pro";
export type Complexity = "Baja" | "Media" | "Alta";
export type RaceCategory = "common" | "uncommon" | "exotic" | "monstrous" | "multiverse" | "module";
export type SpellLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface AbilityChoiceRule {
  choose: number;
  amount: number;
  from?: StatKey[];
  note?: string;
}

export interface ChoiceRule {
  choose: number;
  from: string[];
  note?: string;
}

export interface TraitSummary {
  id: string;
  name: string;
  summary: string;
  level?: number;
}

export interface ClassFeature {
  id: string;
  name: string;
  level: number;
  summary: string;
}

export interface SpellcastingProgression {
  ability: StatKey;
  type: "none" | "full" | "half" | "pact" | "third";
  startsAtLevel: number;
  preparesSpells: boolean;
  ritualCasting?: boolean;
  focus?: string;
}

export interface Subrace {
  id: string;
  raceId: string;
  name: string;
  short: string;
  sourceTag: string;
  requiresDMApproval?: boolean;
  asi: ASI;
  speed?: number;
  languages?: string[];
  languageChoices?: ChoiceRule[];
  skillProficiencies?: string[];
  /** Como en Race: habilidades que la subraza deja ELEGIR (el humano variante, una). */
  skillChoices?: { count: number; from?: string[] };
  /** Dotes que concede a nivel 1. Sólo el humano variante, y sólo una. */
  grantsFeat?: number;
  /**
   * La subraza SUSTITUYE el aumento de la raza en lugar de sumarse. El humano
   * variante cambia el +1 a todo por +1 a dos a elección; sumar los dos daba
   * un personaje una cabeza por encima de lo que permite el manual.
   */
  replacesRaceAsi?: boolean;
  weaponProficiencies?: string[];
  armorProficiencies?: string[];
  toolProficiencies?: string[];
  spellcastingAbility?: StatKey;
  traits: TraitSummary[];
  spells?: string[];
  beginnerSummary: string;
  tags: string[];
}

export interface Spell {
  id: string;
  name: string;
  level: SpellLevel;
  school: string;
  castingTime: string;
  castTime?: string;
  range: string;
  duration: string;
  classes: string[];
  desc?: string;
  components: string[];
  damage?: string;
  heal?: string;
  save?: StatKey;
  savingThrow?: string;
  concentration: boolean;
  ritual: boolean;
  tags: string[];
  beginnerSummary: string;
  sourceTag: string;
}

export const SKILLS_BY_STAT: Record<StatKey, string[]> = {
  FUE: ["Atletismo"],
  DES: ["Acrobacias", "Juego de manos", "Sigilo"],
  CON: [],
  INT: ["Arcanos", "Historia", "Investigación", "Naturaleza", "Religión"],
  SAB: ["Manejo de animales", "Medicina", "Percepción", "Perspicacia", "Supervivencia"],
  CAR: ["Actuación", "Engaño", "Intimidación", "Persuasión"],
};

export const ALL_SKILLS = Object.values(SKILLS_BY_STAT).flat();

export interface ASI {
  all?: number;
  FUE?: number; DES?: number; CON?: number;
  INT?: number; SAB?: number; CAR?: number;
  choices?: AbilityChoiceRule[];
}

export interface Race {
  id: string;
  name: string;
  short: string;
  tags: string[];
  glyph: string;
  desc: string;
  asi: ASI;
  speed: number;
  size: string;
  languages: string[];
  fantasy: string;
  traits: string[];
  category?: RaceCategory;
  sourceTag?: string;
  requiresDMApproval?: boolean;
  complexity?: Complexity;
  recommendedFor?: string[];
  subraceIds?: string[];
  age?: string;
  alignmentHint?: string;
  traitDetails?: TraitSummary[];
  skillProficiencies?: string[];
  /**
   * Habilidades que la raza deja ELEGIR (el semielfo escoge dos cualesquiera).
   * Sin `from` significa "cualquiera de la lista canónica". Va aparte de
   * skillProficiencies, que son competencias fijas.
   */
  skillChoices?: { count: number; from?: string[] };
  weaponProficiencies?: string[];
  armorProficiencies?: string[];
  toolProficiencies?: string[];
  languageChoices?: ChoiceRule[];
}

export interface ClassData {
  id: string;
  name: string;
  short: string;
  tags: string[];
  glyph: string;
  desc: string;
  role: string;
  hit: string;
  saves: string[];
  profs: string[];
  spellcaster: boolean;
  skillChoices: { count: number; options: string[] };
  primary?: StatKey[];
  complexity?: Complexity;
  combat?: string;
  outside?: string;
  spellcasting?: string;
  spellcastingProgression?: SpellcastingProgression;
  subclassLevel?: number;
  armorProficiencies?: string[];
  weaponProficiencies?: string[];
  toolProficiencies?: string[];
  classFeatures?: ClassFeature[];
  recommendedFor?: string[];
  startingEquipmentId?: string;
}

export interface Subclass {
  id: string;
  classId: string;
  name: string;
  level: number;
  sourceTag: string;
  complexity: Complexity;
  role: string;
  summary: string;
  traits: TraitSummary[];
  spells?: string[];
  tags: string[];
}

export type EquipmentCategory = "armor" | "shield" | "weapon" | "adventuringGear" | "tool" | "pack" | "focus" | "treasure";

export interface EquipmentItem {
  id: string;
  name: string;
  category: EquipmentCategory;
  cost?: string;
  weightKg?: number;
  armorClass?: string;
  strengthRequirement?: number;
  stealthDisadvantage?: boolean;
  damage?: string;
  damageType?: string;
  properties?: string[];
  summary?: string;
}

export interface EquipmentChoice {
  choose: number;
  from: string[];
  note?: string;
  requires?: Record<string, string[]>;
}

export interface ClassStartingEquipment {
  classId: string;
  beginnerLoadout: string[];
  choices: EquipmentChoice[];
  goldAlternative?: string;
}

export interface Background {
  id: string;
  name: string;
  short: string;
  tags: string[];
  skills: string[];
  tools: string[];
  equipment: string;
  feature: string;
}

export interface Concept {
  id: string;
  t: string;
  icon: string;
  suggests: { race: string; cls: string; bg: string };
}

export interface CharacterDraft {
  id: string;
  name: string;
  raceId: string | null;
  subraceId: string | null;
  classId: string | null;
  subclassId: string | null;
  backgroundId: string | null;
  baseStats: Partial<Record<StatKey, number>>;
  selectedSkills: string[];
  alignment: string;
  story: string;
  ideals: string;
  bonds: string;
  flaws: string;
  level: number;
  age: string;
  status: CharacterStatus;
  conceptId: string | null;
  statsMethod: "standard" | "roll" | "point-buy";
  equipment: string[];
  equippedItems?: string[];
  spells: string[];
  hpCurrent?: number;
  hpTemp?: number;
  gold?: number;
  silver?: number;
  copper?: number;
  platinum?: number;
  spellSlotsUsed?: Record<number, number>;
  gender?: "male" | "female";
  /** Habilidades elegidas gracias a la raza (semielfo). Aparte de selectedSkills, que son las de clase. */
  raceSkills?: string[];
  /** Cara 1 de la hoja: el cuarto recuadro, junto a ideales, vínculos y defectos. */
  personalityTraits?: string;
  /** La concede el DM; el jugador la gasta para tirar con ventaja. */
  inspiration?: boolean;
  /** Dados de golpe gastados. El total sale de clase y nivel; sin esto no hay descanso corto. */
  hitDiceUsed?: number;
  /** Salvaciones de muerte. Antes sólo vivían en el rastreador de combate y se perdían al recargar. */
  deathSaves?: { successes: number; failures: number };
  /** Electro (EP): la quinta moneda de la hoja. */
  electrum?: number;
  /** Puntos de experiencia, para quien no lleva progresión por hitos. */
  xp?: number;
  /** Herramientas del trasfondo e idiomas extra que no vienen de la raza. */
  otherProficiencies?: string;
  /** Cara 2 de la hoja: apariencia y vínculos con el mundo. */
  height?: string;
  weight?: string;
  eyes?: string;
  skin?: string;
  hair?: string;
  allies?: string;
  treasure?: string;
  /** Aumentos de características por ASI (Ability Score Improvement) aplicados. Se suman a baseStats en buildCharacter. */
  asiBonuses?: Partial<Record<StatKey, number>>;
  /** Dotes elegidas. El humano variante recibe una a nivel 1; la columna ya existía en la base y nadie la escribía. */
  feats?: string[];
  /**
   * El +1 de las medias dotes (Atleta, Resiliente…). Va aparte de asiBonuses
   * porque ese campo lo consume el reparto racial: mezclarlos haría que la
   * raza creyera ya repartido lo que puso la dote.
   */
  featBonuses?: Partial<Record<StatKey, number>>;
  createdAt: number;
  updatedAt: number;
}

export interface Character extends CharacterDraft {
  race: Race | undefined;
  subrace: Subrace | undefined;
  class: ClassData | undefined;
  subclass: Subclass | undefined;
  background: Background | undefined;
  stats: Record<StatKey, number>;
  mods: Record<StatKey, number>;
  hp: number;
  ac: number;
  initiative: number;
  proficiencyBonus: number;
  /** Se calcula aquí porque Observador le suma +5 y la hoja no conoce las dotes. */
  passivePerception: number;
}

export {
  STAT_KEYS, STAT_LABELS, STANDARD_ARRAY, MAX_FREE_CHARACTERS,
  modOf, fmtMod, proficiencyBonusForLevel, avgHitDie, hpForLevel,
  levelGrantsASI, asiCountUpToLevel, armorClassFrom,
  POINT_BUY_BUDGET, POINT_BUY_MIN, POINT_BUY_MAX, pointBuyCost, pointBuySpent, pointBuyRemaining,
} from "@/lib/characterMath";
