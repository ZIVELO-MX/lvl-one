import { pickRandom } from "@/lib/random";

export interface TavernResult {
  name: string;
  vibe: string;
  desc: string;
  rumor: string;
}

export const TAVERN_NOUNS = [
  "Grifo",
  "Caldero",
  "Yunque",
  "Ciervo",
  "Farol",
  "Dragón",
  "Ancla",
  "Roble",
  "Cuervo",
  "Barril",
];

export const TAVERN_ADJECTIVES = [
  "Dorado",
  "Torcido",
  "Susurrante",
  "Rojo",
  "Errante",
  "Partido",
  "Azul",
  "Viejo",
  "Valiente",
  "Sombrío",
];

export const TAVERN_VIBES = [
  "Calida, ruidosa y llena de viajeros.",
  "Silenciosa, con clientes que miran demasiado.",
  "Elegante para los estandares de frontera.",
  "Humilde, honesta y con comida abundante.",
  "Peligrosa, pero neutral para todas las bandas.",
  "Festiva, con musica cada noche.",
  "Marinera, salada y cubierta de redes viejas.",
  "Arcana, con velas que arden en colores raros.",
];

export const TAVERN_DESCRIPTIONS = [
  "El suelo cruje bajo botas embarradas y el olor a estofado tapa casi todo rastro de humo.",
  "Una chimenea enorme ilumina mesas marcadas con iniciales de aventureros que nunca volvieron.",
  "Tras la barra hay mapas clavados con cuchillos y una campana que nadie se atreve a tocar.",
  "Los parroquianos hablan bajo cuando entra alguien armado, pero el tabernero siempre sonrie.",
  "La planta alta esta alquilada por una compania mercenaria que paga por discrecion.",
  "Cada mesa tiene una vela distinta; dicen que ninguna se apaga si una promesa sigue pendiente.",
];

export const TAVERN_RUMORS = [
  "Un pozo seco empezo a devolver monedas antiguas durante la noche.",
  "Una patrulla local desaparecio siguiendo luces azules en el bosque.",
  "Alguien compra mapas rotos y paga el doble si tienen sangre seca.",
  "Una noble viaja de incognito y busca escolta antes del amanecer.",
  "El viejo molino vuelve a girar aunque no hay viento desde hace dias.",
  "Un bardo jura que escucho una voz bajo el puente pidiendo un nombre verdadero.",
];

export function generateTavern(seed?: number): TavernResult {
  const noun = pickRandom(TAVERN_NOUNS, seed);
  const adjective = pickRandom(TAVERN_ADJECTIVES, seed === undefined ? undefined : seed + 1);
  const vibe = pickRandom(TAVERN_VIBES, seed === undefined ? undefined : seed + 2);
  const desc = pickRandom(TAVERN_DESCRIPTIONS, seed === undefined ? undefined : seed + 3);
  const rumor = pickRandom(TAVERN_RUMORS, seed === undefined ? undefined : seed + 4);

  return {
    name: `El ${noun} ${adjective}`,
    vibe,
    desc,
    rumor,
  };
}
