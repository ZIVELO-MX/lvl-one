import type { ClassStartingEquipment, EquipmentItem } from "@/types/character";

export const EQUIPMENT_ITEMS: EquipmentItem[] = [
  { id: "club", name: "Clava", category: "weapon", damage: "1d4", damageType: "contundente", properties: ["Ligera"], summary: "Arma simple cuerpo a cuerpo." },
  { id: "dagger", name: "Daga", category: "weapon", damage: "1d4", damageType: "perforante", properties: ["Fina", "Ligera", "Arrojadiza"], summary: "Arma simple, discreta y útil para lanzadores." },
  { id: "greatclub", name: "Gran clava", category: "weapon", damage: "1d8", damageType: "contundente", properties: ["A dos manos"], summary: "Arma simple grande y contundente." },
  { id: "handaxe", name: "Hacha de mano", category: "weapon", damage: "1d6", damageType: "cortante", properties: ["Ligera", "Arrojadiza"], summary: "Arma versátil para cuerpo a cuerpo o lanzamiento corto." },
  { id: "javelin", name: "Jabalina", category: "weapon", damage: "1d6", damageType: "perforante", properties: ["Arrojadiza"], summary: "Arma simple para abrir combate a distancia." },
  { id: "mace", name: "Maza", category: "weapon", damage: "1d6", damageType: "contundente", summary: "Arma simple común en clérigos." },
  { id: "quarterstaff", name: "Bastón", category: "weapon", damage: "1d6", damageType: "contundente", properties: ["Versátil 1d8"], summary: "Arma simple que también encaja como foco narrativo." },
  { id: "scimitar", name: "Cimitarra", category: "weapon", damage: "1d6", damageType: "cortante", properties: ["Fina", "Ligera"], summary: "Arma curva usada por druidas y combatientes ágiles." },
  { id: "shortsword", name: "Espada corta", category: "weapon", damage: "1d6", damageType: "perforante", properties: ["Fina", "Ligera"], summary: "Arma marcial ligera para DES." },
  { id: "longsword", name: "Espada larga", category: "weapon", damage: "1d8", damageType: "cortante", properties: ["Versátil 1d10"], summary: "Arma marcial clásica para FUE." },
  { id: "rapier", name: "Estoque", category: "weapon", damage: "1d8", damageType: "perforante", properties: ["Fina"], summary: "Arma de DES elegante y efectiva." },
  { id: "greataxe", name: "Hacha a dos manos", category: "weapon", damage: "1d12", damageType: "cortante", properties: ["Pesada", "A dos manos"], summary: "Arma brutal para bárbaros." },
  { id: "greatsword", name: "Espadón", category: "weapon", damage: "2d6", damageType: "cortante", properties: ["Pesada", "A dos manos"], summary: "Arma pesada de daño estable." },
  { id: "light_crossbow", name: "Ballesta ligera", category: "weapon", damage: "1d8", damageType: "perforante", properties: ["Munición", "Carga", "A dos manos"], summary: "Ataque a distancia sencillo para varias clases." },
  { id: "shortbow", name: "Arco corto", category: "weapon", damage: "1d6", damageType: "perforante", properties: ["Munición", "A dos manos"], summary: "Arco ligero para exploración y sigilo." },
  { id: "longbow", name: "Arco largo", category: "weapon", damage: "1d8", damageType: "perforante", properties: ["Munición", "Pesada", "A dos manos"], summary: "Arco marcial de largo alcance." },
  { id: "dart", name: "Dardo", category: "weapon", damage: "1d4", damageType: "perforante", properties: ["Fina", "Arrojadiza"], summary: "Arma arrojadiza ligera." },
  { id: "warhammer", name: "Martillo de guerra", category: "weapon", damage: "1d8", damageType: "contundente", properties: ["Versátil 1d10"], summary: "Arma marcial contundente." },

  { id: "padded_armor", name: "Armadura acolchada", category: "armor", armorClass: "11 + DES", stealthDisadvantage: true, summary: "Armadura ligera barata, pero mala para sigilo." },
  { id: "leather_armor", name: "Armadura de cuero", category: "armor", armorClass: "11 + DES", summary: "Armadura ligera estándar para personajes ágiles." },
  { id: "studded_leather", name: "Cuero tachonado", category: "armor", armorClass: "12 + DES", summary: "Mejor armadura ligera común." },
  { id: "hide_armor", name: "Pieles", category: "armor", armorClass: "12 + DES máx 2", summary: "Armadura media rústica." },
  { id: "scale_mail", name: "Cota de escamas", category: "armor", armorClass: "14 + DES máx 2", stealthDisadvantage: true, summary: "Armadura media defensiva para clérigos y exploradores." },
  { id: "chain_mail", name: "Cota de mallas", category: "armor", armorClass: "16", strengthRequirement: 13, stealthDisadvantage: true, summary: "Armadura pesada inicial para guerreros y paladines." },
  { id: "shield", name: "Escudo", category: "shield", armorClass: "+2 CA", summary: "Ocupa una mano y aumenta la defensa." },

  { id: "component_pouch", name: "Bolsa de componentes", category: "focus", summary: "Materiales comunes para lanzar conjuros." },
  { id: "arcane_focus", name: "Foco arcano", category: "focus", summary: "Canalizador para conjuros arcanos." },
  { id: "druidic_focus", name: "Foco druídico", category: "focus", summary: "Canalizador natural para conjuros de druida." },
  { id: "holy_symbol", name: "Símbolo sagrado", category: "focus", summary: "Foco de clérigos y paladines." },
  { id: "spellbook", name: "Libro de conjuros", category: "adventuringGear", summary: "Grimorio donde el mago guarda sus conjuros." },
  { id: "thieves_tools", name: "Herramientas de ladrón", category: "tool", summary: "Ganzúas y útiles para cerraduras y trampas." },
  { id: "herbalism_kit", name: "Kit de herborista", category: "tool", summary: "Herramientas para preparar remedios y trabajar con plantas." },
  { id: "lute", name: "Laúd", category: "tool", summary: "Instrumento musical y foco narrativo para bardos." },

  { id: "explorers_pack", name: "Paquete de explorador", category: "pack", summary: "Mochila, saco de dormir, raciones, yesca, antorchas, cuerda y útiles de viaje." },
  { id: "dungeoneers_pack", name: "Paquete de aventurero de mazmorras", category: "pack", summary: "Equipo para cuevas y ruinas: palanca, martillo, pitones, antorchas, cuerda y raciones." },
  { id: "burglars_pack", name: "Paquete de ladrón", category: "pack", summary: "Equipo de infiltración: mochila, cuerda, campanilla, velas, palanca y otros útiles." },
  { id: "diplomats_pack", name: "Paquete de diplomático", category: "pack", summary: "Estuche, tinta, pergaminos, ropa fina y materiales para encuentros sociales." },
  { id: "entertainers_pack", name: "Paquete de artista", category: "pack", summary: "Disfraces, utensilios de actuación, raciones y equipo de viaje ligero." },
  { id: "priests_pack", name: "Paquete de sacerdote", category: "pack", summary: "Velas, incienso, limosnero, vestimentas, raciones y útiles religiosos." },
  { id: "scholars_pack", name: "Paquete de erudito", category: "pack", summary: "Libro de saber, tinta, pluma, pergamino y útiles académicos." },
  { id: "arrows_20", name: "20 flechas", category: "adventuringGear", summary: "Munición para arcos." },
  { id: "bolts_20", name: "20 virotes", category: "adventuringGear", summary: "Munición para ballestas." },
];

