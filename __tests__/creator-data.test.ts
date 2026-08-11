import { describe, expect, it } from "vitest";
import { CLASSES } from "@/data/classes";
import { RACES } from "@/data/races";
import { SUBCLASSES } from "@/data/subclasses";
import { BACKGROUNDS } from "@/data/backgrounds";
import { buildCharacter, newDraft } from "@/lib/store";
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
