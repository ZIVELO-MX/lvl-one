import { describe, expect, it } from "vitest";
import { FEATS, getFeatsByPrerequisite, meetsFeatPrerequisite } from "@/data/feats";
import { SUBRACES } from "@/data/subraces";
import { CLASSES } from "@/data/classes";
import { buildCharacter } from "@/lib/buildCharacter";
import { STAT_KEYS, type CharacterDraft } from "@/types/character";

function draft(overrides: Partial<CharacterDraft> = {}): CharacterDraft {
  return {
    id: "t", name: "T",
    raceId: null, subraceId: null, classId: null, subclassId: null, backgroundId: null,
    baseStats: { FUE: 10, DES: 10, CON: 10, INT: 10, SAB: 10, CAR: 10 },
    selectedSkills: [], alignment: "", story: "", ideals: "", bonds: "", flaws: "",
    level: 1, age: "", status: "draft", conceptId: null, statsMethod: "standard",
    equipment: [], spells: [], createdAt: 0, updatedAt: 0,
    ...overrides,
  };
}

const feat = (id: string) => {
  const f = FEATS.find(x => x.id === id);
  if (!f) throw new Error(`No existe la dote ${id}`);
  return f;
};

describe("requisitos de las dotes", () => {
  it("los conjuros piden saber lanzar, no llegar a nivel 4", () => {
    // Conjurador de guerra, Francotirador mágico y Adepto elemental pedían
    // minLevel 4, que el manual no dice en ninguna parte. Un mago de nivel 1
    // puede tomarlas si su mesa usa dotes.
    const mago = { level: 1, race: "human", class: "wizard", stats: { INT: 16 }, spellcaster: true };
    expect(meetsFeatPrerequisite(feat("war_caster"), mago)).toBe(true);
    expect(meetsFeatPrerequisite(feat("spell_sniper"), mago)).toBe(true);
    expect(meetsFeatPrerequisite(feat("elemental_adept"), mago)).toBe(true);
  });

  it("quien no lanza conjuros no puede tomarlas", () => {
    const guerrero = { level: 8, race: "human", class: "fighter", stats: { FUE: 16 }, spellcaster: false };
    expect(meetsFeatPrerequisite(feat("war_caster"), guerrero)).toBe(false);
    expect(meetsFeatPrerequisite(feat("spell_sniper"), guerrero)).toBe(false);
  });

  it("las dotes de armadura piden competencia, no una característica", () => {
    // Maestro de armadura pesada pedía Fuerza 15 y Maestro de armadura media,
    // Destreza 13. El manual pide competencia con esa armadura.
    const mago = {
      level: 4, race: "human", class: "wizard", stats: { FUE: 18, DES: 18 },
      armorProficiencies: [] as string[],
    };
    expect(meetsFeatPrerequisite(feat("heavy_armor_master"), mago)).toBe(false);
    expect(meetsFeatPrerequisite(feat("medium_armor_master"), mago)).toBe(false);

    const guerrero = {
      ...mago, class: "fighter",
      armorProficiencies: CLASSES.find(c => c.id === "fighter")?.armorProficiencies ?? [],
    };
    expect(meetsFeatPrerequisite(feat("heavy_armor_master"), guerrero)).toBe(true);
    expect(meetsFeatPrerequisite(feat("medium_armor_master"), guerrero)).toBe(true);
  });

  it("Armadura pesada la puede tomar cualquiera con armadura media", () => {
    // Pedía class: fighter. El manual pide competencia con armadura media,
    // que también tienen clérigos, bárbaros o exploradores.
    const clerigo = {
      level: 1, race: "human", class: "cleric", stats: {},
      armorProficiencies: CLASSES.find(c => c.id === "cleric")?.armorProficiencies ?? [],
    };
    expect(meetsFeatPrerequisite(feat("heavily_armored"), clerigo)).toBe(true);
  });

  it("los requisitos con \"o\" se cumplen con cualquiera de los dos", () => {
    // Atleta pide Fuerza 13 O Destreza 13; sólo miraba Fuerza.
    const agil = { level: 1, race: "human", class: "rogue", stats: { FUE: 8, DES: 14 } };
    expect(meetsFeatPrerequisite(feat("athlete"), agil)).toBe(true);
    const torpe = { level: 1, race: "human", class: "rogue", stats: { FUE: 8, DES: 8 } };
    expect(meetsFeatPrerequisite(feat("athlete"), torpe)).toBe(false);
  });

  it("Precisión élfica también es del semielfo", () => {
    const semielfo = { level: 4, race: "halfelf", class: "rogue", stats: {} };
    expect(meetsFeatPrerequisite(feat("elven_accuracy"), semielfo)).toBe(true);
    const enano = { level: 4, race: "dwarf", class: "rogue", stats: {} };
    expect(meetsFeatPrerequisite(feat("elven_accuracy"), enano)).toBe(false);
  });

  it("sin el dato, no se filtra: mejor de más que esconder dotes válidas", () => {
    // Quien pregunte sin saber si el personaje lanza conjuros recibe todas.
    const sinDatos = { level: 1, race: "human", class: "fighter", stats: { FUE: 16 } };
    const ids = getFeatsByPrerequisite(sinDatos).map(f => f.id);
    expect(ids).toContain("war_caster");
    expect(ids).toContain("heavy_armor_master");
  });
});

