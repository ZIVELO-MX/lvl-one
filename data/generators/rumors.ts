import { pickRandom } from "@/lib/random";

const RUMOR_SUBJECTS = [
  "un mercader sin sombra",
  "una niña que habla con estatuas",
  "el capitan de la guardia",
  "un pozo sellado con cadenas nuevas",
  "una compania de actores ambulantes",
  "un mapa vendido tres veces",
  "la campana rota del templo",
  "un perro que vuelve siempre cubierto de sal",
];

const RUMOR_ACTIONS = [
  "aparece cada medianoche cerca de la plaza",
  "paga con monedas de un reino olvidado",
  "conoce el nombre de personas que aun no han llegado",
  "esconde una llave bajo el tercer escalon",
  "desaparece cuando alguien dice una plegaria",
  "esta buscando aventureros que no hagan preguntas",
  "dejo marcas negras en todas las puertas del barrio",
  "promete oro por recuperar una caja que no debe abrirse",
];

const RUMOR_COMPLICATIONS = [
  "pero nadie recuerda haberlo visto entrar",
  "y los animales se alteran cuando pasa cerca",
  "aunque el alcalde prohibio hablar del asunto",
  "pero la ultima persona que ayudo no regreso",
  "y una faccion local ya lo esta vigilando",
  "aunque podria ser una trampa para cazar curiosos",
  "y el rastro termina en terreno sagrado",
  "pero el pago lleva una maldicion menor",
];

const HOOK_PREMISES = [
  "Una reliquia menor activa una defensa antigua bajo la ciudad.",
  "Un patron amable oculta que trabaja para dos bandos enemigos.",
  "Una ruta comercial se corto por algo que imita voces conocidas.",
  "Una fiesta local coincide con una profecia que nadie quiere creer.",
  "Un viejo enemigo pide ayuda antes de ser ejecutado.",
  "Un aprendiz de mago libero algo que solo obedece a ninos.",
];

const HOOK_GOALS = [
  "descubrir quien controla el incidente",
  "proteger a un testigo hasta el amanecer",
  "recuperar un objeto antes de que cambie de manos",
  "negociar una tregua entre facciones armadas",
  "explorar un sitio sellado sin romper sus juramentos",
  "sacar a un inocente de una acusacion fabricada",
];

const HOOK_TWISTS = [
  "el villano aparente intenta contener algo peor",
  "la recompensa prometida es falsa, pero la amenaza no",
  "un aliado del grupo ya hizo un trato secreto",
  "la solucion exige perder un recurso valioso",
  "el lugar esta vivo y recuerda intrusos",
  "la prueba clave incrimina al patron",
];

export function generateRumor(seed?: number): string {
  const subject = pickRandom(RUMOR_SUBJECTS, seed);
  const action = pickRandom(RUMOR_ACTIONS, seed === undefined ? undefined : seed + 1);
  const complication = pickRandom(RUMOR_COMPLICATIONS, seed === undefined ? undefined : seed + 2);
  return `Dicen que ${subject} ${action}, ${complication}.`;
}

export function generateHook(seed?: number): { premise: string; goal: string; twist: string } {
  return {
    premise: pickRandom(HOOK_PREMISES, seed),
    goal: pickRandom(HOOK_GOALS, seed === undefined ? undefined : seed + 1),
    twist: pickRandom(HOOK_TWISTS, seed === undefined ? undefined : seed + 2),
  };
}
