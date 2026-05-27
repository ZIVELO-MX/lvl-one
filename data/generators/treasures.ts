import { pickRandom, randomInt } from "@/lib/random";

export interface LootEntry {
  gold: number;
  items: string[];
}

export interface LootTable {
  minCr: number;
  maxCr?: number;
  gold: [number, number];
  itemCount: [number, number];
  items: string[];
}

export const LOOT_TABLES: LootTable[] = [
  {
    minCr: 0,
    maxCr: 4,
    gold: [12, 140],
    itemCount: [1, 2],
    items: [
      "pocion de curacion menor",
      "bolsa de gemas comunes",
      "pergamino con sello local",
      "daga de plata",
      "mapa incompleto",
      "herramientas de ladron gastadas",
      "amuleto de cobre",
      "llave oxidada",
    ],
  },
  {
    minCr: 5,
    maxCr: 10,
    gold: [220, 1800],
    itemCount: [2, 3],
    items: [
      "pocion de curacion superior",
      "gema tallada",
      "arma +1 comun",
      "capa bordada con runas",
      "pergamino de conjuro nivel 2",
      "anillo de proteccion menor",
      "brujula que apunta al peligro",
      "cofre con cerradura arcana",
    ],
  },
  {
    minCr: 11,
    maxCr: 16,
    gold: [2400, 9200],
    itemCount: [3, 4],
    items: [
      "arma +2",
      "armadura resistente",
      "pocion de invisibilidad",
      "pergamino de conjuro nivel 5",
      "varita con cargas inestables",
      "diamante ritual",
      "manual de tacticas antiguas",
      "reliquia de una orden perdida",
    ],
  },
  {
    minCr: 17,
    gold: [11000, 42000],
    itemCount: [4, 5],
    items: [
      "artefacto dormido",
      "arma legendaria incompleta",
      "tomo de nombres verdaderos",
      "corona de un reino caido",
      "orbe planar sellado",
      "armadura de dragon antiguo",
      "pergamino de conjuro nivel 9",
      "gema con un alma atrapada",
    ],
  },
];

function tableForCr(cr: number): LootTable {
  const safeCr = Math.max(0, Math.floor(cr));
  return LOOT_TABLES.find((table) =>
    safeCr >= table.minCr && (table.maxCr === undefined || safeCr <= table.maxCr),
  ) ?? LOOT_TABLES[0];
}

export function generateTreasure(cr: number, seed?: number): LootEntry {
  const table = tableForCr(cr);
  const gold = randomInt(table.gold[0], table.gold[1], seed);
  const itemCount = randomInt(table.itemCount[0], table.itemCount[1], seed === undefined ? undefined : seed + 1);
  const items: string[] = [];

  for (let index = 0; index < itemCount; index += 1) {
    const item = pickRandom(table.items, seed === undefined ? undefined : seed + 10 + index);
    if (!items.includes(item)) items.push(item);
  }

  return { gold, items };
}