describe("efectos de las dotes en la ficha", () => {
  it("Duro de matar suma +2 PG por nivel", () => {
    const sin = buildCharacter(draft({ classId: "fighter", level: 3 }));
    const con = buildCharacter(draft({ classId: "fighter", level: 3, feats: ["tough"] }));
    expect(con.hp - sin.hp).toBe(6);
  });

  it("Alerta suma +5 a la iniciativa", () => {
    const con = buildCharacter(draft({ classId: "rogue", feats: ["alert"] }));
    expect(con.initiative).toBe(5);
  });

  it("Móvil suma 3 metros de velocidad", () => {
    const sin = buildCharacter(draft({ raceId: "human", classId: "monk" }));
    const con = buildCharacter(draft({ raceId: "human", classId: "monk", feats: ["mobile"] }));
    expect(con.speed - sin.speed).toBe(3);
  });

  it("Observador suma +5 a la percepción pasiva", () => {
    const sin = buildCharacter(draft({ classId: "cleric" }));
    const con = buildCharacter(draft({ classId: "cleric", feats: ["observant"] }));
    expect(con.passivePerception - sin.passivePerception).toBe(5);
  });

  it("la percepción pasiva cuenta la competencia cuando la tiene", () => {
    const competente = buildCharacter(draft({ classId: "cleric", selectedSkills: ["Percepción"] }));
    expect(competente.passivePerception).toBe(12); // 10 + SAB 0 + competencia 2
  });

  it("el +1 de una media dote sube la característica y su modificador", () => {
    const con = buildCharacter(draft({
      classId: "fighter",
      baseStats: { FUE: 15, DES: 10, CON: 10, INT: 10, SAB: 10, CAR: 10 },
      feats: ["athlete"], featBonuses: { FUE: 1 },
    }));
    expect(con.stats.FUE).toBe(16);
    expect(con.mods.FUE).toBe(3);
  });

  it("featBonuses no gasta las elecciones raciales", () => {
    // Si compartieran campo con asiBonuses, la raza creería ya repartido lo
    // que puso la dote y el semielfo perdería uno de sus dos +1.
    const semielfo = buildCharacter(draft({
      raceId: "halfelf",
      feats: ["actor"], featBonuses: { CAR: 1 },
      asiBonuses: { FUE: 1, DES: 1 },
    }));
    expect(semielfo.stats.FUE).toBe(11);
    expect(semielfo.stats.DES).toBe(11);
    expect(semielfo.stats.CAR).toBe(13); // 10 + 2 de semielfo + 1 de Actor
  });

  it("una dote desconocida no rompe la ficha", () => {
    const c = buildCharacter(draft({ classId: "fighter", feats: ["dote_que_no_existe"] }));
    expect(c.hp).toBeGreaterThan(0);
  });
});

describe("el humano variante", () => {
  const variante = SUBRACES.find(s => s.id === "human_variant")!;

  it("concede una dote y una habilidad a elección", () => {
    expect(variante.grantsFeat).toBe(1);
    expect(variante.skillChoices?.count).toBe(1);
  });

  it("no deja marcadores de texto donde debería haber una elección", () => {
    // "+1 a elección" no es una habilidad: buildCharacter lo filtraba y la
    // competencia se perdía sin decir nada.
    expect(variante.skillProficiencies ?? []).toEqual([]);
  });

  it("su habilidad elegida llega a la ficha", () => {
    const c = buildCharacter(draft({
      raceId: "human", subraceId: "human_variant", raceSkills: ["Sigilo"],
    }));
    expect(c.skillProficiencies).toContain("Sigilo");
  });
});

describe("catálogo de dotes", () => {
  it("no hay ids repetidos", () => {
    const ids = FEATS.map(f => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("las medias dotes sólo ofrecen características que existen", () => {
    const malas = FEATS
      .filter(f => f.effects?.abilityIncrease)
      .filter(f => f.effects!.abilityIncrease!.from.some(k => !STAT_KEYS.includes(k)));
    expect(malas.map(f => f.id)).toEqual([]);
  });

  it("toda media dote ofrece al menos una característica", () => {
    const vacias = FEATS
      .filter(f => f.effects?.abilityIncrease)
      .filter(f => f.effects!.abilityIncrease!.from.length === 0);
    expect(vacias.map(f => f.id)).toEqual([]);
  });
});
