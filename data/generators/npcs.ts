import { pickRandom } from "@/lib/random";
import { generateName, type NameGender } from "@/data/generators/names";

export interface QuickNPC {
  name: string;
  race: string;
  personality: string;
  motivation: string;
  flaw: string;
  quirk: string;
}

const NPC_RACES = [
  { race: "Humano", culture: "humano" },
  { race: "Elfo", culture: "elfo" },
  { race: "Enano", culture: "enano" },
  { race: "Orco", culture: "orco" },
  { race: "Mediano", culture: "mediano" },
  { race: "Draconiano", culture: "draconiano" },
  { race: "Tiefling", culture: "tiefling" },
];

export const NPC_PERSONALITIES = [
  "Habla con calma incluso bajo amenaza.",
  "Convierte cada conversacion en una negociacion.",
  "Es amable hasta que alguien menciona su pasado.",
  "Rie demasiado fuerte y escucha mas de lo que aparenta.",
  "Trata a desconocidos como viejos camaradas.",
  "Contesta con frases cortas y mira siempre las salidas.",
  "Tiene modales impecables y paciencia limitada.",
  "Se emociona cuando alguien pregunta por su oficio.",
];

export const NPC_MOTIVATIONS = [
  "Quiere recuperar una reliquia familiar.",
  "Busca pagar una deuda antes de que llegue el cobrador.",
  "Necesita proteger a alguien que no puede aparecer en publico.",
  "Desea probar que una acusacion antigua fue falsa.",
  "Persigue un ascenso dentro de una faccion local.",
  "Quiere abandonar la ciudad sin levantar sospechas.",
  "Busca ingredientes raros para un ritual incompleto.",
  "Necesita testigos fiables para una entrega peligrosa.",
];

export const NPC_FLAWS = [
  "Confia demasiado en promesas selladas con vino.",
  "Miente por reflejo incluso cuando no hace falta.",
  "No puede rechazar una apuesta.",
  "Subestima a cualquiera que parezca joven.",
  "Guarda rencor por pequenas humillaciones.",
  "Prefiere huir antes que admitir miedo.",
  "Se obsesiona con los detalles y pierde el panorama.",
  "Cree que todo favor debe cobrarse pronto.",
];

export const NPC_QUIRKS = [
  "Colecciona botones de abrigos ajenos.",
  "Cuenta monedas dos veces antes de hablar.",
  "Nunca se sienta de espaldas a una puerta.",
  "Da nombres propios a sus herramientas.",
  "Silba la misma melodia cuando miente.",
  "Escribe notas en la palma de su guante.",
  "Corrige mapas aunque no conozca la zona.",
  "Pide disculpas a objetos que se caen.",
];

export function generateQuickNPC(seed?: number): QuickNPC {
  const gender = pickRandom<NameGender>(["male", "female"], seed);
  const race = pickRandom(NPC_RACES, seed === undefined ? undefined : seed + 1);

  return {
    name: generateName(race.culture, gender, seed === undefined ? undefined : seed + 2),
    race: race.race,
    personality: pickRandom(NPC_PERSONALITIES, seed === undefined ? undefined : seed + 3),
    motivation: pickRandom(NPC_MOTIVATIONS, seed === undefined ? undefined : seed + 4),
    flaw: pickRandom(NPC_FLAWS, seed === undefined ? undefined : seed + 5),
    quirk: pickRandom(NPC_QUIRKS, seed === undefined ? undefined : seed + 6),
  };
}
