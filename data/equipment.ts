import type { ClassStartingEquipment, EquipmentItem } from "@/types/character";

export const EQUIPMENT_ITEMS: EquipmentItem[] = [
  { id: "club", name: "Clava", category: "weapon", cost: "1 pp", weightKg: 0.9, damage: "1d4", damageType: "contundente", properties: ["Ligera"], summary: "Arma simple cuerpo a cuerpo." },
  { id: "dagger", name: "Daga", category: "weapon", cost: "2 po", weightKg: 0.5, damage: "1d4", damageType: "perforante", properties: ["Fina", "Ligera", "Arrojadiza"], summary: "Arma simple, discreta y útil para lanzadores." },
  { id: "greatclub", name: "Gran clava", category: "weapon", cost: "2 pp", weightKg: 4.5, damage: "1d8", damageType: "contundente", properties: ["A dos manos"], summary: "Arma simple grande y contundente." },
  { id: "handaxe", name: "Hacha de mano", category: "weapon", cost: "5 po", weightKg: 0.9, damage: "1d6", damageType: "cortante", properties: ["Ligera", "Arrojadiza"], summary: "Arma versátil para cuerpo a cuerpo o lanzamiento corto." },
  { id: "javelin", name: "Jabalina", category: "weapon", cost: "5 pp", weightKg: 0.9, damage: "1d6", damageType: "perforante", properties: ["Arrojadiza"], summary: "Arma simple para abrir combate a distancia." },
  { id: "mace", name: "Maza", category: "weapon", cost: "5 po", weightKg: 1.8, damage: "1d6", damageType: "contundente", summary: "Arma simple común en clérigos." },
  { id: "quarterstaff", name: "Bastón", category: "weapon", cost: "2 pp", weightKg: 1.8, damage: "1d6", damageType: "contundente", properties: ["Versátil 1d8"], summary: "Arma simple que también encaja como foco narrativo." },
  { id: "scimitar", name: "Cimitarra", category: "weapon", cost: "25 po", weightKg: 1.4, damage: "1d6", damageType: "cortante", properties: ["Fina", "Ligera"], summary: "Arma curva usada por druidas y combatientes ágiles." },
  { id: "shortsword", name: "Espada corta", category: "weapon", cost: "10 po", weightKg: 0.9, damage: "1d6", damageType: "perforante", properties: ["Fina", "Ligera"], summary: "Arma marcial ligera para DES." },
  { id: "longsword", name: "Espada larga", category: "weapon", cost: "15 po", weightKg: 1.4, damage: "1d8", damageType: "cortante", properties: ["Versátil 1d10"], summary: "Arma marcial clásica para FUE." },
  { id: "rapier", name: "Estoque", category: "weapon", cost: "25 po", weightKg: 0.9, damage: "1d8", damageType: "perforante", properties: ["Fina"], summary: "Arma de DES elegante y efectiva." },
  { id: "greataxe", name: "Hacha a dos manos", category: "weapon", cost: "30 po", weightKg: 3.2, damage: "1d12", damageType: "cortante", properties: ["Pesada", "A dos manos"], summary: "Arma brutal para bárbaros." },
  { id: "greatsword", name: "Espadón", category: "weapon", cost: "50 po", weightKg: 2.7, damage: "2d6", damageType: "cortante", properties: ["Pesada", "A dos manos"], summary: "Arma pesada de daño estable." },
  { id: "light_crossbow", name: "Ballesta ligera", category: "weapon", cost: "25 po", weightKg: 2.3, damage: "1d8", damageType: "perforante", properties: ["Munición", "Carga", "A dos manos"], summary: "Ataque a distancia sencillo para varias clases." },
  { id: "shortbow", name: "Arco corto", category: "weapon", cost: "25 po", weightKg: 0.9, damage: "1d6", damageType: "perforante", properties: ["Munición", "A dos manos"], summary: "Arco ligero para exploración y sigilo." },
  { id: "longbow", name: "Arco largo", category: "weapon", cost: "50 po", weightKg: 0.9, damage: "1d8", damageType: "perforante", properties: ["Munición", "Pesada", "A dos manos"], summary: "Arco marcial de largo alcance." },
  { id: "dart", name: "Dardo", category: "weapon", cost: "5 pc", weightKg: 0.1, damage: "1d4", damageType: "perforante", properties: ["Fina", "Arrojadiza"], summary: "Arma arrojadiza ligera." },
  { id: "warhammer", name: "Martillo de guerra", category: "weapon", cost: "15 po", weightKg: 0.9, damage: "1d8", damageType: "contundente", properties: ["Versátil 1d10"], summary: "Arma marcial contundente." },

  { id: "padded_armor", name: "Armadura acolchada", category: "armor", cost: "5 po", weightKg: 3.6, armorClass: "11 + DES", stealthDisadvantage: true, summary: "Armadura ligera barata, pero mala para sigilo." },
  { id: "leather_armor", name: "Armadura de cuero", category: "armor", cost: "10 po", weightKg: 4.5, armorClass: "11 + DES", summary: "Armadura ligera estándar para personajes ágiles." },
  { id: "studded_leather", name: "Cuero tachonado", category: "armor", cost: "45 po", weightKg: 5.9, armorClass: "12 + DES", summary: "Mejor armadura ligera común." },
  { id: "hide_armor", name: "Pieles", category: "armor", cost: "10 po", weightKg: 5.4, armorClass: "12 + DES máx 2", summary: "Armadura media rústica." },
  { id: "scale_mail", name: "Cota de escamas", category: "armor", cost: "50 po", weightKg: 20.3, armorClass: "14 + DES máx 2", stealthDisadvantage: true, summary: "Armadura media defensiva para clérigos y exploradores." },
  { id: "chain_mail", name: "Cota de mallas", category: "armor", cost: "75 po", weightKg: 24.8, armorClass: "16", strengthRequirement: 13, stealthDisadvantage: true, summary: "Armadura pesada inicial para guerreros y paladines." },
  { id: "shield", name: "Escudo", category: "shield", cost: "10 po", weightKg: 2.7, armorClass: "+2 CA", summary: "Ocupa una mano y aumenta la defensa." },

  { id: "component_pouch", name: "Bolsa de componentes", category: "focus", cost: "25 po", weightKg: 0.9, summary: "Materiales comunes para lanzar conjuros." },
  { id: "arcane_focus", name: "Foco arcano", category: "focus", cost: "10 po", weightKg: 0.9, summary: "Canalizador para conjuros arcanos." },
  { id: "druidic_focus", name: "Foco druídico", category: "focus", cost: "1 po", weightKg: 0.9, summary: "Canalizador natural para conjuros de druida." },
  { id: "holy_symbol", name: "Símbolo sagrado", category: "focus", cost: "5 po", weightKg: 0.5, summary: "Foco de clérigos y paladines." },
  { id: "spellbook", name: "Libro de conjuros", category: "adventuringGear", cost: "50 po", weightKg: 1.4, summary: "Grimorio donde el mago guarda sus conjuros." },
  { id: "thieves_tools", name: "Herramientas de ladrón", category: "tool", cost: "25 po", weightKg: 0.5, summary: "Ganzúas y útiles para cerraduras y trampas." },
  { id: "herbalism_kit", name: "Kit de herborista", category: "tool", cost: "5 po", weightKg: 1.4, summary: "Herramientas para preparar remedios y trabajar con plantas." },
  { id: "lute", name: "Laúd", category: "tool", cost: "35 po", weightKg: 0.9, summary: "Instrumento musical y foco narrativo para bardos." },
  // El bardo elige uno de estos diez instrumentos al crear el personaje. Los
  // nueve que no eran el laúd se ofrecían sin existir en el catálogo: quien
  // elegía la gaita se quedaba con la ficha vacía en su lugar.
  { id: "bagpipes", name: "Gaita", category: "tool", cost: "30 po", weightKg: 2.7, summary: "Instrumento musical." },
  { id: "drum", name: "Tambor", category: "tool", cost: "6 po", weightKg: 1.4, summary: "Instrumento musical." },
  { id: "dulcimer", name: "Salterio", category: "tool", cost: "25 po", weightKg: 4.5, summary: "Instrumento musical." },
  { id: "flute", name: "Flauta", category: "tool", cost: "2 po", weightKg: 0.5, summary: "Instrumento musical." },
  { id: "horn", name: "Cuerno", category: "tool", cost: "3 po", weightKg: 0.9, summary: "Instrumento musical." },
  { id: "lyre", name: "Lira", category: "tool", cost: "30 po", weightKg: 0.9, summary: "Instrumento musical." },
  { id: "pan_flute", name: "Flauta de pan", category: "tool", cost: "12 po", weightKg: 0.9, summary: "Instrumento musical." },
  { id: "shawm", name: "Chirimía", category: "tool", cost: "2 po", weightKg: 0.5, summary: "Instrumento musical." },
  { id: "viol", name: "Viola", category: "tool", cost: "30 po", weightKg: 0.5, summary: "Instrumento musical." },
  // Añadido de la casa: el piano no figura entre los diez instrumentos del
  // manual. Se ofrece igual porque el juego es nuestro, no del libro.
  { id: "piano", name: "Piano", category: "tool", cost: "30 po", weightKg: 4.5, summary: "Instrumento musical." },

  { id: "explorers_pack", name: "Paquete de explorador", category: "pack", cost: "10 po", weightKg: 26.6, summary: "Mochila, saco de dormir, raciones, yesca, antorchas, cuerda y útiles de viaje." },
  { id: "dungeoneers_pack", name: "Paquete de aventurero de mazmorras", category: "pack", cost: "12 po", weightKg: 27.7, summary: "Equipo para cuevas y ruinas: palanca, martillo, pitones, antorchas, cuerda y raciones." },
  { id: "burglars_pack", name: "Paquete de ladrón", category: "pack", cost: "16 po", weightKg: 20, summary: "Equipo de infiltración: mochila, cuerda, campanilla, velas, palanca y otros útiles." },
  { id: "diplomats_pack", name: "Paquete de diplomático", category: "pack", cost: "39 po", weightKg: 17.6, summary: "Estuche, tinta, pergaminos, ropa fina y materiales para encuentros sociales." },
  { id: "entertainers_pack", name: "Paquete de artista", category: "pack", cost: "40 po", weightKg: 17.1, summary: "Disfraces, utensilios de actuación, raciones y equipo de viaje ligero." },
  { id: "priests_pack", name: "Paquete de sacerdote", category: "pack", cost: "19 po", weightKg: 10.8, summary: "Velas, incienso, limosnero, vestimentas, raciones y útiles religiosos." },
  { id: "scholars_pack", name: "Paquete de erudito", category: "pack", cost: "40 po", weightKg: 4.5, summary: "Libro de saber, tinta, pluma, pergamino y útiles académicos." },
  { id: "arrows_20", name: "20 flechas", category: "adventuringGear", cost: "1 po", weightKg: 0.5, summary: "Munición para arcos." },
  { id: "bolts_20", name: "20 virotes", category: "adventuringGear", cost: "1 po", weightKg: 0.7, summary: "Munición para ballestas." },
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
      { choose: 1, from: ["lute", "bagpipes", "drum", "dulcimer", "flute", "horn", "lyre", "pan_flute", "shawm", "viol", "piano"], note: "Instrumento musical a elección; laúd como default." },
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
      // El foco druídico no se elige: el manual lo concede, y ya está en
      // beginnerLoadout. Como "elección" de una sola opción sólo era un paso
      // de más en el asistente.
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
