import { describe, expect, it } from "vitest";
import { CLASSES } from "@/data/classes";
import { RACES } from "@/data/races";
import { SUBCLASSES } from "@/data/subclasses";
import { SUBRACES } from "@/data/subraces";
import { BACKGROUNDS } from "@/data/backgrounds";
import { buildCharacter, newDraft } from "@/lib/store";
import { CLASS_PROGRESSION } from "@/data/levelProgression";
import { CLASS_STARTING_EQUIPMENT, EQUIPMENT_ITEMS } from "@/data/equipment";
import { SPELLS } from "@/data/spells";
import { SKILLS_BY_STAT } from "@/types/character";

const ALL_SKILL_NAMES = new Set(Object.values(SKILLS_BY_STAT).flat());
const ITEM_IDS = new Set(EQUIPMENT_ITEMS.map(i => i.id));

describe("equipo inicial por clase", () => {
  it("toda clase tiene loadout definido", () => {
    for (const cls of CLASSES) {
      const eq = CLASS_STARTING_EQUIPMENT.find(e => e.classId === cls.startingEquipmentId);
      expect(eq, `${cls.name} apunta a "${cls.startingEquipmentId}" y no existe`).toBeDefined();
    }
  });

  it("cada elección ofrece al menos dos opciones reales", () => {
    const falsasElecciones = CLASS_STARTING_EQUIPMENT.flatMap(eq =>
      eq.choices.filter(c => c.from.length < 2).map(c => `${eq.classId}: "${c.note}"`),
    );
    expect(falsasElecciones, "elegir entre una sola opción no es elegir").toEqual([]);
  });

  it("nadie empieza con las manos vacías", () => {
    for (const eq of CLASS_STARTING_EQUIPMENT) {
      expect(eq.beginnerLoadout.length, `${eq.classId} sin equipo de inicio`).toBeGreaterThan(0);
    }
  });

  // Todo el equipo se referencia por id: un id inventado desaparece de la ficha
  // sin error, y el jugador se queda sin el objeto.
  it("todo objeto referenciado existe en el catálogo", () => {
    const huerfanos = CLASS_STARTING_EQUIPMENT.flatMap(eq => [
      ...eq.beginnerLoadout.filter(id => !ITEM_IDS.has(id)).map(id => `${eq.classId} arranca con "${id}"`),
      ...eq.choices.flatMap(c => c.from.filter(id => !ITEM_IDS.has(id)).map(id => `${eq.classId} ofrece "${id}"`)),
    ]);
    expect(huerfanos, "un id que no existe desaparece de la ficha sin avisar").toEqual([]);
  });
});

describe("conjuros disponibles", () => {
  const casters = CLASSES.filter(c => c.spellcaster);

  it("hay clases lanzadoras", () => {
    expect(casters.length).toBeGreaterThan(0);
  });

  // Paladín y explorador no tienen trucos y lanzan desde nivel 2: excluirlos no
  // es hacer la vista gorda, es la regla del manual.
  const SIN_TRUCOS = new Set(["paladin", "ranger"]);

  it("toda clase con trucos tiene trucos en la lista", () => {
    for (const cls of casters.filter(c => !SIN_TRUCOS.has(c.id))) {
      const cantrips = SPELLS.filter(s => s.level === 0 && s.classes.includes(cls.id));
      expect(cantrips.length, `${cls.name} no tiene ningún truco`).toBeGreaterThan(0);
    }
  });

  it("toda clase lanzadora tiene conjuros de nivel 1", () => {
    for (const cls of casters) {
      const lvl1 = SPELLS.filter(s => s.level === 1 && s.classes.includes(cls.id));
      expect(lvl1.length, `${cls.name} no tiene conjuros de nivel 1`).toBeGreaterThan(0);
    }
  });

  it("ningún conjuro apunta a una clase inexistente", () => {
    const classIds = new Set(CLASSES.map(c => c.id));
    for (const spell of SPELLS) {
      for (const id of spell.classes) {
        expect(classIds.has(id), `el conjuro "${spell.name}" apunta a la clase "${id}"`).toBe(true);
      }
    }
  });
});

describe("trasfondos", () => {
  it("cada uno concede exactamente dos habilidades, como en el manual", () => {
    for (const bg of BACKGROUNDS) {
      expect(bg.skills.length, `${bg.name} concede ${bg.skills.length}`).toBe(2);
    }
  });

  it("cada uno trae equipo y rasgo", () => {
    for (const bg of BACKGROUNDS) {
      expect(bg.equipment.trim().length, `${bg.name} sin equipo`).toBeGreaterThan(0);
      expect(bg.feature.trim().length, `${bg.name} sin rasgo`).toBeGreaterThan(0);
    }
  });
});