export const CLASS_STARTING_EQUIPMENT: ClassStartingEquipment[] = [
  {
    classId: "barbarian",
    beginnerLoadout: ["greataxe", "explorers_pack", "javelin", "javelin", "javelin", "javelin"],
    choices: [
      { choose: 1, from: ["greataxe", "greatsword"], note: "Arma marcial principal." },
      { choose: 1, from: ["handaxe", "javelin"], note: "Dos hachas de mano o cualquier arma simple arrojadiza." },
    ],
    goldAlternative: "2d4 x 10 po",
  },
  {
    classId: "bard",
    beginnerLoadout: ["rapier", "leather_armor", "dagger", "lute", "diplomats_pack"],
    choices: [
      { choose: 1, from: ["rapier", "longsword", "quarterstaff"], note: "Arma elegante o arma simple." },
      { choose: 1, from: ["diplomats_pack", "entertainers_pack"], note: "Pack social o de artista." },
      { choose: 1, from: ["lute", "bagpipes", "drum", "dulcimer", "flute", "horn", "lyre", "pan_flute", "shawm", "viol"], note: "Instrumento musical a elección; laúd como default." },
    ],
    goldAlternative: "5d4 x 10 po",
  },
  {
    classId: "cleric",
    beginnerLoadout: ["mace", "scale_mail", "shield", "holy_symbol", "priests_pack", "light_crossbow", "bolts_20"],
    choices: [
      { choose: 1, from: ["mace", "warhammer"], note: "Martillo de guerra (requiere: Dominio de la Guerra).", requires: { "warhammer": ["war_domain"] } },
      { choose: 1, from: ["scale_mail", "leather_armor", "chain_mail"], note: "Cota de mallas (requiere: Vida, Guerra, Naturaleza o Tempestad).", requires: { "chain_mail": ["life_domain", "war_domain", "nature_domain", "tempest_domain"] } },
      { choose: 1, from: ["light_crossbow", "quarterstaff"], note: "Arma a distancia o cuerpo a cuerpo." },
      { choose: 1, from: ["priests_pack", "explorers_pack"], note: "Pack inicial." },
    ],
    goldAlternative: "5d4 x 10 po",
  },
  {
    classId: "druid",
    beginnerLoadout: ["leather_armor", "explorers_pack", "druidic_focus"],
    choices: [
      { choose: 1, from: ["shield", "club", "dagger", "dart", "greatclub", "handaxe", "javelin", "mace", "quarterstaff"], note: "Escudo no metálico o cualquier arma simple." },
      { choose: 1, from: ["scimitar", "quarterstaff"], note: "Arma principal." },
      { choose: 1, from: ["druidic_focus"], note: "Foco de conjuro." },
    ],
    goldAlternative: "2d4 x 10 po",
  },
  {
    classId: "fighter",
    beginnerLoadout: ["chain_mail", "longsword", "shield", "light_crossbow", "bolts_20", "dungeoneers_pack"],
    choices: [
      { choose: 1, from: ["chain_mail", "leather_armor", "longbow", "arrows_20"], note: "Cota de mallas, o armadura de cuero + arco largo." },
      { choose: 1, from: ["longsword", "greatsword"], note: "Arma marcial cuerpo a cuerpo principal." },
      { choose: 1, from: ["shield", "longsword"], note: "Escudo + espada, o dos armas marciales." },
      { choose: 1, from: ["light_crossbow", "handaxe"], note: "Ballesta ligera + 20 virotes, o dos hachas de mano." },
      { choose: 1, from: ["dungeoneers_pack", "explorers_pack"], note: "Pack inicial." },
    ],
    goldAlternative: "5d4 x 10 po",
  },
  {
    classId: "monk",
    beginnerLoadout: ["shortsword", "dart", "dart", "dart", "dart", "dart", "dart", "dart", "dart", "dart", "dart", "dungeoneers_pack"],
    choices: [
      { choose: 1, from: ["shortsword", "quarterstaff"], note: "Arma de monje inicial." },
      { choose: 1, from: ["dungeoneers_pack", "explorers_pack"], note: "Pack inicial." },
    ],
    goldAlternative: "5d4 po",
  },
  {
    classId: "paladin",
    beginnerLoadout: ["chain_mail", "holy_symbol", "shield", "javelin", "javelin", "javelin", "javelin", "javelin"],
    choices: [
      { choose: 1, from: ["longsword", "greatsword"], note: "Arma marcial principal (el escudo viene incluido)." },
      { choose: 1, from: ["javelin", "club", "mace", "quarterstaff"], note: "5 jabalinas o cualquier arma simple cuerpo a cuerpo." },
      { choose: 1, from: ["priests_pack", "explorers_pack"], note: "Pack inicial." },
    ],
    goldAlternative: "5d4 x 10 po",
  },
  {
    classId: "ranger",
    beginnerLoadout: ["scale_mail", "shortsword", "shortsword", "longbow", "arrows_20", "dungeoneers_pack"],
    choices: [
      { choose: 1, from: ["scale_mail", "leather_armor"], note: "Armadura media o sigilosa." },
      { choose: 1, from: ["shortsword", "club", "dagger", "mace", "quarterstaff"], note: "Dos espadas cortas o dos armas simples." },
      { choose: 1, from: ["dungeoneers_pack", "explorers_pack"], note: "Pack inicial." },
    ],
    goldAlternative: "5d4 x 10 po",
  },
  {
    classId: "rogue",
    beginnerLoadout: ["rapier", "shortbow", "arrows_20", "leather_armor", "dagger", "dagger", "thieves_tools", "burglars_pack"],
    choices: [
      { choose: 1, from: ["rapier", "shortsword"], note: "Arma fina principal." },
      { choose: 1, from: ["shortbow", "shortsword"], note: "Rango o segunda arma." },
      { choose: 1, from: ["burglars_pack", "dungeoneers_pack", "explorers_pack"], note: "Pack inicial." },
    ],
    goldAlternative: "4d4 x 10 po",
  },
  {
    classId: "sorcerer",
    beginnerLoadout: ["light_crossbow", "bolts_20", "component_pouch", "dagger", "dagger", "dungeoneers_pack"],
    choices: [
      { choose: 1, from: ["light_crossbow", "dagger", "quarterstaff", "mace", "club", "greatclub", "javelin", "handaxe"], note: "Ballesta ligera + 20 virotes, o cualquier arma simple." },
      { choose: 1, from: ["component_pouch", "arcane_focus"], note: "Herramienta para lanzar conjuros." },
      { choose: 1, from: ["dungeoneers_pack", "explorers_pack"], note: "Pack inicial." },
    ],
    goldAlternative: "3d4 x 10 po",
  },
  {
    classId: "warlock",
    beginnerLoadout: ["component_pouch", "leather_armor", "dagger", "dagger", "scholars_pack"],
    choices: [
      { choose: 1, from: ["light_crossbow", "quarterstaff", "club", "dagger", "mace", "handaxe", "javelin"], note: "Ballesta ligera + 20 virotes, o cualquier arma simple." },
      { choose: 1, from: ["component_pouch", "arcane_focus"], note: "Herramienta para lanzar conjuros." },
      { choose: 1, from: ["scholars_pack", "dungeoneers_pack"], note: "Pack inicial." },
    ],
    goldAlternative: "4d4 x 10 po",
  },
  {
    classId: "wizard",
    beginnerLoadout: ["quarterstaff", "component_pouch", "spellbook", "scholars_pack"],
    choices: [
      { choose: 1, from: ["quarterstaff", "dagger"], note: "Arma simple de respaldo." },
      { choose: 1, from: ["component_pouch", "arcane_focus"], note: "Herramienta para lanzar conjuros." },
      { choose: 1, from: ["scholars_pack", "explorers_pack"], note: "Pack inicial." },
    ],
    goldAlternative: "4d4 x 10 po",
  },
];

export function startingEquipmentForClass(classId: string): ClassStartingEquipment | undefined {
  return CLASS_STARTING_EQUIPMENT.find((entry) => entry.classId === classId);
}

export function defaultEquipmentFor(classId: string): string[] {
  return startingEquipmentForClass(classId)?.beginnerLoadout ?? [];
}
