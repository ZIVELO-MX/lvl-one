import { describe, expect, it } from "vitest";
import { addSession, createCampaign, generateInviteCode, addPlayer } from "@/lib/campaignStore";
import { reducer, type AppState } from "@/lib/store";
import type { Campaign, CampaignPlayer, CampaignNote, Session } from "@/types/campaign";

function blankState(campaigns: Campaign[] = []): AppState {
  return {
    user: null,
    isLoading: false,
    characters: [],
    draftCharacter: null,
    campaigns,
    progress: { m00: { pct: 0, completedLessons: [] } },
    onboardingAnswers: null,
    ui: { limitModalOpen: false, toast: null },
  };
}

function campaign(overrides: Partial<Campaign> = {}): Campaign {
  return createCampaign("La Mina Perdida", "dm-1", {
    id: "campaign-1",
    createdAt: 1,
    updatedAt: 1,
    inviteCode: "ABCD1234",
    players: [{ id: "dm-player", userId: "dm-1", name: "DM", role: "dm", joinedAt: 1 }],
    sessions: [],
    notes: [],
    ...overrides,
  });
}

function session(overrides: Partial<Session> = {}): Session {
  return addSession("campaign-1", {
    id: "session-1",
    number: 1,
    title: "Inicio en Phandalin",
    date: "2026-05-23",
    createdAt: 1,
    updatedAt: 1,
    ...overrides,
  });
}

function note(overrides: Partial<CampaignNote> = {}): CampaignNote {
  return {
    id: "note-1",
    title: "Nota del DM",
    content: "El villano es el hermano del rey.",
    isDmOnly: false,
    createdAt: 1,
    updatedAt: 1,
    ...overrides,
  };
}

// ── CREATE ────────────────────────────────────────────────────

describe("CAMPAIGN_CREATE", () => {
  it("persists a created campaign in the reducer", () => {
    const created = campaign();
    const next = reducer(blankState(), { type: "CAMPAIGN_CREATE", campaign: created });

    expect(next.campaigns).toHaveLength(1);
    expect(next.campaigns[0]).toMatchObject({
      id: "campaign-1",
      name: "La Mina Perdida",
      dmId: "dm-1",
      inviteCode: "ABCD1234",
      players: expect.any(Array),
      sessions: expect.any(Array),
      notes: expect.any(Array),
    });
  });

  it("generates an 8-character alphanumeric invite code", () => {
    expect(generateInviteCode()).toMatch(/^[A-Z0-9]{8}$/);
  });

  it("creates unique invite codes across multiple calls", () => {
    const codes = new Set(Array.from({ length: 20 }, generateInviteCode));
    expect(codes.size).toBe(20);
  });
});

// ── READ / PATCH ───────────────────────────────────────────────

describe("CAMPAIGN_PATCH", () => {
  it("patches only the selected campaign and refreshes updatedAt", () => {
    const c1 = campaign({ id: "c1", name: "Campaña A", updatedAt: 1 });
    const c2 = campaign({ id: "c2", name: "Campaña B", updatedAt: 2 });

    const next = reducer(blankState([c1, c2]), {
      type: "CAMPAIGN_PATCH",
      id: "c1",
      patch: { name: "Campaña A Renombrada" },
    });

    expect(next.campaigns[0]).toMatchObject({ id: "c1", name: "Campaña A Renombrada" });
    expect(next.campaigns[0].updatedAt).toBeGreaterThan(1);
    expect(next.campaigns[1]).toBe(c2);
  });

  it("ignores patch if campaign id does not exist", () => {
    const current = campaign();
    const next = reducer(blankState([current]), {
      type: "CAMPAIGN_PATCH",
      id: "non-existent",
      patch: { name: "Should not apply" },
    });

    expect(next.campaigns[0]).toBe(current);
  });
});

// ── DELETE ─────────────────────────────────────────────────────

describe("CAMPAIGN_DELETE", () => {
  it("removes the campaign from state", () => {
    const c1 = campaign({ id: "c1" });
    const c2 = campaign({ id: "c2" });

    const next = reducer(blankState([c1, c2]), {
      type: "CAMPAIGN_DELETE",
      id: "c1",
    });

    expect(next.campaigns).toHaveLength(1);
    expect(next.campaigns[0].id).toBe("c2");
  });

  it("is a no-op if id does not match", () => {
    const current = campaign();
    const next = reducer(blankState([current]), {
      type: "CAMPAIGN_DELETE",
      id: "non-existent",
    });

    expect(next.campaigns).toHaveLength(1);
  });
});

// ── PLAYERS ───────────────────────────────────────────────────

