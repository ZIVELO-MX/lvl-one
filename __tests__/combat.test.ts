import { describe, expect, it } from "vitest";
import {
  addCondition,
  combatantIsAlive,
  CONDITION_COLOR,
  CONDITION_ICON,
  CONDITION_LABEL,
  CONDITION_TYPES,
  difficultyThresholds,
  hasCondition,
  newCombatant,
  removeCondition,
  tickConditionDurations,
} from "@/types/combat";
import { crToXp, monsterDifficulty } from "@/types/monster";

describe("monster challenge helpers", () => {
  it("maps challenge rating to XP", () => {
    expect(crToXp(0)).toBe(10);
    expect(crToXp(5)).toBe(1800);
    expect(crToXp(10)).toBe(5900);
    expect(crToXp(20)).toBe(25000);
  });

  it("estimates encounter difficulty for a beginner party scale", () => {
    expect(monsterDifficulty(4, 5, 800)).toBe("medio");
    expect(monsterDifficulty(4, 5, 3300)).toBe("dificil");
    expect(monsterDifficulty(4, 5, 4400)).toBe("mortal");
  });

  it("exposes difficulty thresholds from level 1 to 20", () => {
    expect(difficultyThresholds(1).mortal).toBe(100);
    expect(difficultyThresholds(20).mortal).toBeGreaterThanOrEqual(20000);
    expect(difficultyThresholds(999)).toEqual(difficultyThresholds(20));
    expect(difficultyThresholds(-1)).toEqual(difficultyThresholds(1));
  });
});

describe("combatant helpers", () => {
  it("resolves combatant life from hp and death saves", () => {
    const dying = newCombatant({
      id: "pc-1",
      name: "Seren",
      type: "player",
      hp: 0,
      maxHp: 18,
      deathSaves: { successes: 0, failures: 2 },
    });
    const dead = newCombatant({
      ...dying,
      deathSaves: { successes: 0, failures: 3 },
    });
    const defeatedMonster = newCombatant({
      id: "monster-1",
      name: "Sombra",
      type: "monster",
      hp: 0,
      maxHp: 16,
    });

    expect(dying.isAlive).toBe(true);
    expect(dead.isAlive).toBe(false);
    expect(combatantIsAlive(dead)).toBe(false);
    expect(defeatedMonster.isAlive).toBe(false);
  });
});

describe("condition helpers", () => {
  it("defines labels, colors, and icons for every condition", () => {
    for (const type of CONDITION_TYPES) {
      expect(CONDITION_LABEL[type]).toEqual(expect.any(String));
      expect(CONDITION_COLOR[type]).toMatch(/^#|^var\(/);
      expect(CONDITION_ICON[type]).toEqual(expect.any(String));
    }
  });

  it("adds, replaces, ticks, and removes conditions", () => {
    const combatant = newCombatant({ id: "pc-1", name: "Mara", type: "player", hp: 12, maxHp: 12 });
    const poisoned = addCondition(combatant, { type: "poisoned", duration: 2, source: "trap" });
    const refreshed = addCondition(poisoned, { type: "poisoned", duration: 1, source: "spell" });
    const ticked = tickConditionDurations(refreshed);
    const removed = removeCondition(ticked, "poisoned");

    expect(hasCondition(poisoned, "poisoned")).toBe(true);
    expect(refreshed.conditions).toEqual([{ type: "poisoned", duration: 1, source: "spell" }]);
    expect(ticked.conditions).toEqual([]);
    expect(removed.conditions).toEqual([]);
  });
});
