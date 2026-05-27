export interface DetailSection {
  title: string;
  body: string;
}

export interface RaceDetail {
  id: string;
  lore: string;
  playstyle: string;
  beginnerTips: string[];
  roleplayHooks: string[];
}

export interface ClassDetail {
  id: string;
  fantasy: string;
  tableRole: string;
  beginnerTips: string[];
  levelOneLoop: string[];
}

export const RACE_DETAILS: Record<string, RaceDetail> = {
  human: {
    id: "human",
    lore: "Los humanos aparecen en casi cualquier región y cultura. Su rasgo principal no es una tradición única, sino la capacidad de mezclarse, aprender rápido y perseguir metas muy distintas en una vida corta.",
    playstyle: "Funcionan con cualquier clase porque reparten mejoras de característica de forma amplia. Son ideales cuando quieres que la historia pese más que una mecánica racial complicada.",
    beginnerTips: ["Elige humano si no sabes qué clase probar todavía.", "Úsalo para conceptos flexibles: soldado, aprendiz arcano, noble, criminal o explorador.", "El idioma extra puede conectar tu trasfondo con una cultura o mentor."],
    roleplayHooks: ["Quieres demostrar algo antes de que tu vida breve termine.", "Vienes de una ciudad donde muchas culturas se cruzan.", "Tu ambición te mete en problemas más rápido que tu experiencia."],
  },
  elf: {
    id: "elf",
    lore: "Los elfos viven lo suficiente para ver reinos nacer y caer. Su vínculo con la memoria, el arte y la magia los hace parecer distantes, aunque cada elfo decide qué hacer con esa larga perspectiva.",
    playstyle: "Destreza alta, Percepción y rasgos defensivos contra encantamiento los hacen fuertes para pícaros, exploradores, magos ágiles y personajes atentos.",
    beginnerTips: ["Recuerda sumar Percepción si tu hoja no lo hizo automáticamente.", "DES alta mejora CA ligera, iniciativa, Sigilo y armas finas o a distancia.", "Elige subraza según estilo: magia, movilidad o tono oscuro."],
    roleplayHooks: ["Has visto pasar generaciones humanas y eso cambia cómo te relacionas.", "Tu trance mezcla recuerdos propios con ecos de tu linaje.", "Buscas recuperar una obra, reliquia o promesa antigua."],
  },
  dwarf: {
    id: "dwarf",
    lore: "Los enanos se organizan alrededor de clanes, oficios y juramentos. Su cultura valora lo que resiste: piedra, metal, memoria y palabra dada.",
    playstyle: "Constitución alta y resistencia al veneno los hace sólidos para primera línea o lanzadores que quieren aguantar más. La velocidad menor se compensa con mucha estabilidad.",
    beginnerTips: ["CON ayuda a tus PG y a salvaciones importantes.", "Combina muy bien con clérigo, guerrero, paladín o bárbaro.", "Usa Conocimiento de la piedra para pedir contexto en ruinas, minas y fortalezas."],
    roleplayHooks: ["Tu clan espera que saldes una deuda antigua.", "Confías más en objetos bien hechos que en promesas rápidas.", "Abandonaste una fortaleza por deber, exilio o curiosidad."],
  },
  halfling: {
    id: "halfling",
    lore: "Los medianos sobreviven con comunidad, suerte y una valentía tranquila. No necesitan imponerse para cambiar una escena: se cuelan por las grietas que otros ignoran.",
    playstyle: "Afortunado reduce fallos críticos en d20 y DES alta favorece pícaros, bardos, monjes y exploradores. Tamaño pequeño abre opciones de infiltración.",
    beginnerTips: ["No olvides repetir los 1 en d20 cuando aplique.", "Úsalo si quieres un personaje ágil sin sentirte frágil narrativamente.", "Valiente ayuda en escenas con miedo y criaturas intimidantes."],
    roleplayHooks: ["Sales de una vida cómoda para probar que el mundo es más grande.", "Tu suerte parece casualidad, pero otros empiezan a notarla.", "Proteges una tradición familiar que nadie más toma en serio."],
  },
  dragonborn: {
    id: "dragonborn",
    lore: "Los dracónidos cargan con un linaje visible e imposible de ocultar. Su presencia suele imponer respeto, temor o expectativas de grandeza.",
    playstyle: "Fuerza y Carisma favorecen paladines, guerreros sociales, bárbaros con presencia y hechiceros de linaje dracónico. El aliento da una opción de área desde nivel 1.",
    beginnerTips: ["Tu ascendencia define daño de aliento y resistencia; anótalo claro.", "Funciona muy bien si quieres estar al frente y hablar por el grupo.", "Pregunta al DM cómo se ven los dracónidos en el mundo de campaña."],
    roleplayHooks: ["Tu clan exige honor incluso cuando nadie mira.", "Tu aliento apareció en un momento traumático.", "Quieres probar que tu sangre dracónica no define tu destino."],
  },
  gnome: {
    id: "gnome",
    lore: "Los gnomos miran el mundo como un problema delicioso. Algunos lo resuelven con ilusión, otros con engranes, gemas, mapas o teorías imposibles.",
    playstyle: "Inteligencia alta y ventaja contra magia mental los hace excelentes magos, investigadores y personajes ingeniosos. Tamaño pequeño favorece cautela y creatividad.",
    beginnerTips: ["INT alta brilla con mago e Investigación.", "Astucia gnómica es defensiva: recuérdala contra magia de INT, SAB o CAR.", "Elige gnomo si te gusta resolver problemas con planes raros."],
    roleplayHooks: ["Persigues una teoría que todos consideran absurda.", "Tu familia espera una gran invención de ti.", "Te fascina una magia peligrosa que aún no entiendes."],
  },
  halfelf: {
    id: "halfelf",
    lore: "Los semielfos viven entre herencias. Pueden actuar como puente entre culturas o sentirse extranjeros en ambas.",
    playstyle: "Carisma alto, dos mejoras flexibles y habilidades extra los convierten en una de las opciones más adaptables para clases sociales o mágicas.",
    beginnerTips: ["Pon los dos +1 en características que tu clase use seguido.", "Bardo, paladín, hechicero y brujo aprovechan muy bien CAR.", "Las dos habilidades extra te ayudan a cubrir huecos del grupo."],
    roleplayHooks: ["Te pidieron elegir un lado y elegiste caminar entre ambos.", "Tu apellido abre puertas en un lugar y las cierra en otro.", "Buscas un hogar donde no tengas que explicar tu origen."],
  },
  halforc: {
    id: "halforc",
    lore: "Los semiorcos suelen cargar con historias de fuerza, supervivencia y prejuicio. Su identidad no tiene por qué ser violenta, pero el mundo a menudo espera que lo sea.",
    playstyle: "Fuerza, Constitución, Intimidación y resistencia implacable los hacen brillantes como bárbaros, guerreros o paladines de primera línea.",
    beginnerTips: ["Resistencia implacable puede salvar una escena; marca si ya la usaste.", "Ataques salvajes premia armas cuerpo a cuerpo con críticos.", "No limites tu personalidad a ser fuerte: decide qué protege esa fuerza."],
    roleplayHooks: ["Te cansaste de que otros narren tu historia por tu sangre.", "Una comunidad te aceptó cuando nadie más lo hizo.", "Tu furia es una herramienta, no tu dueño."],
  },
  tiefling: {
    id: "tiefling",
    lore: "Los tieflings llevan una marca infernal que otros reconocen antes de conocerlos. Esa tensión los vuelve perfectos para historias de reputación, sospecha y elección personal.",
    playstyle: "Carisma alto, resistencia al fuego y magia innata apoyan brujos, hechiceros, bardos y paladines con conflicto interno.",
    beginnerTips: ["Confirma con el DM cómo reacciona la sociedad a los tieflings.", "Resistencia al fuego es frecuente y útil.", "Tu magia innata añade sabor aunque tu clase no sea lanzadora principal."],
    roleplayHooks: ["Tu familia hizo un pacto que tú no elegiste.", "Usas el miedo ajeno como armadura social.", "Quieres demostrar que la sangre no dicta la moral."],
  },
  aasimar: {
    id: "aasimar",
    lore: "Los aasimar tienen una chispa celestial y una expectativa pesada: otros esperan pureza, milagros o liderazgo. La luz también puede sentirse como una carga.",
    playstyle: "Carisma, curación menor y resistencias raras los hacen buenos paladines, clérigos, bardos o hechiceros con una identidad heroica marcada.",
    beginnerTips: ["Pregunta al DM si tu guía celestial será activa o solo trasfondo.", "Curación por toque es limitada: úsala en momentos importantes.", "Encaja bien con historias de deber, duda o rebelión contra un destino."],
    roleplayHooks: ["Escuchas una voz guía, pero no siempre confías en ella.", "La gente te pide milagros que no sabes dar.", "Tu luz apareció por primera vez cuando alguien iba a morir."],
  },
};

