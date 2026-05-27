export interface ClassSuggestion {
  skills: string[];
  weapons: string[];
  tip: string;
  statOrder: string; // e.g. "FUE > CON > DES"
}

const CLASS_SUGGESTIONS: Record<string, ClassSuggestion> = {
  fighter: {
    skills:   ["Atletismo", "Intimidación", "Percepción", "Supervivencia"],
    weapons:  ["Espada larga", "Escudo", "Arco largo"],
    tip:      "Pon FUE o DES alto según prefieras combate cuerpo a cuerpo o a distancia.",
    statOrder:"FUE > CON > DES",
  },
  wizard: {
    skills:   ["Arcana", "Historia", "Investigación", "Religión"],
    weapons:  ["Báculo", "Daga"],
    tip:      "INT es tu stat clave. CON alta mejora la concentración de hechizos.",
    statOrder:"INT > CON > DES",
  },
  sorcerer: {
    skills:   ["Arcana", "Engaño", "Perspicacia", "Persuasión"],
    weapons:  ["Daga", "Báculo"],
    tip:      "CAR determina el poder de tus hechizos. CON ayuda con Concentración.",
    statOrder:"CAR > CON > DES",
  },
  warlock: {
    skills:   ["Arcana", "Engaño", "Historia", "Intimidación"],
    weapons:  ["Daga", "Ballesta ligera"],
    tip:      "CAR es tu stat principal. Descansas cortos recuperan tus espacios de conjuro.",
    statOrder:"CAR > CON > DES",
  },
  paladin: {
    skills:   ["Atletismo", "Intimidación", "Medicina", "Persuasión"],
    weapons:  ["Espada larga", "Escudo", "Maza"],
    tip:      "FUE y CAR definen tu combate y tus conjuros. CON para sobrevivir al frente.",
    statOrder:"FUE > CAR > CON",
  },
  rogue: {
    skills:   ["Acrobacias", "Engaño", "Furtividad", "Percepción", "Juego de manos"],
    weapons:  ["Espada corta", "Daga", "Arco corto"],
    tip:      "DES lo es todo para el Pícaro: ataque, defensa y habilidades.",
    statOrder:"DES > INT > CAR",
  },
  barbarian: {
    skills:   ["Atletismo", "Intimidación", "Naturaleza", "Percepción"],
    weapons:  ["Hacha grande", "Lanza", "Mazo"],
    tip:      "FUE y CON son vitales. Sin armadura, CON también sube tu CA.",
    statOrder:"FUE > CON > DES",
  },
  bard: {
    skills:   ["Actuación", "Engaño", "Perspicacia", "Persuasión"],
    weapons:  ["Espada corta", "Daga", "Ballesta ligera"],
    tip:      "CAR impulsa tus hechizos e Inspiración Bárdica. DES para no morir.",
    statOrder:"CAR > DES > CON",
  },
  cleric: {
    skills:   ["Historia", "Medicina", "Perspicacia", "Persuasión"],
    weapons:  ["Maza", "Escudo"],
    tip:      "SAB rige tus conjuros. CON y FUE te mantienen en la primera línea.",
    statOrder:"SAB > CON > FUE",
  },
  druid: {
    skills:   ["Arcana", "Medicina", "Naturaleza", "Percepción"],
    weapons:  ["Báculo", "Hoz"],
    tip:      "SAB es clave. CON ayuda si usas Forma Salvaje con frecuencia.",
    statOrder:"SAB > CON > DES",
  },
  monk: {
    skills:   ["Acrobacias", "Atletismo", "Furtividad", "Historia"],
    weapons:  ["Dardo", "Artes marciales"],
    tip:      "DES y SAB definen tu CA y tus ataques desarmados. Movilidad máxima.",
    statOrder:"DES > SAB > CON",
  },
  ranger: {
    skills:   ["Naturaleza", "Percepción", "Furtividad", "Supervivencia"],
    weapons:  ["Arco largo", "Espada corta", "Daga"],
    tip:      "DES para arquería o FUE para cuerpo a cuerpo. SAB para hechizos.",
    statOrder:"DES > SAB > CON",
  },
};

