import { describe, expect, it } from "vitest";
import { reducer, type AppState, type AppUser } from "@/lib/store";
import type { CharacterDraft } from "@/types/character";

function character(overrides: Partial<CharacterDraft> = {}): CharacterDraft {
  return {
    id: "character-1",
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
    equippedItems: [],
    spells: [],
    createdAt: 1,
    updatedAt: 1,
    ...overrides,
  };
}

function state(overrides: Partial<AppState> = {}): AppState {
  return {
    user: null,
    isLoading: false,
    characters: [],
    draftCharacter: null,
    campaigns: [],
    progress: { m00: { pct: 0, completedLessons: [] } },
    onboardingAnswers: null,
    ui: { limitModalOpen: false, toast: null },
    ...overrides,
  };
}

describe("store reducer", () => {
  it("LOGIN sets user", () => {
    const user: AppUser = { id: "user-1", username: "test", email: "test@test.com" };
    const next = reducer(state(), { type: "LOGIN", user });
    expect(next.user).toEqual(user);
  });

  it("LOGOUT clears user but keeps progress", () => {
    const user: AppUser = { id: "user-1", username: "test", email: "test@test.com" };
    const progress = { m00: { pct: 50, completedLessons: ["l1"] } };
    const loggedIn = reducer(state({ progress }), { type: "LOGIN", user });
    const loggedOut = reducer(loggedIn, { type: "LOGOUT" });
    expect(loggedOut.user).toBeNull();
    expect(loggedOut.progress).toEqual(progress);
  });

  it("DRAFT_INIT sets draftCharacter", () => {
    const d = character({ id: "draft-1" });
    const next = reducer(state(), { type: "DRAFT_INIT", draft: d });
    expect(next.draftCharacter?.id).toBe("draft-1");
  });

  it("DRAFT_UPDATE patches draftCharacter and sets updatedAt", () => {
    const d = character({ id: "draft-1", name: "Old" });
    const withDraft = reducer(state(), { type: "DRAFT_INIT", draft: d });
    const updated = reducer(withDraft, { type: "DRAFT_UPDATE", patch: { name: "New", level: 2 } });
    expect(updated.draftCharacter?.name).toBe("New");
    expect(updated.draftCharacter?.level).toBe(2);
    expect(updated.draftCharacter?.updatedAt).toBeGreaterThan(d.updatedAt);
  });

  it("DRAFT_UPDATE does nothing when no draft exists", () => {
    const next = reducer(state(), { type: "DRAFT_UPDATE", patch: { name: "New" } });
    expect(next.draftCharacter).toBeNull();
  });

  it("DRAFT_CLEAR clears draftCharacter", () => {
    const d = character({ id: "draft-1" });
    const withDraft = reducer(state(), { type: "DRAFT_INIT", draft: d });
    const cleared = reducer(withDraft, { type: "DRAFT_CLEAR" });
    expect(cleared.draftCharacter).toBeNull();
  });

  it("CHARACTER_SAVE adds a new character", () => {
    const ch = character({ id: "new-char", name: "New" });
    const next = reducer(state(), { type: "CHARACTER_SAVE", character: ch });
    expect(next.characters).toHaveLength(1);
    expect(next.characters[0].name).toBe("New");
    expect(next.draftCharacter).toBeNull();
  });

  it("CHARACTER_SAVE updates an existing character", () => {
    const ch = character({ id: "c1", name: "Original" });
    const withChar = reducer(state(), { type: "CHARACTER_SAVE", character: ch });
    const updated = reducer(withChar, { type: "CHARACTER_SAVE", character: { ...ch, name: "Updated" } });
    expect(updated.characters).toHaveLength(1);
    expect(updated.characters[0].name).toBe("Updated");
  });

  it("CHARACTER_PATCH patches only the selected character", () => {
    const target = character({ id: "target", name: "Old Name", updatedAt: 1 });
    const other = character({ id: "other", name: "Other", updatedAt: 2 });

    const next = reducer(state({ characters: [target, other] }), {
      type: "CHARACTER_PATCH",
      id: "target",
      patch: { name: "New Name", status: "ready" },
    });

    expect(next.characters[0]).toMatchObject({ id: "target", name: "New Name", status: "ready" });
    expect(next.characters[0].updatedAt).toBeGreaterThan(1);
    expect(next.characters[1]).toBe(other);
  });

  it("CHARACTER_DELETE removes the character", () => {
    const ch = character({ id: "to-delete" });
    const withChar = reducer(state({ characters: [ch] }), { type: "CHARACTER_SAVE", character: ch });
    const deleted = reducer(withChar, { type: "CHARACTER_DELETE", id: "to-delete" });
    expect(deleted.characters.find(c => c.id === "to-delete")).toBeUndefined();
  });

  it("CHARACTER_DUPLICATE creates a copy with ' (copia)' suffix", () => {
    const ch = character({ id: "original", name: "Hero" });
    const withChar = reducer(state({ characters: [ch] }), { type: "CHARACTER_SAVE", character: ch });
    const dupState = reducer(withChar, { type: "CHARACTER_DUPLICATE", id: "original" });
    const dup = dupState.characters.find(c => c.name === "Hero (copia)");
    expect(dup).toBeDefined();
    expect(dup?.id).not.toBe("original");
    expect(dup?.status).toBe("draft");
  });

  it("CHARACTER_DUPLICATE opens limit modal when at max", () => {
    const chars = Array.from({ length: 2 }, (_, i) => character({ id: `c${i}`, name: `Char ${i}` }));
    const withChars = reducer(state({ characters: chars }), { type: "CHARACTER_SAVE", character: chars[0] });
    const base = reducer(withChars, { type: "CHARACTER_SAVE", character: chars[1] });
    const duplicate = reducer(base, { type: "CHARACTER_DUPLICATE", id: "c0" });
    expect(duplicate.ui.limitModalOpen).toBe(true);
  });

  it("persists currency patches on a character sheet", () => {
    const current = character({ gold: 0, silver: 1, copper: 2, platinum: 3 });

    const next = reducer(state({ characters: [current] }), {
      type: "CHARACTER_PATCH",
      id: current.id,
      patch: { gold: 25, silver: 0, copper: 7, platinum: 1 },
    });

    expect(next.characters[0]).toMatchObject({
      gold: 25,
      silver: 0,
      copper: 7,
      platinum: 1,
    });
  });

  it("persists and resets spell slot usage through character patches", () => {
    const current = character({ classId: "wizard", spellSlotsUsed: { 1: 1 } });

    const spent = reducer(state({ characters: [current] }), {
      type: "CHARACTER_PATCH",
      id: current.id,
      patch: { spellSlotsUsed: { 1: 2, 2: 1 } },
    });

    expect(spent.characters[0].spellSlotsUsed).toEqual({ 1: 2, 2: 1 });

    const reset = reducer(spent, {
      type: "CHARACTER_PATCH",
      id: current.id,
      patch: { spellSlotsUsed: {} },
    });

    expect(reset.characters[0].spellSlotsUsed).toEqual({});
  });

  it("TOAST sets toast message and TOAST_CLEAR clears it", () => {
    const withToast = reducer(state(), { type: "TOAST", toast: "Hello" });
    expect(withToast.ui.toast).toBe("Hello");
    const cleared = reducer(withToast, { type: "TOAST_CLEAR" });
    expect(cleared.ui.toast).toBeNull();
  });

  it("LIMIT_OPEN and LIMIT_CLOSE toggle limit modal", () => {
    const opened = reducer(state(), { type: "LIMIT_OPEN" });
    expect(opened.ui.limitModalOpen).toBe(true);
    const closed = reducer(opened, { type: "LIMIT_CLOSE" });
    expect(closed.ui.limitModalOpen).toBe(false);
  });
});
