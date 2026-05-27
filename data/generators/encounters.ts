import { pickRandom, randomInt } from "@/lib/random";

export const BIOMES = ["bosque", "mazmorra", "ciudad", "costa", "tundra", "desierto", "montaña", "pantano"];

interface EncounterTable {
  biome: string;
  minLevel: number;
  maxLevel: number;
  descriptions: string[];
  monsters: string[];
  notes: string[];
}

const ENCOUNTER_TABLES: EncounterTable[] = [
  {
    biome: "bosque",
    minLevel: 1,
    maxLevel: 4,
    descriptions: ["Un sendero cerrado por zarzas se mueve como si respirara.", "Huellas recientes rodean un campamento abandonado."],
    monsters: ["Lobos", "Bandidos", "Arañas gigantes", "Exploradores corrompidos"],
    notes: ["Buen encuentro para emboscada ligera.", "Incluye terreno dificil y cobertura natural."],
  },
  {
    biome: "bosque",
    minLevel: 5,
    maxLevel: 20,
    descriptions: ["Un claro antiguo esta marcado por piedras con runas verdes.", "Un arbol hueco guarda una escalera hacia tuneles vivos."],
    monsters: ["Osos lechuza", "Dríadas hostiles", "Trolls", "Ents enfermos"],
    notes: ["Usa magia ambiental y objetivos no letales.", "Permite negociar si el grupo protege el bosque."],
  },
  {
    biome: "mazmorra",
    minLevel: 1,
    maxLevel: 4,
    descriptions: ["Una puerta de hierro vibra con golpes desde el otro lado.", "El pasillo huele a aceite y piedra recien rota."],
    monsters: ["Kobolds", "Esqueletos", "Goblins", "Ratas gigantes"],
    notes: ["Agrega trampas simples entre oleadas.", "Ideal para enseñar posicionamiento."],
  },
  {
    biome: "mazmorra",
    minLevel: 5,
    maxLevel: 20,
    descriptions: ["Un sello arcano falla y libera ecos de una prision antigua.", "Las antorchas se apagan una por una antes de cada rugido."],
    monsters: ["Golems", "Momias", "Magos renegados", "Demonios menores"],
    notes: ["El entorno debe cambiar durante la pelea.", "Premia investigar runas antes de entrar."],
  },
  {
    biome: "ciudad",
    minLevel: 1,
    maxLevel: 4,
    descriptions: ["Una persecucion cruza un mercado lleno de puestos fragiles.", "Un callejon se bloquea con carretas justo cuando cae la noche."],
    monsters: ["Rufianes", "Espias", "Guardias corruptos", "Asesinos novatos"],
    notes: ["Incluye testigos y consecuencias legales.", "Permite resolver con soborno o intimidacion."],
  },
  {
    biome: "ciudad",
    minLevel: 5,
    maxLevel: 20,
    descriptions: ["Un baile noble se convierte en toma de rehenes.", "Una estatua publica despierta bajo control de un conjurador."],
    monsters: ["Asesinos", "Veteranos", "Cultistas de elite", "Constructos guardianes"],
    notes: ["Protege inocentes para subir tension.", "Usa verticalidad: balcones, tejados y campanarios."],
  },
  {
    biome: "costa",
    minLevel: 1,
    maxLevel: 20,
    descriptions: ["La marea deja al descubierto una cueva que no estaba en los mapas.", "Un barco sin tripulacion encalla con la bodega cerrada por dentro."],
    monsters: ["Sahuagin", "Piratas", "Cangrejos gigantes", "Sirenas hostiles"],
    notes: ["El agua cambia rutas y riesgos cada ronda.", "Incluye rescate o carga valiosa como objetivo."],
  },
  {
    biome: "tundra",
    minLevel: 1,
    maxLevel: 20,
    descriptions: ["Una tormenta blanca revela siluetas que caminan contra el viento.", "Bajo el hielo se ve una luz roja moviendose lentamente."],
    monsters: ["Lobos invernales", "Gigantes de escarcha", "No-muertos congelados", "Bestias hambrientas"],
    notes: ["El frio debe importar: vision corta, fatiga y refugio.", "Ofrece huellas falsas para una escena de rastreo."],
  },
  {
    biome: "desierto",
    minLevel: 1,
    maxLevel: 20,
    descriptions: ["Un obelisco emerge de la arena durante el mediodia.", "Una caravana destruida rodea un pozo perfectamente limpio."],
    monsters: ["Escorpiones gigantes", "Bandidos del desierto", "Momias", "Elementales de arena"],
    notes: ["Calor, sed y espejismos hacen el combate mas tactico.", "Un enemigo puede retirarse bajo la arena."],
  },
  {
    biome: "montaña",
    minLevel: 1,
    maxLevel: 20,
    descriptions: ["Un puente de cuerda se rompe cuando suena un cuerno lejano.", "Una cueva alta exhala humo negro antes del amanecer."],
    monsters: ["Orcos", "Grifos", "Gigantes", "Dracos jovenes"],
    notes: ["Usa precipicios y avalanchas con moderacion.", "La altura permite rutas alternativas para exploradores."],
  },
  {
    biome: "pantano",
    minLevel: 1,
    maxLevel: 20,
    descriptions: ["Burbujas negras forman palabras antes de reventar.", "Un sendero de madera se hunde detras del grupo."],
    monsters: ["Hombres lagarto", "Zombis", "Otyughs", "Brujas del pantano"],
    notes: ["El terreno debe separar al grupo sin quitar agencia.", "Veneno, enfermedad y niebla funcionan bien aqui."],
  },
];

function tableForEncounter(biome: string, level: number): EncounterTable {
  const safeLevel = Math.max(1, Math.min(20, Math.floor(level)));
  const safeBiome = BIOMES.includes(biome) ? biome : BIOMES[0];
  return ENCOUNTER_TABLES.find((table) =>
    table.biome === safeBiome && safeLevel >= table.minLevel && safeLevel <= table.maxLevel,
  ) ?? ENCOUNTER_TABLES.find((table) => table.biome === safeBiome) ?? ENCOUNTER_TABLES[0];
}

export function generateEncounter(biome: string, level: number, seed?: number): {
  description: string;
  monsters: string[];
  note: string;
} {
  const table = tableForEncounter(biome, level);
  const monsterCount = randomInt(1, Math.min(3, table.monsters.length), seed === undefined ? undefined : seed + 1);
  const monsters: string[] = [];

  for (let index = 0; index < monsterCount; index += 1) {
    const monster = pickRandom(table.monsters, seed === undefined ? undefined : seed + 10 + index);
    if (!monsters.includes(monster)) monsters.push(monster);
  }

  return {
    description: pickRandom(table.descriptions, seed),
    monsters,
    note: pickRandom(table.notes, seed === undefined ? undefined : seed + 2),
  };
}
