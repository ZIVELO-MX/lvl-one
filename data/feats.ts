import type { StatKey } from "@/types/character";

export type FeatType = "combat" | "magic" | "general" | "racial";

export interface FeatPrerequisite {
  minLevel?: number;
  race?: string;
  class?: string;
  minStat?: { stat: string; value: number };
}

export interface Feat {
  id: string;
  name: string;
  description: string;
  prerequisite?: FeatPrerequisite;
  type: FeatType;
  sourceTag?: string;
}

export interface FeatCharacterSnapshot {
  level: number;
  race: string;
  class: string;
  stats: Record<string, number>;
}

export const FEATS: Feat[] = [
  { id: "alert", name: "Alerta", type: "general", description: "Mejoras iniciativa y es mas dificil sorprenderte o atacarte desde oculto.", sourceTag: "PHB" },
  { id: "athlete", name: "Atleta", type: "general", prerequisite: { minStat: { stat: "FUE", value: 13 } }, description: "Tu entrenamiento fisico mejora trepar, saltar, levantarte y una caracteristica fisica.", sourceTag: "PHB" },
  { id: "actor", name: "Actor", type: "general", prerequisite: { minStat: { stat: "CAR", value: 13 } }, description: "Imitas voces, gestos y personalidades con mucha mas precision.", sourceTag: "PHB" },
  { id: "charger", name: "Cargador", type: "combat", description: "Puedes convertir una carrera en un ataque o empujon contundente.", sourceTag: "PHB" },
  { id: "crossbow_expert", name: "Experto en ballesta", type: "combat", description: "Ignoras trabas comunes de ballestas y peleas mejor a corta distancia.", sourceTag: "PHB" },
  { id: "defensive_duelist", name: "Duelista defensivo", type: "combat", prerequisite: { minStat: { stat: "DES", value: 13 } }, description: "Usas una reaccion con arma fina para aumentar tu defensa contra un ataque.", sourceTag: "PHB" },
  { id: "dual_wielder", name: "Combatiente con dos armas", type: "combat", description: "Mejoras defensa y manejo de armas al luchar con dos armas.", sourceTag: "PHB" },
  { id: "dungeon_delver", name: "Explorador de mazmorras", type: "general", description: "Detectas trampas y secretos con mas seguridad y resistes mejor sus efectos.", sourceTag: "PHB" },
  { id: "durable", name: "Duro", type: "general", prerequisite: { minStat: { stat: "CON", value: 13 } }, description: "Tus descansos cortos recuperan vida de forma mas fiable.", sourceTag: "PHB" },
  { id: "elemental_adept", name: "Adepto elemental", type: "magic", prerequisite: { minLevel: 4 }, description: "Eliges un tipo de dano elemental; tus conjuros de ese tipo penetran resistencia.", sourceTag: "PHB" },
  { id: "grappler", name: "Presa experta", type: "combat", prerequisite: { minStat: { stat: "FUE", value: 13 } }, description: "Eres mas peligroso al agarrar e inmovilizar criaturas.", sourceTag: "PHB" },
  { id: "great_weapon_master", name: "Maestro de armas pesadas", type: "combat", prerequisite: { minStat: { stat: "FUE", value: 13 } }, description: "Aprovechas criticos y golpes finales; puedes aceptar penalizacion para hacer mucho mas dano.", sourceTag: "PHB" },
  { id: "healer", name: "Sanador", type: "general", description: "Usas kits de sanador para estabilizar y recuperar PG de aliados.", sourceTag: "PHB" },
  { id: "heavily_armored", name: "Armadura pesada", type: "combat", prerequisite: { class: "fighter" }, description: "Ganas competencia con armadura pesada y mejoras fuerza.", sourceTag: "PHB" },
  { id: "heavy_armor_master", name: "Maestro de armadura pesada", type: "combat", prerequisite: { minStat: { stat: "FUE", value: 15 } }, description: "La armadura pesada reduce dano fisico comun que recibes.", sourceTag: "PHB" },
  { id: "inspiring_leader", name: "Lider inspirador", type: "general", prerequisite: { minStat: { stat: "CAR", value: 13 } }, description: "Con un discurso breve das puntos de golpe temporales al grupo.", sourceTag: "PHB" },
  { id: "keen_mind", name: "Mente aguda", type: "general", prerequisite: { minStat: { stat: "INT", value: 13 } }, description: "Recuerdas detalles, orientacion y paso del tiempo con precision extraordinaria.", sourceTag: "PHB" },
  { id: "lightly_armored", name: "Armadura ligera", type: "combat", description: "Ganas competencia con armadura ligera y mejoras una caracteristica fisica.", sourceTag: "PHB" },
  { id: "linguist", name: "Linguista", type: "general", prerequisite: { minStat: { stat: "INT", value: 13 } }, description: "Aprendes idiomas y puedes crear cifrados propios.", sourceTag: "PHB" },
  { id: "lucky", name: "Afortunado", type: "general", description: "Ganas puntos de suerte para alterar tiradas importantes.", sourceTag: "PHB" },
  { id: "mage_slayer", name: "Cazador de magos", type: "combat", description: "Presionas lanzadores cercanos y resistes mejor sus conjuros.", sourceTag: "PHB" },
  { id: "magic_initiate", name: "Iniciado magico", type: "magic", description: "Aprendes dos trucos y un conjuro de nivel 1 de otra lista de clase.", sourceTag: "PHB" },
  { id: "martial_adept", name: "Adepto marcial", type: "combat", description: "Aprendes maniobras y un dado de superioridad de Maestro de batalla.", sourceTag: "PHB" },
  { id: "medium_armor_master", name: "Maestro de armadura media", type: "combat", prerequisite: { minStat: { stat: "DES", value: 13 } }, description: "Aprovechas mejor armadura media y reduces sus desventajas.", sourceTag: "PHB" },
  { id: "mobile", name: "Movil", type: "combat", description: "Ganas velocidad, ignoras terreno dificil al correr y evitas represalias de objetivos atacados.", sourceTag: "PHB" },
  { id: "moderately_armored", name: "Armadura media", type: "combat", description: "Ganas competencia con armadura media y escudos.", sourceTag: "PHB" },
  { id: "mounted_combatant", name: "Combatiente montado", type: "combat", description: "Proteges tu montura y peleas mejor contra criaturas no montadas.", sourceTag: "PHB" },
  { id: "observant", name: "Observador", type: "general", prerequisite: { minStat: { stat: "SAB", value: 13 } }, description: "Lees labios y mejoras percepcion e investigacion pasivas.", sourceTag: "PHB" },
  { id: "polearm_master", name: "Maestro de armas de asta", type: "combat", description: "Ganas ataques adicionales y control con armas de asta.", sourceTag: "PHB" },
  { id: "resilient", name: "Resiliente", type: "general", description: "Mejoras una caracteristica y ganas competencia en sus salvaciones.", sourceTag: "PHB" },
  { id: "ritual_caster", name: "Lanzador ritual", type: "magic", prerequisite: { minStat: { stat: "INT", value: 13 } }, description: "Aprendes rituales en un libro y puedes ampliarlo durante aventuras.", sourceTag: "PHB" },
  { id: "savage_attacker", name: "Atacante salvaje", type: "combat", description: "Una vez por turno puedes repetir dados de dano de arma y quedarte con el mejor resultado.", sourceTag: "PHB" },
  { id: "sentinel", name: "Centinela", type: "combat", description: "Detienes movimiento enemigo y castigas ataques contra aliados cercanos.", sourceTag: "PHB" },
  { id: "sharpshooter", name: "Tirador experto", type: "combat", prerequisite: { minStat: { stat: "DES", value: 13 } }, description: "Ignoras cobertura parcial y distancia; puedes aceptar penalizacion para mas dano.", sourceTag: "PHB" },
  { id: "shield_master", name: "Maestro del escudo", type: "combat", description: "Usas escudo para empujar, protegerte y mejorar salvaciones de Destreza.", sourceTag: "PHB" },
  { id: "skilled", name: "Habilidoso", type: "general", description: "Ganas tres competencias en habilidades o herramientas.", sourceTag: "PHB" },
  { id: "skulker", name: "Acechador", type: "combat", prerequisite: { minStat: { stat: "DES", value: 13 } }, description: "Te ocultas mejor, disparas desde sombras y ves mejor con luz tenue.", sourceTag: "PHB" },
  { id: "spell_sniper", name: "Francotirador magico", type: "magic", prerequisite: { minLevel: 4 }, description: "Duplicas alcance de ataques de conjuro, ignoras cobertura parcial y aprendes un truco ofensivo.", sourceTag: "PHB" },
  { id: "tavern_brawler", name: "Luchador de taberna", type: "combat", description: "Improvisas armas, golpeas sin armas y agarras mejor tras impactar.", sourceTag: "PHB" },
  { id: "tough", name: "Duro de matar", type: "general", description: "Tu maximo de PG aumenta por cada nivel actual y futuro.", sourceTag: "PHB" },
  { id: "war_caster", name: "Conjurador de guerra", type: "magic", prerequisite: { minLevel: 4 }, description: "Mantienes concentracion mejor y puedes lanzar conjuros al provocar ataques de oportunidad.", sourceTag: "PHB" },
  { id: "weapon_master", name: "Maestro de armas", type: "combat", description: "Aprendes competencia con cuatro armas y mejoras una caracteristica fisica.", sourceTag: "PHB" },
  { id: "dwarven_fortitude", name: "Fortaleza enana", type: "racial", prerequisite: { race: "dwarf" }, description: "Tu resistencia enana mejora tu recuperacion al defenderte.", sourceTag: "XGE" },
  { id: "elven_accuracy", name: "Precision elfica", type: "racial", prerequisite: { race: "elf" }, description: "Cuando tienes ventaja con DES, INT, SAB o CAR, tu punteria se vuelve excepcional.", sourceTag: "XGE" },
  { id: "dragon_fear", name: "Miedo draconico", type: "racial", prerequisite: { race: "dragonborn" }, description: "Canalizas presencia draconica para asustar enemigos cercanos.", sourceTag: "XGE" },
];

function normalize(value: string | undefined): string {
  return (value ?? "").toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

function statValue(stats: Record<string, number>, stat: string): number {
  const normalized = normalize(stat);
  const key = Object.keys(stats).find((candidate) => normalize(candidate) === normalized) as StatKey | undefined;
  return key ? stats[key] ?? 0 : 0;
}

export function meetsFeatPrerequisite(feat: Feat, char: FeatCharacterSnapshot): boolean {
  const prerequisite = feat.prerequisite;
  if (!prerequisite) return true;
  if (prerequisite.minLevel !== undefined && char.level < prerequisite.minLevel) return false;
  if (prerequisite.race && normalize(char.race) !== normalize(prerequisite.race)) return false;
  if (prerequisite.class && normalize(char.class) !== normalize(prerequisite.class)) return false;
  if (prerequisite.minStat && statValue(char.stats, prerequisite.minStat.stat) < prerequisite.minStat.value) return false;
  return true;
}

export function getFeatsByPrerequisite(char: FeatCharacterSnapshot): Feat[] {
  return FEATS.filter((feat) => meetsFeatPrerequisite(feat, char));
}
