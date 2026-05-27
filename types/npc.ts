import { uid } from "@/lib/uid";
export type NPCDisposition = "friendly" | "neutral" | "hostile" | "unknown";
export type NPCAlignment = "lg" | "ng" | "cg" | "ln" | "tn" | "cn" | "le" | "ne" | "ce";
export type NPCRelationType = "ally" | "neutral" | "hostile" | "romantic" | "rival" | "traitor" | "family" | "unknown";

export interface NPCRelation {
  targetId: string;
  targetType: "character" | "npc";
  relation: NPCRelationType;
  notes?: string;
}

export interface NPCMemory {
  id: string;
  text: string;
  sessionId?: string;
  createdAt: number;
}

export interface NPC {
  id: string;
  campaignId: string;
  name: string;
  race?: string;
  archetype?: string;
  occupation?: string;
  location?: string;
  alignment?: NPCAlignment;
  disposition: NPCDisposition;
  appearance?: string;
  personality?: string;
  ideals?: string;
  bonds?: string;
  flaws?: string;
  secrets?: string;
  backstory?: string;
  notes?: string;
  affiliations: string[];
  relations: NPCRelation[];
  memory: NPCMemory[];
  sessionIds: string[];
  tags: string[];
  armorClass?: number;
  hitPoints?: number;
  challengeRating?: number;
  isAlive: boolean;
  createdAt: number;
  updatedAt: number;
}

export function newNPC(campaignId: string, overrides?: Partial<NPC>): NPC {
  const now = Date.now();
  return {
    id: uid(),
    campaignId,
    name: "",
    disposition: "neutral",
    affiliations: [],
    relations: [],
    memory: [],
    sessionIds: [],
    tags: [],
    isAlive: true,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export const DISPOSITION_LABEL: Record<NPCDisposition, string> = {
  friendly: "Aliado",
  neutral: "Neutral",
  hostile: "Hostil",
  unknown: "Desconocido",
};

export const ALIGNMENT_LABEL: Record<NPCAlignment, string> = {
  lg: "Legal Bueno", ng: "Neutral Bueno", cg: "Caótico Bueno",
  ln: "Legal Neutral", tn: "Neutral Verdadero", cn: "Caótico Neutral",
  le: "Legal Malvado", ne: "Neutral Malvado", ce: "Caótico Malvado",
};