describe("razas", () => {
  it("toda raza tiene ASI, velocidad, tamaño e idiomas", () => {
    const incompletas = RACES.filter(r => !r.asi || !r.speed || !r.size || !r.languages?.length).map(r => r.name);
    expect(incompletas, "una raza sin estos campos rompe los cálculos de la ficha").toEqual([]);
  });

  it("las competencias de habilidad raciales llegan al personaje", () => {
    // Un elfo es competente en Percepción y un semiorco en Intimidación. Esto
    // se definía en los datos pero no se aplicaba en ninguna parte.
    for (const race of RACES) {
      const reales = (race.skillProficiencies ?? []).filter(s => ALL_SKILL_NAMES.has(s));
      if (!reales.length) continue;
      const built = buildCharacter({ ...newDraft(), raceId: race.id });
      for (const skill of reales) {
        expect(built.skillProficiencies, `${race.name} debería dar ${skill}`).toContain(skill);
      }
    }
  });

  it("un marcador como \"+2 a elección\" no se cuela como habilidad", () => {
    const built = buildCharacter({ ...newDraft(), raceId: "halfelf" });
    for (const s of built.skillProficiencies) {
      expect(ALL_SKILL_NAMES.has(s), `"${s}" no es una habilidad real`).toBe(true);
    }
  });

  it("el semielfo elige dos habilidades cualesquiera y cuentan", () => {
    const halfelf = RACES.find(r => r.id === "halfelf");
    expect(halfelf?.skillChoices?.count, "Versatilidad del semielfo").toBe(2);

    const built = buildCharacter({ ...newDraft(), raceId: "halfelf", raceSkills: ["Acrobacias", "Medicina"] });
    expect(built.skillProficiencies).toContain("Acrobacias");
    expect(built.skillProficiencies).toContain("Medicina");
  });

  it("las elegidas por raza no gastan los huecos de clase", () => {
    const conRaza = buildCharacter({
      ...newDraft(), raceId: "halfelf", classId: "wizard",
      selectedSkills: ["Arcanos", "Historia"], raceSkills: ["Acrobacias", "Medicina"],
    });
    // Dos de clase más dos de raza: cuatro competencias, no dos.
    expect(conRaza.skillProficiencies).toEqual(
      expect.arrayContaining(["Arcanos", "Historia", "Acrobacias", "Medicina"]),
    );
  });
});

describe("subrazas", () => {
  // Valores del Manual del Jugador. Escritos aquí para que cualquier cambio
  // futuro tenga que justificarse contra el libro.
  const MANUAL: Record<string, { asi: Record<string, number>; speed?: number }> = {
    high_elf: { asi: { INT: 1 } },
    wood_elf: { asi: { SAB: 1 }, speed: 10.5 },   // Pies ligeros: 35 pies
    drow: { asi: { CAR: 1 } },
    hill_dwarf: { asi: { SAB: 1 } },
    mountain_dwarf: { asi: { FUE: 2 } },          // la única subraza con +2
    lightfoot_halfling: { asi: { CAR: 1 } },
    stout_halfling: { asi: { CON: 1 } },
    forest_gnome: { asi: { DES: 1 } },
    rock_gnome: { asi: { CON: 1 } },
  };

  it("todas las subrazas del manual existen con ese id", () => {
    // Sin esto, un id mal escrito haría que su comprobación se saltara en
    // silencio y el test daría verde sin haber mirado nada.
    const ids = new Set(SUBRACES.map(s => s.id));
    const faltan = Object.keys(MANUAL).filter(id => !ids.has(id));
    expect(faltan, "ids del manual que no están en los datos").toEqual([]);
  });

  for (const [id, esperado] of Object.entries(MANUAL)) {
    const sub = SUBRACES.find(s => s.id === id);
    if (!sub) continue; // lo denuncia el test de cobertura de arriba
    it(`${sub.name}: ASI y velocidad del manual`, () => {
      for (const [stat, valor] of Object.entries(esperado.asi)) {
        expect((sub.asi as Record<string, number>)?.[stat], `${sub.name} → ${stat}`).toBe(valor);
      }
      if (esperado.speed) expect(sub.speed, `${sub.name} → velocidad`).toBe(esperado.speed);
    });
  }

  it("las ascendencias dracónicas no dan características: eso es de la raza base", () => {
    const dracos = SUBRACES.filter(s => s.raceId === "dragonborn");
    expect(dracos.length, "faltan ascendencias dracónicas").toBeGreaterThan(0);
    for (const d of dracos) {
      const asi = (d.asi ?? {}) as Record<string, number>;
      const suma = Object.entries(asi).filter(([k]) => k !== "choices").reduce((s, [, v]) => s + (typeof v === "number" ? v : 0), 0);
      expect(suma, `${d.name} no debería dar ASI propio`).toBe(0);
    }
  });

  it("la velocidad de la subraza manda sobre la de la raza", () => {
    // El elfo de los bosques corre más que un elfo normal: 10,5 m contra 9.
    const built = buildCharacter({ ...newDraft(), raceId: "elf", subraceId: "wood_elf" });
    expect(built.speed).toBe(10.5);
  });
});

