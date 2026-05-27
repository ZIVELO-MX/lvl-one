import { describe, expect, it } from "vitest";
import { CLASS_DETAILS, RACE_DETAILS } from "@/data/encyclopedia";
import { GLOSSARY_TERMS } from "@/data/glossary";
import { CLASSES } from "@/data/classes";
import { RACES } from "@/data/races";

describe("M5 encyclopedia data", () => {
  it("has standalone glossary terms with stable ids and categories", () => {
    expect(GLOSSARY_TERMS.length).toBeGreaterThanOrEqual(24);

    const ids = new Set(GLOSSARY_TERMS.map((term) => term.id));
    expect(ids.size).toBe(GLOSSARY_TERMS.length);
    expect(ids.has("")).toBe(false);
    expect(GLOSSARY_TERMS.every((term) => term.t && term.cat && term.def && term.ex)).toBe(true);
  });

  it("provides detail content for every race in the catalog", () => {
    expect(Object.keys(RACE_DETAILS).sort()).toEqual(RACES.map((race) => race.id).sort());

    RACES.forEach((race) => {
      const detail = RACE_DETAILS[race.id];
      expect(detail.lore.length).toBeGreaterThan(60);
      expect(detail.playstyle.length).toBeGreaterThan(60);
      expect(detail.beginnerTips.length).toBeGreaterThanOrEqual(3);
      expect(detail.roleplayHooks.length).toBeGreaterThanOrEqual(3);
    });
  });

  it("provides detail content for every class in the catalog", () => {
    expect(Object.keys(CLASS_DETAILS).sort()).toEqual(CLASSES.map((cls) => cls.id).sort());

    CLASSES.forEach((cls) => {
      const detail = CLASS_DETAILS[cls.id];
      expect(detail.fantasy.length).toBeGreaterThan(60);
      expect(detail.tableRole.length).toBeGreaterThan(60);
      expect(detail.beginnerTips.length).toBeGreaterThanOrEqual(3);
      expect(detail.levelOneLoop.length).toBeGreaterThanOrEqual(4);
    });
  });
});
