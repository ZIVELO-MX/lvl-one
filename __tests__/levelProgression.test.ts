import { describe, expect, it } from "vitest";
import { getFeatsByPrerequisite } from "@/data/feats";
import {
  CLASS_PROGRESSION,
  combineSpellSlots,
  maxAttunedItems,
  MULTICLASS_REQUIREMENTS,
  preparedSpells,
  weightCapacity,
} from "@/data/levelProgression";
import { SPELLS, spellsByLevel, spellsForClass } from "@/data/spells";

describe("class progression", () => {
  it("builds 20 levels for every supported class", () => {
    for (const progression of Object.values(CLASS_PROGRESSION)) {
      expect(progression).toHaveLength(20);
      expect(progression[0].proficiencyBonus).toBe(2);
      expect(progression[19].proficiencyBonus).toBe(6);
    }
  });

  it("tracks ASI levels and wizard spell slots", () => {
    expect(CLASS_PROGRESSION["wizard"][3].spellSlots?.[0]).toBe(4);
    expect(CLASS_PROGRESSION["fighter"][3].asiLevel).toBe(true);
    expect(CLASS_PROGRESSION["fighter"][5].asiLevel).toBe(true);
    expect(CLASS_PROGRESSION["wizard"][4].asiLevel).toBe(false);
  });
});

describe("multiclass progression", () => {
  it("exposes multiclass requirements by class", () => {
    expect(MULTICLASS_REQUIREMENTS["wizard"]["int"]).toBe(13);
    expect(MULTICLASS_REQUIREMENTS["paladin"]).toMatchObject({ str: 13, cha: 13 });
  });

  it("combines spell slots using PHB multiclass caster levels", () => {
    expect(combineSpellSlots([{ classId: "wizard", level: 1 }, { classId: "fighter", level: 1 }])).toEqual([2, 0, 0, 0, 0, 0, 0, 0, 0]);
    expect(combineSpellSlots([{ classId: "wizard", level: 3 }, { classId: "cleric", level: 2 }])).toEqual([4, 3, 2, 0, 0, 0, 0, 0, 0]);
    expect(combineSpellSlots([{ classId: "paladin", level: 5 }, { classId: "ranger", level: 3 }])).toEqual([4, 2, 0, 0, 0, 0, 0, 0, 0]);
    expect(combineSpellSlots([{ classId: "warlock", level: 5 }, { classId: "wizard", level: 5 }])).toEqual([4, 3, 2, 0, 0, 0, 0, 0, 0]);
  });
});

describe("level-up validations", () => {
  it("calculates attunement, carrying capacity, and prepared spells", () => {
    expect(maxAttunedItems).toBe(3);
    expect(weightCapacity(10)).toBe(150);
    expect(preparedSpells(1, -1)).toBe(1);
    expect(preparedSpells(5, 3)).toBe(8);
  });
});

describe("feat prerequisites", () => {
  it("returns only feats accessible to the given character snapshot", () => {
    const feats = getFeatsByPrerequisite({
      level: 4,
      race: "elf",
      class: "wizard",
      stats: { FUE: 8, DES: 14, CON: 12, INT: 16, SAB: 13, CAR: 10 },
    });
    const ids = feats.map((feat) => feat.id);

    expect(ids).toContain("magic_initiate");
    expect(ids).toContain("ritual_caster");
    expect(ids).toContain("elven_accuracy");
    expect(ids).not.toContain("great_weapon_master");
    expect(ids).not.toContain("dragon_fear");
  });
});

describe("expanded spell catalog", () => {
  it("contains at least 6 spells for each level 4-9", () => {
    for (const level of [4, 5, 6, 7, 8, 9] as const) {
      expect(spellsByLevel(level)).toHaveLength(6);
    }
  });

  it("includes high-level spells in class spell lookups by default", () => {
    expect(SPELLS.some((spell) => spell.level === 9)).toBe(true);
    expect(spellsForClass("wizard").some((spell) => spell.id === "wish")).toBe(true);
  });
});
