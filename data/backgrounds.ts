import type { Background } from "@/types/character";

export const BACKGROUNDS: Background[] = [
  {
    id: "soldier", name: "Soldado", short: "Veterano de guerra", tags: ["Recomendado"],
    skills: ["Atletismo", "Intimidación"],
    tools: ["Juego de dados", "Vehículos terrestres"],
    equipment: "Rango militar, insignia, trofeo de enemigo caído, cartas de un juego, traje de ropa común, bolsa con 10 po.",
    feature: "Rango militar: los soldados te reconocen y te ofrecen alojamiento gratuito.",
  },
  {
    id: "acolyte", name: "Acólito", short: "Sirviente del templo", tags: ["Recomendado"],
    skills: ["Perspicacia", "Religión"],
    tools: [],
    equipment: "Símbolo sagrado, libro de oraciones, 5 varas de incienso, vestimentas, bolsa con 15 po.",
    feature: "Refugio divino: los templos de tu deidad te ayudan sin coste.",
  },
  {
    id: "criminal", name: "Criminal", short: "Fuera de la ley", tags: ["Recomendado"],
    skills: ["Engaño", "Sigilo"],
    tools: ["Herramientas de ladrón", "Juego de azar"],
    equipment: "Palanca, ropa oscura con capucha, bolsa con 15 po.",
    feature: "Contacto criminal: acceso a redes de delincuentes.",
  },
  {
    id: "sage", name: "Sabio", short: "Estudioso", tags: ["Recomendado"],
    skills: ["Arcanos", "Historia"],
    tools: [],
    equipment: "Frasco de tinta, pluma, pequeño cuchillo, cartas de tu mecenas, borrador de pergamino, bolsa con 10 po.",
    feature: "Investigador: sabes dónde buscar información aunque no la tengas.",
  },
  {
    id: "noble", name: "Noble", short: "Alta cuna", tags: [],
    skills: ["Historia", "Persuasión"],
    tools: ["Juego de ajedrez"],
    equipment: "Fino vestido, anillo con el escudo de armas, pergamino de blasones, bolsa con 25 po.",
    feature: "Privilegio de posición: acceso a la nobleza y al poder político.",
  },
  {
    id: "folk_hero", name: "Héroe del pueblo", short: "Leyenda local", tags: [],
    skills: ["Manejo de animales", "Supervivencia"],
    tools: ["Herramientas de artesano", "Vehículos terrestres"],
    equipment: "Herramientas de artesano, pala, olla de hierro, ropa de campo, bolsa con 10 po.",
    feature: "Hospitalidad rústica: la gente común te acoge con alegría.",
  },
  {
    id: "outlander", name: "Forastero", short: "Criado en la naturaleza", tags: [],
    skills: ["Atletismo", "Supervivencia"],
    tools: ["Instrumento musical"],
    equipment: "Bastón, trampa de caza, trofeo animal, ropa de viaje, bolsa con 10 po.",
    feature: "Vagabundo: siempre encuentras comida y agua para ti y tu grupo.",
  },
  {
    id: "entertainer", name: "Artista", short: "Performer", tags: [],
    skills: ["Acrobacias", "Actuación"],
    tools: ["Disfraz", "Instrumento musical"],
    equipment: "Instrumento musical de tu elección, favor de admirador, traje de artista, bolsa con 15 po.",
    feature: "Por amor al arte: alojamiento gratuito a cambio de actuaciones.",
  },
  {
    id: "charlatan", name: "Charlatán", short: "Estafador profesional", tags: [],
    skills: ["Engaño", "Juego de manos"],
    tools: ["Herramientas de disfraz", "Herramientas de falsificación"],
    equipment: "Kit de disfraz, herramientas de falsificación, bolsa con 15 po, ropa elegante.",
    feature: "Falsa identidad: tienes una identidad falsa preparada con documentos y contactos que la respaldan.",
  },
  {
    id: "guild_artisan", name: "Artesano de gremio", short: "Miembro de un gremio", tags: [],
    skills: ["Perspicacia", "Persuasión"],
    tools: ["Herramientas de artesano"],
    equipment: "Carta de membresía del gremio, herramientas de artesano, carta de recomendación, ropa de viaje, bolsa con 15 po.",
    feature: "Membresía del gremio: tu gremio te proporciona alojamiento, comida y contactos en cualquier ciudad donde tenga sede.",
  },
  {
    id: "hermit", name: "Ermitaño", short: "Vida de reclusión", tags: [],
    skills: ["Medicina", "Religión"],
    tools: ["Kit de herborista"],
    equipment: "Estuche de pergamino, bolsa de dormir, kit de herborista, ropa de campo, bolsa con 5 po.",
    feature: "Descubrimiento: durante tu reclusión hiciste un gran descubrimiento (secreto, religioso, mágico o natural) que define tu motivación.",
  },
  {
    id: "sailor", name: "Marinero", short: "Hombre de mar", tags: [],
    skills: ["Atletismo", "Percepción"],
    tools: ["Instrumentos de navegación", "Vehículos acuáticos"],
    equipment: "Cuerda de 50 ft, amuleto de buena suerte, ropa de campo, casaquilla, bolsa con 10 po.",
    feature: "Pasaje de barco: puedes conseguir transporte gratuito en barcos a cambio de trabajo a bordo.",
  },
  {
    id: "urchin", name: "Golfillo", short: "Criado en las calles", tags: [],
    skills: ["Juego de manos", "Sigilo"],
    tools: ["Herramientas de ladrón", "Herramientas de disfraz"],
    equipment: "Cuerda de 50 ft, ganzúa, mapa de la ciudad, mascota pequeña (ratón), ropa, bolsa con 10 po.",
    feature: "Secretos de la ciudad: conoces atajos, escondites y conexiones en entornos urbanos como pocos.",
  },
];

export const ALIGNMENTS: [string, string][] = [
  ["LB", "Leal Bueno"], ["NB", "Neutral Bueno"], ["CB", "Caótico Bueno"],
  ["LN", "Leal Neutral"], ["N", "Neutral"], ["CN", "Caótico Neutral"],
  ["LM", "Leal Malvado"], ["NM", "Neutral Malvado"], ["CM", "Caótico Malvado"],
];

export const CONCEPTS = [
  { id: "honor",  t: "Un guerrero honorable", icon: "sword",   suggests: { race: "human",    cls: "fighter",   bg: "soldier" } },
  { id: "mage",   t: "Una maga curiosa",       icon: "wand",    suggests: { race: "elf",      cls: "wizard",    bg: "sage" } },
  { id: "thief",  t: "Un pícaro callejero",    icon: "bolt",    suggests: { race: "halfling", cls: "rogue",     bg: "criminal" } },
  { id: "priest", t: "Un clérigo que busca respuestas", icon: "shield", suggests: { race: "dwarf",   cls: "cleric", bg: "acolyte" } },
  { id: "bard",   t: "Un bardo carismático",   icon: "sparkle", suggests: { race: "halfelf",  cls: "bard",      bg: "noble" } },
  { id: "savage", t: "Un guerrero salvaje",    icon: "flame",   suggests: { race: "halforc",  cls: "barbarian", bg: "folk_hero" } },
];
