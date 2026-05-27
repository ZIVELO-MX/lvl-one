import { describe, expect, it } from "vitest";
import { buildCharacter } from "@/lib/store";
import { modOf, proficiencyBonusForLevel, levelGrantsASI, asiCountUpToLevel, type CharacterDraft } from "@/types/character";

function draft(overrides: Partial<CharacterDraft> = {}): CharacterDraft {
  return {
    id: "test-character",
    name: "Test Character",
    raceId: null,
    subraceId: null,
    classId: null,
    subclassId: null,
    backgroundId: null,
    baseStats: { FUE: 10, DES: 10, CON: 10, INT: 10, SAB: 10, CAR: 10 },
    selectedSkills: [],
    alignment: "",
    story: "",
    ideals: "",
    bonds: "",
    flaws: "",
    level: 1,
    age: "",
    status: "draft",
    conceptId: null,
    statsMethod: "standard",
    equipment: [],
    spells: [],
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  };
}

describe("modOf", () => {
  it.each([
    [10, 0],
    [8, -1],
    [15, 2],
    [20, 5],
    [1, -5],
  ])("calculates modifier for score %i", (score, expected) => {
    expect(modOf(score)).toBe(expected);
  });
});

describe("proficiencyBonusForLevel", () => {
  it.each([
    [1, 2],
    [4, 2],
    [5, 3],
    [9, 4],
    [13, 5],
    [17, 6],
    [20, 6],
  ])("level %i → +%i", (level, expected) => {
    expect(proficiencyBonusForLevel(level)).toBe(expected);
  });
});

describe("levelGrantsASI", () => {
  it.each([4, 6, 8, 12, 16, 19])("level %i grants ASI", (level) => {
    expect(levelGrantsASI(level)).toBe(true);
  });
  it.each([1, 2, 3, 5, 7, 9, 10, 11, 13, 14, 15, 17, 18, 20])("level %i does not grant ASI", (level) => {
    expect(levelGrantsASI(level)).toBe(false);
  });
});

describe("asiCountUpToLevel", () => {
  it.each([
    [1, 0],
    [4, 1],
    [6, 2],
    [8, 3],
    [12, 4],
    [16, 5],
    [19, 6],
    [20, 6],
  ])("up to level %i → %i ASI(s)", (level, expected) => {
    expect(asiCountUpToLevel(level)).toBe(expected);
  });
});