export const CLASS_DETAILS: Record<string, ClassDetail> = {
  fighter: {
    id: "fighter",
    fantasy: "El guerrero es la clase marcial más directa y moldeable: soldado, duelista, arquero, guardaespaldas, mercenario o campeón local.",
    tableRole: "En mesa ocupa la línea de frente o el rol de atacante fiable. Casi siempre tiene algo útil que hacer incluso sin recursos especiales.",
    beginnerTips: ["Elige un estilo de combate que coincida con tu arma principal.", "Segundo aliento te mantiene de pie; no esperes siempre al último PG.", "FUE funciona para armas pesadas; DES para arco, estoque y armadura ligera."],
    levelOneLoop: ["Elige posición.", "Ataca con tu mejor arma.", "Usa Segundo aliento cuando estés herido.", "Protege a aliados frágiles."],
  },
  wizard: {
    id: "wizard",
    fantasy: "El mago resuelve problemas estudiando magia. Su poder está en preparar respuestas antes de que aparezca el peligro.",
    tableRole: "Controla el campo, aporta utilidad y daño en momentos clave. Es frágil, pero cambia encuentros si elige bien sus conjuros.",
    beginnerTips: ["Mantente lejos de la primera línea.", "Lleva al menos un truco ofensivo confiable.", "Prepara una mezcla de daño, defensa y utilidad."],
    levelOneLoop: ["Observa amenaza y distancia.", "Usa truco si quieres ahorrar espacios.", "Gasta un espacio cuando el efecto cambie la escena.", "Protege concentración y posición."],
  },
  sorcerer: {
    id: "sorcerer",
    fantasy: "El hechicero no aprende magia: la desborda. Su poder viene de sangre, accidente, pacto ancestral o exposición sobrenatural.",
    tableRole: "Hace magia ofensiva y social con pocos conjuros conocidos. Requiere elegir una identidad mágica clara desde el inicio.",
    beginnerTips: ["Elige conjuros que vayas a usar muchas veces.", "CAR también te ayuda en escenas sociales.", "No intentes cubrir todo; especialízate."],
    levelOneLoop: ["Abre con truco o hechizo clave.", "Usa movilidad y distancia.", "Reserva espacios para amenazas reales.", "Apoya con Carisma fuera de combate."],
  },
  warlock: {
    id: "warlock",
    fantasy: "El brujo obtuvo poder de una entidad. Cada conjuro recuerda que hay una relación peligrosa detrás de su magia.",
    tableRole: "Pocos espacios, pero potentes y recuperables con descanso corto. Brilla con trucos constantes e intriga narrativa.",
    beginnerTips: ["Eldritch Blast suele ser tu ataque base si está disponible.", "Pide descansos cortos cuando el grupo pueda permitírselos.", "Define qué quiere tu patrón de ti."],
    levelOneLoop: ["Ataca con truco fiable.", "Gasta espacios en efectos decisivos.", "Negocia o intimida con CAR.", "Usa el pacto como motor de historia."],
  },
  paladin: {
    id: "paladin",
    fantasy: "El paladín es una promesa en armadura. Su poder nace de un juramento, una causa o una convicción llevada al extremo.",
    tableRole: "Tanque, apoyo y líder moral. Aguanta, cura y más adelante convierte recursos mágicos en golpes decisivos.",
    beginnerTips: ["FUE, CAR y CON son tus prioridades típicas.", "Imposición de manos sirve para levantar aliados o curar fuera de combate.", "Tu juramento debe crear decisiones, no solo frases solemnes."],
    levelOneLoop: ["Avanza al frente.", "Protege aliados.", "Ataca amenazas importantes.", "Usa curación cuando evite una caída."],
  },
  rogue: {
    id: "rogue",
    fantasy: "El pícaro gana por precisión, oportunidad y recursos sociales. No necesita pegar más veces: necesita pegar cuando importa.",
    tableRole: "Exploración, sigilo, daño puntual y habilidades. En muchas escenas es quien detecta riesgos antes de que sean combate.",
    beginnerTips: ["Busca ventaja o aliados cerca del objetivo para Ataque furtivo.", "No pelees como tanque.", "Pericia vuelve excelentes tus habilidades clave."],
    levelOneLoop: ["Busca posición segura.", "Activa Ataque furtivo si puedes.", "Usa habilidades para abrir rutas.", "Retírate o escóndete cuando sea peligroso."],
  },
  barbarian: {
    id: "barbarian",
    fantasy: "El bárbaro convierte emoción, instinto o tradición guerrera en fuerza física casi imposible de ignorar.",
    tableRole: "Primera línea resistente. Absorbe daño, presiona enemigos y crea espacio para aliados más frágiles.",
    beginnerTips: ["Furia es tu recurso central: úsala en combates que importen.", "CON y DES mejoran supervivencia.", "No confundas furia con actuar sin pensar."],
    levelOneLoop: ["Entra en furia.", "Busca al enemigo peligroso.", "Ataca cuerpo a cuerpo.", "Mantén presión para que no alcancen al grupo."],
  },
  bard: {
    id: "bard",
    fantasy: "El bardo usa arte, palabra, memoria y magia para inclinar la escena a favor del grupo.",
    tableRole: "Soporte flexible, cara social y solucionador de huecos. Puede ayudar casi siempre, aunque no sea el especialista absoluto.",
    beginnerTips: ["Usa Inspiración bárdica antes de tiradas importantes.", "CAR es tu motor social y mágico.", "Elige habilidades que el grupo no cubra."],
    levelOneLoop: ["Lee qué aliado necesita apoyo.", "Inspira en momentos de riesgo.", "Controla o cura si hace falta.", "Habla cuando la escena sea social."],
  },
  cleric: {
    id: "cleric",
    fantasy: "El clérigo canaliza una fuerza divina, filosófica o sagrada. No es solo sanador: es un agente de una creencia.",
    tableRole: "Apoyo resistente. Cura, protege, castiga muertos vivientes y puede ocupar media línea según dominio.",
    beginnerTips: ["No gastes todos tus turnos curando daño menor.", "Bendición y control pueden prevenir más daño del que curas.", "Define cómo se ve tu fe en acciones concretas."],
    levelOneLoop: ["Evalúa si prevenir, curar o atacar.", "Mantén aliados clave de pie.", "Usa armadura y escudo si los tienes.", "Resuelve escenas religiosas o morales."],
  },
  druid: {
    id: "druid",
    fantasy: "El druida escucha sistemas vivos: bosque, clima, bestias, hongos, ríos y ciclos que otros apenas notan.",
    tableRole: "Control, apoyo y exploración natural. Puede curar, alterar terreno y más adelante transformarse.",
    beginnerTips: ["SAB es tu prioridad para conjuros.", "Prepara conjuros que cambien terreno o rescaten aliados.", "Habla con el DM sobre materiales no metálicos si importa en la mesa."],
    levelOneLoop: ["Lee el entorno.", "Controla espacio o apoya.", "Usa magia con cuidado.", "Aporta supervivencia y trato animal fuera de combate."],
  },
  monk: {
    id: "monk",
    fantasy: "El monje transforma disciplina física en velocidad, defensa y precisión. Pelea con movimiento más que con armadura.",
    tableRole: "Movilidad y daño táctico. Entra, golpea, sale de peligro y alcanza objetivos que otros no pueden.",
    beginnerTips: ["DES y SAB sostienen ataque y defensa.", "No eres un tanque pesado; elige bien dónde terminar tu turno.", "Tu movilidad es una herramienta defensiva."],
    levelOneLoop: ["Mide distancia.", "Golpea con arma o artes marciales.", "Usa acción adicional si aplica.", "Muévete para no quedar rodeado."],
  },
  ranger: {
    id: "ranger",
    fantasy: "El explorador domina fronteras: bosques, caminos, ruinas, presas y amenazas que se esconden antes de atacar.",
    tableRole: "Daño a distancia o dual, rastreo y utilidad en viajes. Más adelante mezcla magia natural con combate marcial.",
    beginnerTips: ["DES y SAB cubren combate y exploración.", "Percepción y Supervivencia son habilidades clave.", "Pregunta al DM qué terrenos y enemigos serán relevantes."],
    levelOneLoop: ["Detecta amenazas.", "Ataca desde buena posición.", "Rastrea objetivos.", "Guía al grupo entre encuentros."],
  },
};

export function raceDetailFor(id: string): RaceDetail | undefined {
  return RACE_DETAILS[id];
}

export function classDetailFor(id: string): ClassDetail | undefined {
  return CLASS_DETAILS[id];
}