export interface RaceSynergy {
  bestFor: string[];
  tip: string;
}

const RACE_SYNERGY: Record<string, RaceSynergy> = {
  human:      { bestFor: ["Todas las clases"], tip: "+1 a todo stat: sin punto débil. Ideal para tu primera partida." },
  elf:        { bestFor: ["Mago", "Pícaro", "Explorador"], tip: "+2 DES da ventaja en precisión y CA. Furtividad gratuita." },
  dwarf:      { bestFor: ["Guerrero", "Paladín", "Clérigo"], tip: "+2 CON para sobrevivir. Resistencia al veneno." },
  halfling:   { bestFor: ["Pícaro", "Explorador", "Bardo"], tip: "+2 DES y la habilidad de relanzar 1s. Suerte innata." },
  "half-elf": { bestFor: ["Bardo", "Hechicero", "Brujo", "Paladín"], tip: "+2 CAR y dos stats libres. Versátil y social." },
  "half-orc": { bestFor: ["Bárbaro", "Guerrero"], tip: "+2 FUE +1 CON. Resiliencia: sobrevives a golpes letales." },
  dragonborn: { bestFor: ["Paladín", "Bárbaro", "Hechicero"], tip: "+2 FUE +1 CAR y aliento de dragón como arma extra." },
  gnome:      { bestFor: ["Mago", "Artificiero"], tip: "+2 INT y ventaja en tiradas contra magia mental." },
  tiefling:   { bestFor: ["Brujo", "Hechicero", "Bardo"], tip: "+2 CAR +1 INT. Hechizos raciales gratuitos y resistencia al fuego." },
  aasimar:    { bestFor: ["Paladín", "Hechicero", "Clérigo"], tip: "+2 CAR. Curación gratuita y alas celestiales al nivel 3." },
};

export function getClassSuggestion(classId: string): ClassSuggestion | null {
  return CLASS_SUGGESTIONS[classId] ?? null;
}

export function getRaceSynergy(raceId: string): RaceSynergy | null {
  return RACE_SYNERGY[raceId] ?? null;
}

export function getCombinedTip(classId: string, raceId: string): string | null {
  const cls = CLASS_SUGGESTIONS[classId];
  const race = RACE_SYNERGY[raceId];
  if (!cls || !race) return null;

  const synergy: Record<string, Record<string, string>> = {
    fighter:   { "half-orc": "Combinación brutal — FUE+CON perfecta y Resiliencia evita que caigas." },
    paladin:   { dragonborn: "Paladín Dragonborn es icónico: FUE+CAR, aliento y aura divina.", "half-elf": "CAR extra potencia Imposición de Manos y conjuros." },
    wizard:    { gnome: "INT máxima desde el primer nivel. Ventaja ante magia mental." },
    warlock:   { tiefling: "CAR máxima y resistencia al fuego. El brujo más temido." },
    sorcerer:  { tiefling: "CAR máxima + hechizos raciales gratuitos. Poder desde nivel 1.", dragonborn: "+FUE no ayuda pero el aliento complementa el daño." },
    rogue:     { elf: "DES+2 y Furtividad gratuita. El Pícaro más sigiloso posible." },
    barbarian: { "half-orc": "FUE+2, CON+1 y Resiliencia. La combinación más resistente." },
    bard:      { "half-elf": "CAR+2 y dos stats libres. Social y versátil por naturaleza." },
    cleric:    { dwarf: "CON extra para estar en primera línea. Resistencia al veneno ayuda." },
    druid:     { elf: "DES+2 y armonía con la naturaleza. Trasfondo natural." },
    monk:      { halfling: "DES+2 y relanzar 1s. El monje más consistente y esquivo." },
    ranger:    { elf: "DES+2 y Furtividad gratuita. Arquero o explorador natural." },
  };

  return synergy[classId]?.[raceId] ?? null;
}

export const STAT_COLORS: Record<string, string> = {
  FUE: "#e57373",
  DES: "#81c784",
  CON: "#ffb74d",
  INT: "#64b5f6",
  SAB: "#ce93d8",
  CAR: "#f48fb1",
};