describe("buildCharacter", () => {
  it("calculates first-level HP as hit die plus CON modifier", () => {
    const character = buildCharacter(
      draft({
        classId: "wizard",
        baseStats: { FUE: 10, DES: 10, CON: 14, INT: 10, SAB: 10, CAR: 10 },
      }),
    );
    expect(character.hp).toBe(8);
  });

  it("calculates fighter AC from chain mail and shield", () => {
    const character = buildCharacter(
      draft({ classId: "fighter", baseStats: { FUE: 10, DES: 10, CON: 10, INT: 10, SAB: 10, CAR: 10 } }),
    );
    expect(character.ac).toBe(18);
  });

  it("never returns HP below 1", () => {
    const character = buildCharacter(
      draft({ classId: "wizard", baseStats: { FUE: 10, DES: 10, CON: 1, INT: 10, SAB: 10, CAR: 10 } }),
    );
    expect(character.hp).toBe(1);
  });

  it("applies standard human +1 all stats", () => {
    const character = buildCharacter(draft({ raceId: "human" }));
    STAT_KEYS.forEach(k => {
      expect(character.stats[k]).toBe(11);
    });
  });

  it("applies half-elf CAR +2 and fills choices via asiBonuses", () => {
    const character = buildCharacter(draft({
      raceId: "halfelf",
      asiBonuses: { DES: 1, CON: 1 },
    }));
    expect(character.stats.CAR).toBe(12);
    expect(character.stats.DES).toBe(11);
    expect(character.stats.CON).toBe(11);
  });

  it("auto-assigns variant human extra choices (race +1 all + subrace +1 to 2 stats)", () => {
    const character = buildCharacter(draft({
      raceId: "human",
      subraceId: "human_variant",
    }));
    const humanBase = STAT_KEYS.every(k => character.stats[k] === 11 || character.stats[k] === 12);
    expect(humanBase).toBe(true);
    const bonusCount = STAT_KEYS.filter(k => character.stats[k] === 12).length;
    expect(bonusCount).toBe(2);
  });

  it("uses existing asiBonuses for variant human when set instead of auto-assign", () => {
    const character = buildCharacter(draft({
      raceId: "human",
      subraceId: "human_variant",
      asiBonuses: { FUE: 1, DES: 1 },
    }));
    expect(character.stats.FUE).toBe(12);
    expect(character.stats.DES).toBe(12);
  });

  it("applies level-up ASI bonuses on top of racial bonuses", () => {
    const character = buildCharacter(draft({
      classId: "fighter",
      raceId: "human",
      asiBonuses: { FUE: 2, CON: 2 },
      baseStats: { FUE: 15, DES: 14, CON: 13, INT: 12, SAB: 10, CAR: 8 },
    }));
    expect(character.stats.FUE).toBe(18);
    expect(character.stats.CON).toBe(16);
  });

  it("calculates barbarian unarmored AC", () => {
    const character = buildCharacter(draft({
      classId: "barbarian",
      baseStats: { FUE: 15, DES: 14, CON: 16, INT: 10, SAB: 10, CAR: 8 },
    }));
    expect(character.ac).toBe(10 + 2 + 3);
  });

  it("calculates monk unarmored AC", () => {
    const character = buildCharacter(draft({
      classId: "monk",
      baseStats: { FUE: 10, DES: 16, CON: 13, INT: 10, SAB: 15, CAR: 8 },
    }));
    expect(character.ac).toBe(10 + 3 + 2);
  });

  it("calculates wizard AC (mago: 10 + DES)", () => {
    const character = buildCharacter(draft({
      classId: "wizard",
      baseStats: { FUE: 8, DES: 14, CON: 13, INT: 15, SAB: 10, CAR: 10 },
    }));
    expect(character.ac).toBe(10 + 2);
  });

  it("calculates rogue AC (pícaro: 11 + DES)", () => {
    const character = buildCharacter(draft({
      classId: "rogue",
      baseStats: { FUE: 8, DES: 16, CON: 12, INT: 14, SAB: 10, CAR: 12 },
    }));
    expect(character.ac).toBe(11 + 3);
  });

  it("calculates HP correctly for level 3 fighter (d10)", () => {
    const character = buildCharacter(draft({
      classId: "fighter",
      level: 3,
      baseStats: { FUE: 15, DES: 14, CON: 14, INT: 10, SAB: 10, CAR: 8 },
    }));
    const expected = 10 + 2 + 2 * (6 + 2);
    expect(character.hp).toBe(expected);
  });

  it("resolves subclass when subclassId is set", () => {
    const character = buildCharacter(draft({
      classId: "fighter",
      subclassId: "champion",
    }));
    expect(character.subclass).toBeDefined();
    expect(character.subclass?.id).toBe("champion");
  });

  it("returns undefined subclass when subclassId is null", () => {
    const character = buildCharacter(draft({ classId: "fighter" }));
    expect(character.subclass).toBeUndefined();
  });

  it("calculates level 4 wizard HP with CON 10", () => {
    const character = buildCharacter(draft({
      classId: "wizard",
      level: 4,
      baseStats: { FUE: 10, DES: 10, CON: 10, INT: 15, SAB: 10, CAR: 10 },
    }));
    const expected = 6 + 0 + 3 * (4 + 0);
    expect(character.hp).toBe(expected);
  });

  it("calculates proficiency bonus scaling for multi-class levels", () => {
    const char5 = buildCharacter(draft({ classId: "fighter", level: 5 }));
    expect(char5.proficiencyBonus).toBe(3);
    const char9 = buildCharacter(draft({ classId: "fighter", level: 9 }));
    expect(char9.proficiencyBonus).toBe(4);
  });

  it("returns 0 initiative with 10 DES", () => {
    const character = buildCharacter(draft({
      baseStats: { FUE: 10, DES: 10, CON: 10, INT: 10, SAB: 10, CAR: 10 },
    }));
    expect(character.initiative).toBe(0);
  });

  it("resolves race and class objects", () => {
    const character = buildCharacter(draft({
      raceId: "elf",
      classId: "wizard",
    }));
    expect(character.race?.id).toBe("elf");
    expect(character.class?.id).toBe("wizard");
  });
});

const STAT_KEYS = ["FUE", "DES", "CON", "INT", "SAB", "CAR"] as const;
