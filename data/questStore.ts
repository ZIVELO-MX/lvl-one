import { newQuest } from "@/types/quest";
import type { Quest, QuestObjective } from "@/types/quest";
import { cleanList } from "@/lib/utils";
import { uid } from "@/lib/uid";

export type QuestInput = Partial<Quest> & Pick<Quest, "title">;
export type QuestPatch = Partial<Omit<Quest, "id" | "campaignId" | "createdAt">>;

export function createQuestObjective(description: string, overrides: Partial<QuestObjective> = {}): QuestObjective {
  return {
    id: overrides.id ?? uid(),
    description: description.trim(),
    completed: overrides.completed ?? false,
    completedAt: overrides.completedAt,
  };
}

export function normalizeQuest(quest: Quest): Quest {
  const seenObjectiveIds = new Set<string>();
  const objectives = quest.objectives
    .map(objective => ({
      ...objective,
      description: objective.description.trim(),
    }))
    .filter(objective => {
      if (!objective.description || seenObjectiveIds.has(objective.id)) return false;
      seenObjectiveIds.add(objective.id);
      return true;
    });

  return {
    ...quest,
    title: quest.title.trim(),
    description: quest.description.trim(),
    reward: quest.reward.trim(),
    consequences: quest.consequences.trim(),
    relatedNpcIds: cleanList(quest.relatedNpcIds),
    notes: quest.notes.trim(),
    objectives,
  };
}

export function createQuest(campaignId: string, data: QuestInput): Quest {
  return normalizeQuest(newQuest(campaignId, data));
}

export function saveQuest(quests: Quest[], quest: Quest): Quest[] {
  const normalized = normalizeQuest(quest);
  const idx = quests.findIndex(current => current.id === normalized.id);
  if (idx < 0) return [...quests, normalized];
  return quests.map(current => current.id === normalized.id ? normalized : current);
}

export function patchQuest(quests: Quest[], questId: string, patch: QuestPatch): Quest[] {
  const now = Date.now();
  return quests.map(quest =>
    quest.id === questId
      ? normalizeQuest({
          ...quest,
          ...patch,
          id: quest.id,
          campaignId: quest.campaignId,
          createdAt: quest.createdAt,
          updatedAt: now,
        })
      : quest,
  );
}

export function deleteQuest(quests: Quest[], questId: string): Quest[] {
  return quests.filter(quest => quest.id !== questId);
}

export function setQuestObjectiveCompleted(quest: Quest, objectiveId: string, completed: boolean): Quest {
  const now = Date.now();
  return normalizeQuest({
    ...quest,
    objectives: quest.objectives.map(objective =>
      objective.id === objectiveId
        ? { ...objective, completed, completedAt: completed ? now : undefined }
        : objective,
    ),
    updatedAt: now,
  });
}

export function upsertQuestObjective(quest: Quest, objective: QuestObjective): Quest {
  const exists = quest.objectives.some(current => current.id === objective.id);
  return normalizeQuest({
    ...quest,
    objectives: exists
      ? quest.objectives.map(current => current.id === objective.id ? objective : current)
      : [...quest.objectives, objective],
    updatedAt: Date.now(),
  });
}

export function removeQuestObjective(quest: Quest, objectiveId: string): Quest {
  return {
    ...quest,
    objectives: quest.objectives.filter(objective => objective.id !== objectiveId),
    updatedAt: Date.now(),
  };
}