describe("conjuros que no se eligen", () => {
  it("los de subclase se suman a los del jugador", () => {
    // Dominios, juramentos y círculos conceden conjuros aparte de los elegidos.
    const conSpells = SUBCLASSES.filter(s => s.spells?.length);
    expect(conSpells.length, "ninguna subclase concede conjuros").toBeGreaterThan(0);
    for (const sub of conSpells.slice(0, 5)) {
      const built = buildCharacter({ ...newDraft(), classId: sub.classId, subclassId: sub.id });
      for (const spell of sub.spells ?? []) {
        expect(built.spells, `${sub.name} debería conceder ${spell}`).toContain(spell);
      }
    }
  });

  it("todo conjuro concedido existe en el catálogo", () => {
    const ids = new Set(SPELLS.map(s => s.id));
    const huerfanos = SUBCLASSES.flatMap(sub =>
      (sub.spells ?? []).filter(id => !ids.has(id)).map(id => `${sub.name}: "${id}"`),
    );
    expect(huerfanos, "un conjuro inexistente no aparece en la ficha").toEqual([]);
  });
});

describe("límites de conjuros a nivel 1", () => {
  // Tabla del Manual del Jugador. Se escribe aquí a propósito: si alguien toca
  // la progresión, el test dice contra qué se está desviando.
  const MANUAL: Record<string, { trucos: number; conocidos: number }> = {
    bard: { trucos: 2, conocidos: 4 },
    cleric: { trucos: 3, conocidos: 0 },   // prepara, no conoce
    druid: { trucos: 2, conocidos: 0 },    // prepara, no conoce
    sorcerer: { trucos: 4, conocidos: 2 },
    warlock: { trucos: 2, conocidos: 2 },
    wizard: { trucos: 3, conocidos: 6 },   // los seis del libro de conjuros
    paladin: { trucos: 0, conocidos: 0 },  // no lanza hasta nivel 2
    ranger: { trucos: 0, conocidos: 0 },   // no lanza hasta nivel 2
  };

  for (const [classId, esperado] of Object.entries(MANUAL)) {
    it(`${classId}: ${esperado.trucos} trucos y ${esperado.conocidos} conjuros`, () => {
      const fila = CLASS_PROGRESSION[classId]?.[0];
      expect(fila?.cantripsKnown ?? 0, "trucos").toBe(esperado.trucos);
      expect(fila?.spellsKnown ?? 0, "conjuros conocidos").toBe(esperado.conocidos);
    });
  }

  it("paladín y explorador sí lanzan a nivel 2", () => {
    expect(CLASS_PROGRESSION.ranger?.[1]?.spellsKnown).toBe(2);
    // El paladín prepara CAR + mitad de nivel, así que no lleva tabla de
    // conocidos; lo que debe tener a nivel 2 son espacios.
    expect(CLASS_PROGRESSION.paladin?.[1]?.spellSlots?.[0]).toBeGreaterThan(0);
  });
});

describe("nombres de habilidad", () => {
  // La hoja decide la competencia comparando cadenas: una tilde de más y el
  // personaje pierde la competencia sin que nada falle a la vista.
  it("las de los trasfondos existen en la lista canónica", () => {
    for (const bg of BACKGROUNDS) {
      for (const skill of bg.skills) {
        expect(ALL_SKILL_NAMES.has(skill), `${bg.name} → "${skill}" no está en la lista canónica`).toBe(true);
      }
    }
  });

  it("las que ofrecen las clases existen en la lista canónica", () => {
    for (const cls of CLASSES) {
      for (const skill of cls.skillChoices?.options ?? []) {
        expect(ALL_SKILL_NAMES.has(skill), `${cls.name} → "${skill}" no está en la lista canónica`).toBe(true);
      }
    }
  });
});
