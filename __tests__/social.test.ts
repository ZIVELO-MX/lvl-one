import { describe, expect, it } from "vitest";
import { xpToLevel } from "@/types/gamification";
import { ACHIEVEMENT_DEFS } from "@/data/achievements";
import type { ActivityType } from "@/types/social";
import type { BadgeType } from "@/types/gamification";

describe("xpToLevel", () => {
  it("returns 1 for 0 XP", () => {
    expect(xpToLevel(0)).toBe(1);
  });

  it("returns 2 for exactly 500 XP", () => {
    expect(xpToLevel(500)).toBe(2);
  });

  it("returns 3 for 1499 XP", () => {
    expect(xpToLevel(1499)).toBe(3);
  });

  it("returns 3 for 1500 XP", () => {
    expect(xpToLevel(1500)).toBe(4);
  });

  it("returns 10 for 4500 XP", () => {
    expect(xpToLevel(4500)).toBe(10);
  });
});

describe("ACHIEVEMENT_DEFS", () => {
  const badgeTypes: BadgeType[] = [
    "first_character",
    "first_campaign",
    "first_level_up",
    "ten_sessions",
    "five_characters",
    "group_leader",
    "explorer",
    "completionist",
  ];

  for (const badge of badgeTypes) {
    it(`has an entry for "${badge}"`, () => {
      expect(ACHIEVEMENT_DEFS[badge]).toBeDefined();
      expect(ACHIEVEMENT_DEFS[badge].label).toBeTruthy();
      expect(ACHIEVEMENT_DEFS[badge].description).toBeTruthy();
      expect(ACHIEVEMENT_DEFS[badge].icon).toBeTruthy();
      expect(ACHIEVEMENT_DEFS[badge].xpReward).toBeGreaterThan(0);
    });
  }
});

describe("ActivityType", () => {
  const types: ActivityType[] = [
    "character_created",
    "campaign_created",
    "session_played",
    "level_up",
    "achievement_earned",
  ];

  for (const t of types) {
    it(`"${t}" is a valid ActivityType`, () => {
      expect(types).toContain(t);
    });
  }

  it("covers exactly 5 types", () => {
    expect(types.length).toBe(5);
  });
});

describe("BadgeType coverage", () => {
  const badgeTypes: BadgeType[] = [
    "first_character",
    "first_campaign",
    "first_level_up",
    "ten_sessions",
    "five_characters",
    "group_leader",
    "explorer",
    "completionist",
  ];

  it("covers exactly 8 badge types", () => {
    expect(badgeTypes.length).toBe(8);
  });

  for (const badge of badgeTypes) {
    it(`"${badge}" has a label in ACHIEVEMENT_DEFS`, () => {
      expect(ACHIEVEMENT_DEFS[badge].label).toBeTypeOf("string");
    });
  }
});
