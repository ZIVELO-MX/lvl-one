import { uid } from "@/lib/uid";
export type CampaignStatus = "planning" | "active" | "paused" | "completed" | "archived";
export type CampaignRole = "dm" | "co-dm" | "player" | "spectator";
export type SessionStatus = "scheduled" | "in-progress" | "completed" | "cancelled";

export interface CampaignPlayer {
  id: string;
  userId?: string;
  name: string;
  role: CampaignRole;
  characterId?: string;
  joinedAt: number;
}

export interface CampaignNote {
  id: string;
  title: string;
  content: string;
  isDmOnly: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface CampaignDecision {
  id: string;
  description: string;
  sessionId: string;
  madeBy?: string; // player id or "party"
  consequences?: string;
  createdAt: number;
}

export interface Session {
  id: string;
  campaignId: string;
  number: number;
  title: string;
  status: SessionStatus;
  summary: string;
  npcs: string[]; // npc names or ids
  npcsEncountered?: string[];
  loot: string;
  lootObtained?: string[];
  xpAwarded: number;
  questsStarted?: string[];
  questsCompleted?: string[];
  deaths?: number;
  keyDecisions?: string;
  decisions: CampaignDecision[];
  date: string; // ISO date
  createdAt: number;
  updatedAt: number;
}

export interface CampaignRules {
  allowedRaces?: string[];
  allowedClasses?: string[];
  allowMulticlass: boolean;
  allowFeats: boolean;
  allowHomebrew: boolean;
  startingLevel: number;
  maxLevel?: number;
  customRules?: string;
  statGeneration: "standard" | "roll" | "point-buy";
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  coverImage?: string;
  setting: string;
  coverColor: string;
  status: CampaignStatus;
  dmId: string;
  players: CampaignPlayer[];
  sessions: Session[];
  notes: CampaignNote[];
  npcs: import("./npc").NPC[];
  quests: import("./quest").Quest[];
  locations: import("./world").Location[];
  factions: import("./world").Faction[];
  worldLore: import("./world").WorldLore[];
  inviteCode?: string;
  rules: CampaignRules;
  createdAt: number;
  updatedAt: number;
}

export interface CampaignSummary {
  id: string;
  name: string;
  setting: string;
  coverColor: string;
  status: CampaignStatus;
  playerCount: number;
  sessionCount: number;
  lastSessionAt?: number;
  createdAt: number;
}

const INVITE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function localInviteCode() {
  return Array.from({ length: 8 }, () => INVITE_CHARS[Math.floor(Math.random() * INVITE_CHARS.length)]).join("");
}

export function newCampaign(dmId: string, overrides?: Partial<Campaign>): Campaign {
  const now = Date.now();
  return {
    id: uid(),
    name: "",
    description: "",
    setting: "",
    coverColor: "#4A5D78",
    status: "planning",
    dmId,
    players: [{ id: uid(), userId: dmId, name: "Dungeon Master", role: "dm", joinedAt: now }],
    sessions: [],
    notes: [],
    npcs: [],
    quests: [],
    locations: [],
    factions: [],
    worldLore: [],
    inviteCode: localInviteCode(),
    rules: {
      allowMulticlass: true,
      allowFeats: true,
      allowHomebrew: false,
      startingLevel: 1,
      statGeneration: "standard",
    },
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export function newSession(campaignId: string, number: number, overrides?: Partial<Session>): Session {
  const now = Date.now();
  return {
    id: uid(),
    campaignId,
    number,
    title: `Sesión ${number}`,
    status: "scheduled",
    summary: "",
    npcs: [],
    loot: "",
    xpAwarded: 0,
    decisions: [],
    date: new Date().toISOString().slice(0, 10),
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export function campaignToSummary(c: Campaign): CampaignSummary {
  const lastSession = c.sessions
    .filter(s => s.status === "completed")
    .sort((a, b) => b.createdAt - a.createdAt)[0];
  return {
    id: c.id,
    name: c.name || "Campaña sin nombre",
    setting: c.setting,
    coverColor: c.coverColor,
    status: c.status,
    playerCount: c.players.length,
    sessionCount: c.sessions.length,
    lastSessionAt: lastSession?.createdAt,
    createdAt: c.createdAt,
  };
}
