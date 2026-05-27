import { uid } from "@/lib/uid";
export type QuestType = "main" | "side" | "faction" | "personal" | "bounty";
export type QuestStatus = "available" | "active" | "completed" | "failed";

export interface QuestObjective {
  id: string;
  description: string;
  completed: boolean;
  completedAt?: number;
}

export interface Quest {
  id: string;
  campaignId: string;
  title: string;
  type: QuestType;
  status: QuestStatus;
  description: string;
  objectives: QuestObjective[];
  reward: string;
  consequences: string;
  questGiverId?: string;
  relatedNpcIds: string[];
  timeLimit?: string;
  notes: string;
  completedSessionId?: string;
  createdAt: number;
  updatedAt: number;
}

export function newQuest(campaignId: string, overrides?: Partial<Quest>): Quest {
  const now = Date.now();
  return {
    id: uid(),
    campaignId,
    title: "",
    type: "side",
    status: "available",
    description: "",
    objectives: [],
    reward: "",
    consequences: "",
    relatedNpcIds: [],
    notes: "",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export const QUEST_TYPE_LABEL: Record<QuestType, string> = {
  main: "Principal",
  side: "Secundaria",
  faction: "Facción",
  personal: "Personal",
  bounty: "Recompensa",
};

export const QUEST_STATUS_LABEL: Record<QuestStatus, string> = {
  available: "Disponible",
  active: "Activa",
  completed: "Completada",
  failed: "Fallida",
};

export const QUEST_TYPE_COLOR: Record<QuestType, string> = {
  main: "var(--quest-gold-hi)",
  side: "var(--arcane-blue-hi)",
  faction: "#A3C28F",
  personal: "#C28FA3",
  bounty: "#C28F8F",
};