describe("CAMPAIGN_PLAYER_ADD", () => {
  it("adds a new player to the campaign", () => {
    const current = campaign();
    const player: CampaignPlayer = {
      id: "player-1",
      userId: "user-1",
      name: "Lia",
      role: "player",
      joinedAt: 2,
    };

    const next = reducer(blankState([current]), {
      type: "CAMPAIGN_PLAYER_ADD",
      campaignId: current.id,
      player,
    });

    expect(next.campaigns[0].players).toHaveLength(2);
    expect(next.campaigns[0].players[1]).toMatchObject(player);
    expect(next.campaigns[0].updatedAt).toBeGreaterThan(1);
  });

  it("does not duplicate players with the same userId", () => {
    const current = campaign();
    const player: CampaignPlayer = {
      id: "player-1",
      userId: "user-1",
      name: "Lia",
      role: "player",
      joinedAt: 1,
    };

    const added = reducer(blankState([current]), {
      type: "CAMPAIGN_PLAYER_ADD",
      campaignId: current.id,
      player,
    });
    const duplicate = reducer(added, {
      type: "CAMPAIGN_PLAYER_ADD",
      campaignId: current.id,
      player: { ...player, id: "player-duplicate" },
    });

    expect(duplicate.campaigns[0].players).toHaveLength(2);
    expect(duplicate.campaigns[0].players.filter(p => p.userId === "user-1")).toHaveLength(1);
  });

  it("is a no-op if campaign id does not match", () => {
    const current = campaign();
    const player: CampaignPlayer = {
      id: "player-1",
      userId: "user-1",
      name: "Lia",
      role: "player",
      joinedAt: 1,
    };

    const next = reducer(blankState([current]), {
      type: "CAMPAIGN_PLAYER_ADD",
      campaignId: "non-existent",
      player,
    });

    expect(next.campaigns[0].players).toHaveLength(1);
  });
});

describe("CAMPAIGN_PLAYER_REMOVE", () => {
  it("removes a player by userId", () => {
    const player: CampaignPlayer = { id: "p1", userId: "u1", name: "Lia", role: "player", joinedAt: 1 };
    const current = campaign({ players: [
      { id: "dm-player", userId: "dm-1", name: "DM", role: "dm", joinedAt: 1 },
      player,
    ]});

    const next = reducer(blankState([current]), {
      type: "CAMPAIGN_PLAYER_REMOVE",
      campaignId: current.id,
      userId: "u1",
    });

    expect(next.campaigns[0].players).toHaveLength(1);
    expect(next.campaigns[0].players[0].userId).toBe("dm-1");
  });

  it("removes a player by playerId when userId is not provided", () => {
    const current = campaign({ players: [
      { id: "dm-player", userId: "dm-1", name: "DM", role: "dm", joinedAt: 1 },
      { id: "p1", userId: "u1", name: "Lia", role: "player", joinedAt: 1 },
    ]});

    const next = reducer(blankState([current]), {
      type: "CAMPAIGN_PLAYER_REMOVE",
      campaignId: current.id,
      playerId: "p1",
    });

    expect(next.campaigns[0].players).toHaveLength(1);
    expect(next.campaigns[0].players[0].id).toBe("dm-player");
  });
});

describe("CAMPAIGN_PLAYER_PATCH", () => {
  it("patches a player's role", () => {
    const current = campaign({ players: [
      { id: "dm-player", userId: "dm-1", name: "DM", role: "dm", joinedAt: 1 },
      { id: "p1", userId: "u1", name: "Lia", role: "player", joinedAt: 1 },
    ]});

    const next = reducer(blankState([current]), {
      type: "CAMPAIGN_PLAYER_PATCH",
      campaignId: current.id,
      userId: "u1",
      patch: { role: "co-dm" },
    });

    expect(next.campaigns[0].players[1].role).toBe("co-dm");
    expect(next.campaigns[0].players[0].role).toBe("dm"); // unchanged
  });
});

// ── SESSIONS ───────────────────────────────────────────────────

describe("SESSION_ADD", () => {
  it("adds a session to an existing campaign", () => {
    const current = campaign();
    const firstSession = session();

    const next = reducer(blankState([current]), {
      type: "SESSION_ADD",
      campaignId: current.id,
      session: firstSession,
    });

    expect(next.campaigns[0].sessions).toEqual([firstSession]);
  });

  it("appends sessions preserving order", () => {
    const current = campaign();
    const s1 = session({ id: "s1", number: 1 });
    const s2 = session({ id: "s2", number: 2 });

    const afterFirst = reducer(blankState([current]), {
      type: "SESSION_ADD",
      campaignId: current.id,
      session: s1,
    });
    const afterSecond = reducer(afterFirst, {
      type: "SESSION_ADD",
      campaignId: current.id,
      session: s2,
    });

    expect(afterSecond.campaigns[0].sessions).toHaveLength(2);
    expect(afterSecond.campaigns[0].sessions[0].id).toBe("s1");
    expect(afterSecond.campaigns[0].sessions[1].id).toBe("s2");
  });
});

