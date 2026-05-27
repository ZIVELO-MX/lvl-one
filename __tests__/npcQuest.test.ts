import { describe, expect, it } from "vitest";
import {
  createNPC,
  deleteNPC,
  saveNPC,
  upsertNPCRelation,
} from "@/data/npcStore";
import {
  createQuest,
  createQuestObjective,
  patchQuest,
  saveQuest,
  setQuestObjectiveCompleted,
} from "@/data/questStore";
import { createCampaign } from "@/lib/campaignStore";
import { reducer, type AppState } from "@/lib/store";
import type { Campaign } from "@/types/campaign";

function state(campaigns: Campaign[] = []): AppState {
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
  return createCampaign("Sombras de Neverwinter", "dm-1", {
    id: "campaign-1",
    createdAt: 1,
    updatedAt: 1,
    inviteCode: "M8CODE01",
    ...overrides,
  });
}

describe("npc store", () => {
  it("saves, updates, and deletes an NPC without duplicating by id", () => {
    const sildar = createNPC("campaign-1", {
      id: "npc-1",
      name: "  Sildar Hallwinter  ",
      race: "Human",
      archetype: "Patron",
      affiliations: ["Lord's Alliance", "Lord's Alliance", " "],
      tags: ["ally", "ally", "veteran"],
    });

    const saved = saveNPC([], sildar);
    const updated = saveNPC(saved, { ...sildar, name: "Sildar", disposition: "friendly" });
    const deleted = deleteNPC(updated, "npc-1");

    expect(saved[0]).toMatchObject({
      name: "Sildar Hallwinter",
      affiliations: ["Lord's Alliance"],
      tags: ["ally", "veteran"],
    });
    expect(updated).toHaveLength(1);
    expect(updated[0]).toMatchObject({ id: "npc-1", name: "Sildar", disposition: "friendly" });
    expect(deleted).toEqual([]);
  });

  it("upserts dynamic NPC relations by target", () => {
    const npc = createNPC("campaign-1", { id: "npc-1", name: "Iarno Albrek" });

    const related = upsertNPCRelation(npc, {
      targetId: "character-1",
      targetType: "character",
      relation: "rival",
      notes: "Sospecha del grupo.",
    });
    const updated = upsertNPCRelation(related, {
      targetId: "character-1",
      targetType: "character",
      relation: "traitor",
      notes: "Traicionó al grupo en Tresendar.",
    });

    expect(updated.relations).toHaveLength(1);
    expect(updated.relations[0]).toMatchObject({
      targetId: "character-1",
      relation: "traitor",
      notes: "Traicionó al grupo en Tresendar.",
    });
  });

  it("persists NPC CRUD through the app reducer", () => {
    const current = campaign();
    const npc = createNPC(current.id, { id: "npc-1", name: "Gundren Rockseeker" });

    const saved = reducer(state([current]), { type: "NPC_SAVE", campaignId: current.id, npc });
    const updated = reducer(saved, {
      type: "NPC_SAVE",
      campaignId: current.id,
      npc: { ...npc, location: "Phandalin" },
    });
    const deleted = reducer(updated, { type: "NPC_DELETE", campaignId: current.id, npcId: npc.id });

    expect(saved.campaigns[0].npcs).toHaveLength(1);
    expect(updated.campaigns[0].npcs).toHaveLength(1);
    expect(updated.campaigns[0].npcs[0].location).toBe("Phandalin");
    expect(deleted.campaigns[0].npcs).toEqual([]);
  });
});

describe("quest store", () => {
  it("saves and patches quests without duplicating by id", () => {
    const quest = createQuest("campaign-1", {
      id: "quest-1",
      title: "  Rescatar a Gundren  ",
      type: "main",
      status: "active",
      relatedNpcIds: ["npc-1", "npc-1", " "],
    });

    const saved = saveQuest([], quest);
    const patched = patchQuest(saved, "quest-1", { status: "completed", reward: "500 po" });

    expect(saved[0]).toMatchObject({
      title: "Rescatar a Gundren",
      relatedNpcIds: ["npc-1"],
    });
    expect(patched).toHaveLength(1);
    expect(patched[0]).toMatchObject({ id: "quest-1", status: "completed", reward: "500 po" });
  });

  it("normalizes unique quest objectives and toggles completion", () => {
    const first = createQuestObjective("Encontrar el escondite", { id: "obj-1" });
    const duplicate = createQuestObjective("No debe duplicarse", { id: "obj-1" });
    const quest = createQuest("campaign-1", {
      id: "quest-1",
      title: "La guarida Redbrand",
      objectives: [first, duplicate, createQuestObjective("   ", { id: "blank" })],
    });
    const completed = setQuestObjectiveCompleted(quest, "obj-1", true);

    expect(quest.objectives).toEqual([first]);
    expect(completed.objectives[0]).toMatchObject({ id: "obj-1", completed: true });
    expect(completed.objectives[0].completedAt).toEqual(expect.any(Number));
  });

  it("persists quest CRUD and objective updates through the app reducer", () => {
    const current = campaign();
    const objective = createQuestObjective("Hablar con Sildar", { id: "obj-1" });
    const quest = createQuest(current.id, {
      id: "quest-1",
      title: "Buscar aliados",
      objectives: [objective],
    });

    const saved = reducer(state([current]), { type: "QUEST_SAVE", campaignId: current.id, quest });
    const patched = reducer(saved, {
      type: "QUEST_PATCH",
      campaignId: current.id,
      questId: quest.id,
      patch: {
        objectives: [{ ...objective, completed: true }],
        status: "active",
      },
    });
    const deleted = reducer(patched, { type: "QUEST_DELETE", campaignId: current.id, questId: quest.id });

    expect(saved.campaigns[0].quests).toHaveLength(1);
    expect(patched.campaigns[0].quests[0].objectives[0].completed).toBe(true);
    expect(patched.campaigns[0].quests[0].status).toBe("active");
    expect(deleted.campaigns[0].quests).toEqual([]);
  });
});
