import { describe, expect, it } from "vitest";
import { generateEncounter, BIOMES } from "@/data/generators/encounters";
import { CULTURES, generateName } from "@/data/generators/names";
import { generateQuickNPC } from "@/data/generators/npcs";
import { generateHook, generateRumor } from "@/data/generators/rumors";
import { EVENTS_TABLE, REACTION_TABLE, WEATHER_TABLE } from "@/data/generators/tables";
import { generateTavern } from "@/data/generators/taverns";
import { generateTreasure } from "@/data/generators/treasures";
import { pickRandom, rollDice, seededRandom } from "@/lib/random";

describe("random utilities", () => {
  it("returns deterministic random values and picks for the same seed", () => {
    const entries = ["uno", "dos", "tres", "cuatro"];

    expect(seededRandom(123)).toBe(seededRandom(123));
    expect(pickRandom(entries, 42)).toBe(pickRandom(entries, 42));
  });

  it("rolls dice within the expected range", () => {
    const result = rollDice(20, 1, 5);

    expect(result.rolls).toHaveLength(1);
    expect(result.total).toBeGreaterThanOrEqual(6);
    expect(result.total).toBeLessThanOrEqual(25);
    expect(result.formula).toBe("1d20+5");
  });
});

describe("name generator", () => {
  it("generates a non-empty name for every culture", () => {
    for (const culture of CULTURES) {
      expect(generateName(culture, "male", 10)).toEqual(expect.any(String));
      expect(generateName(culture, "female", 11).length).toBeGreaterThan(3);
    }
  });
});

describe("dm toolkit generators", () => {
  it("generates deterministic taverns, NPCs, rumors, and hooks", () => {
    expect(generateTavern(77)).toEqual(generateTavern(77));
    expect(generateQuickNPC(77)).toEqual(generateQuickNPC(77));
    expect(generateRumor(77)).toBe(generateRumor(77));
    expect(generateHook(77)).toEqual(generateHook(77));
  });

  it("generates treasure with different gold ranges by CR tier", () => {
    const low = generateTreasure(1, 5);
    const high = generateTreasure(15, 5);

    expect(low.gold).toBeGreaterThanOrEqual(12);
    expect(low.gold).toBeLessThanOrEqual(140);
    expect(high.gold).toBeGreaterThanOrEqual(2400);
    expect(high.gold).toBeLessThanOrEqual(9200);
    expect(high.gold).toBeGreaterThan(low.gold);
    expect(low.items.length).toBeGreaterThan(0);
    expect(high.items.length).toBeGreaterThan(0);
  });

  it("generates encounters for supported biomes and levels", () => {
    for (const biome of BIOMES) {
      const encounter = generateEncounter(biome, 5, 99);

      expect(encounter.description.length).toBeGreaterThan(0);
      expect(encounter.monsters.length).toBeGreaterThan(0);
      expect(encounter.note.length).toBeGreaterThan(0);
    }
  });
});

describe("d20 tables", () => {
  it("exposes exactly 20 entries per table", () => {
    expect(WEATHER_TABLE).toHaveLength(20);
    expect(REACTION_TABLE).toHaveLength(20);
    expect(EVENTS_TABLE).toHaveLength(20);
  });
});