describe("SESSION_PATCH", () => {
  it("updates only the selected session", () => {
    const first = session({ id: "session-1", title: "Primera sesión" });
    const second = session({ id: "session-2", number: 2, title: "Segunda sesión" });
    const current = campaign({ sessions: [first, second] });

    const next = reducer(blankState([current]), {
      type: "SESSION_PATCH",
      campaignId: current.id,
      sessionId: "session-2",
      patch: { summary: "El grupo recuperó el mapa perdido.", xpAwarded: 300 },
    });

    expect(next.campaigns[0].sessions[0]).toBe(first);
    expect(next.campaigns[0].sessions[1]).toMatchObject({
      id: "session-2",
      summary: "El grupo recuperó el mapa perdido.",
      xpAwarded: 300,
    });
    expect(next.campaigns[0].sessions[1].updatedAt).toBeGreaterThan(1);
  });

  it("does nothing if session id does not match", () => {
    const current = campaign({ sessions: [session()] });

    const next = reducer(blankState([current]), {
      type: "SESSION_PATCH",
      campaignId: current.id,
      sessionId: "non-existent",
      patch: { summary: "Should not apply" },
    });

    expect(next.campaigns[0].sessions[0]).toEqual(current.sessions[0]);
  });
});

describe("SESSION_DELETE", () => {
  it("removes the session from the campaign", () => {
    const s1 = session({ id: "s1" });
    const s2 = session({ id: "s2", number: 2 });
    const current = campaign({ sessions: [s1, s2] });

    const next = reducer(blankState([current]), {
      type: "SESSION_DELETE",
      campaignId: current.id,
      sessionId: "s1",
    });

    expect(next.campaigns[0].sessions).toHaveLength(1);
    expect(next.campaigns[0].sessions[0].id).toBe("s2");
  });

  it("is a no-op if session id does not match", () => {
    const current = campaign({ sessions: [session()] });

    const next = reducer(blankState([current]), {
      type: "SESSION_DELETE",
      campaignId: current.id,
      sessionId: "non-existent",
    });

    expect(next.campaigns[0].sessions).toHaveLength(1);
  });
});

// ── NOTES ──────────────────────────────────────────────────────

describe("CAMPAIGN_NOTE_SAVE", () => {
  it("adds a note to a campaign", () => {
    const current = campaign();
    const newNote = note();

    const next = reducer(blankState([current]), {
      type: "CAMPAIGN_NOTE_SAVE",
      campaignId: current.id,
      note: newNote,
    });

    expect(next.campaigns[0].notes).toHaveLength(1);
    expect(next.campaigns[0].notes[0]).toMatchObject(newNote);
  });

  it("updates an existing note by id", () => {
    const existingNote = note({ id: "note-1", title: "Viejo título", content: "Viejo contenido" });
    const current = campaign({ notes: [existingNote] });

    const next = reducer(blankState([current]), {
      type: "CAMPAIGN_NOTE_SAVE",
      campaignId: current.id,
      note: { id: "note-1", title: "Nuevo título", content: "Nuevo contenido", isDmOnly: false },
    });

    expect(next.campaigns[0].notes).toHaveLength(1);
    expect(next.campaigns[0].notes[0]).toMatchObject({
      id: "note-1",
      title: "Nuevo título",
      content: "Nuevo contenido",
    });
    expect(next.campaigns[0].notes[0].updatedAt).toBeGreaterThan(1);
  });
});

describe("CAMPAIGN_NOTE_DELETE", () => {
  it("removes the note from the campaign", () => {
    const n1 = note({ id: "n1" });
    const n2 = note({ id: "n2", title: "Otra nota" });
    const current = campaign({ notes: [n1, n2] });

    const next = reducer(blankState([current]), {
      type: "CAMPAIGN_NOTE_DELETE",
      campaignId: current.id,
      noteId: "n1",
    });

    expect(next.campaigns[0].notes).toHaveLength(1);
    expect(next.campaigns[0].notes[0].id).toBe("n2");
  });

  it("is a no-op if note id does not match", () => {
    const current = campaign({ notes: [note()] });

    const next = reducer(blankState([current]), {
      type: "CAMPAIGN_NOTE_DELETE",
      campaignId: current.id,
      noteId: "non-existent",
    });

    expect(next.campaigns[0].notes).toHaveLength(1);
  });
});

// ── HELPERS ────────────────────────────────────────────────────

describe("campaign helpers", () => {
  it("addPlayer normalizes joinedAt", () => {
    const c = createCampaign("Test", "dm-1");
    const updated = addPlayer(c, {
      id: "p1", userId: "u1", name: "Test", role: "player",
    });

    expect(updated.players[1].joinedAt).toBeGreaterThan(0);
  });

  it("updateSession preserves id and campaignId", () => {
    const s = session({ id: "s1", campaignId: "c1", createdAt: 100 });
    const updated = addSession(s.campaignId, { id: "s1", number: 2, title: "Updated", createdAt: 100 });

    expect(updated.id).toBe("s1");
    expect(updated.campaignId).toBe("c1");
  });
});
