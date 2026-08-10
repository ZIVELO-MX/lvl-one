import type { Campaign, CampaignStatus, CampaignRules, Session, CampaignPlayer } from "@/types/campaign";
import type { NPC } from "@/types/npc";
import type { Quest } from "@/types/quest";
import type { Location, Faction, WorldLore } from "@/types/world";

interface SnakeCampaign {
  id: string;
  dm_id: string;
  name: string;
  description: string;
  cover_image: string | null;
  setting: string;
  cover_color: string;
  status: string;
  invite_code: string | null;
  rules: CampaignRules | null;
  created_at: string;
  updated_at: string;
}

function toSnake(c: Partial<Campaign>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (c.name !== undefined) out.name = c.name;
  if (c.description !== undefined) out.description = c.description;
  if (c.setting !== undefined) out.setting = c.setting;
  if (c.coverColor !== undefined) out.cover_color = c.coverColor;
  if (c.coverImage !== undefined) out.cover_image = c.coverImage;
  if (c.status !== undefined) out.status = c.status;
  if (c.rules !== undefined) out.rules = c.rules;
  if (c.inviteCode !== undefined) out.invite_code = c.inviteCode;
  return out;
}

function toCamel(data: SnakeCampaign): Partial<Campaign> {
  return {
    id: data.id,
    dmId: data.dm_id,
    name: data.name,
    description: data.description ?? "",
    coverImage: data.cover_image ?? undefined,
    setting: data.setting ?? "",
    coverColor: data.cover_color,
    status: data.status as CampaignStatus,
    inviteCode: data.invite_code ?? undefined,
    rules: data.rules ?? {
      allowMulticlass: true,
      allowFeats: true,
      allowHomebrew: false,
      startingLevel: 1,
      statGeneration: "standard",
    },
    createdAt: new Date(data.created_at).getTime(),
    updatedAt: new Date(data.updated_at).getTime(),
  };
}

function headers() {
  return { "Content-Type": "application/json" };
}

export async function fetchCampaigns(): Promise<Partial<Campaign>[]> {
  const res = await fetch("/api/campaigns");
  if (!res.ok) throw new Error("Failed to fetch campaigns");
  const data: SnakeCampaign[] = await res.json();
  return data.map(toCamel);
}

export async function createCampaign(partial: Partial<Campaign>): Promise<Partial<Campaign>> {
  const res = await fetch("/api/campaigns", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(toSnake(partial)),
  });
  if (!res.ok) throw new Error("Failed to create campaign");
  const data: SnakeCampaign = await res.json();
  return toCamel(data);
}

export async function updateCampaign(id: string, patch: Partial<Campaign>): Promise<Partial<Campaign>> {
  const res = await fetch(`/api/campaigns/${id}`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify(toSnake(patch)),
  });
  if (!res.ok) throw new Error("Failed to update campaign");
  const data: SnakeCampaign = await res.json();
  return toCamel(data);
}

export async function deleteCampaignFromAPI(id: string): Promise<void> {
  const res = await fetch(`/api/campaigns/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete campaign");
}

export async function fetchNPCs(campaignId: string): Promise<NPC[]> {
  const res = await fetch(`/api/campaigns/${campaignId}/npcs`);
  if (!res.ok) throw new Error("Failed to fetch NPCs");
  return res.json();
}

export async function fetchSessions(campaignId: string): Promise<Session[]> {
  const res = await fetch(`/api/campaigns/${campaignId}/sessions`);
  if (!res.ok) throw new Error("Failed to fetch sessions");
  return res.json();
}

export async function fetchQuests(campaignId: string): Promise<Quest[]> {
  const res = await fetch(`/api/campaigns/${campaignId}/quests`);
  if (!res.ok) throw new Error("Failed to fetch quests");
  return res.json();
}

export async function fetchPlayers(campaignId: string): Promise<CampaignPlayer[]> {
  const res = await fetch(`/api/campaigns/${campaignId}/players`);
  if (!res.ok) throw new Error("Failed to fetch players");
  return res.json();
}

export async function fetchWorldData(campaignId: string): Promise<{ locations: Location[]; factions: Faction[] }> {
  const res = await fetch(`/api/campaigns/${campaignId}/world`);
  if (!res.ok) throw new Error("Failed to fetch world data");
  return res.json();
}

export async function fetchWorldLore(campaignId: string): Promise<WorldLore[]> {
  const res = await fetch(`/api/campaigns/${campaignId}/lore`);
  if (!res.ok) throw new Error("Failed to fetch lore");
  return res.json();
}

// ── NPCs ──────────────────────────────────────────────────────

export async function createNPC(campaignId: string, npc: Partial<NPC>) {
  const res = await fetch(`/api/campaigns/${campaignId}/npcs`, {
    method: "POST", headers: headers(), body: JSON.stringify(npc),
  });
  if (!res.ok) throw new Error("Failed to create NPC");
  return res.json();
}

export async function updateNPC(campaignId: string, npcId: string, patch: Partial<NPC>) {
  const res = await fetch(`/api/campaigns/${campaignId}/npcs/${npcId}`, {
    method: "PATCH", headers: headers(), body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error("Failed to update NPC");
  return res.json();
}

export async function deleteNPCFromAPI(campaignId: string, npcId: string) {
  const res = await fetch(`/api/campaigns/${campaignId}/npcs/${npcId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete NPC");
}

// ── Sessions ──────────────────────────────────────────────────

export async function createSession(campaignId: string, session: Partial<Session>) {
  const res = await fetch(`/api/campaigns/${campaignId}/sessions`, {
    method: "POST", headers: headers(), body: JSON.stringify(session),
  });
  if (!res.ok) throw new Error("Failed to create session");
  return res.json();
}

export async function updateSessionAPI(campaignId: string, sessionId: string, patch: Partial<Session>) {
  const res = await fetch(`/api/campaigns/${campaignId}/sessions/${sessionId}`, {
    method: "PATCH", headers: headers(), body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error("Failed to update session");
  return res.json();
}

export async function deleteSessionFromAPI(campaignId: string, sessionId: string) {
  const res = await fetch(`/api/campaigns/${campaignId}/sessions/${sessionId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete session");
}

// ── Quests ────────────────────────────────────────────────────

export async function createQuest(campaignId: string, quest: Partial<Quest>) {
  const res = await fetch(`/api/campaigns/${campaignId}/quests`, {
    method: "POST", headers: headers(), body: JSON.stringify(quest),
  });
  if (!res.ok) throw new Error("Failed to create quest");
  return res.json();
}

export async function updateQuestAPI(campaignId: string, questId: string, patch: Partial<Quest>) {
  const res = await fetch(`/api/campaigns/${campaignId}/quests/${questId}`, {
    method: "PATCH", headers: headers(), body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error("Failed to update quest");
  return res.json();
}

export async function deleteQuestFromAPI(campaignId: string, questId: string) {
  const res = await fetch(`/api/campaigns/${campaignId}/quests/${questId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete quest");
}

// ── Locations ─────────────────────────────────────────────────

export async function createLocation(campaignId: string, location: Partial<Location>) {
  const res = await fetch(`/api/campaigns/${campaignId}/world`, {
    method: "POST", headers: headers(), body: JSON.stringify({ ...location, type: "location" }),
  });
  if (!res.ok) throw new Error("Failed to create location");
  return res.json();
}

export async function updateLocationAPI(campaignId: string, locationId: string, patch: Partial<Location>) {
  const res = await fetch(`/api/campaigns/${campaignId}/locations/${locationId}`, {
    method: "PATCH", headers: headers(), body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error("Failed to update location");
  return res.json();
}

export async function deleteLocationFromAPI(campaignId: string, locationId: string) {
  const res = await fetch(`/api/campaigns/${campaignId}/locations/${locationId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete location");
}

// ── Factions ──────────────────────────────────────────────────

export async function createFaction(campaignId: string, faction: Partial<Faction>) {
  const res = await fetch(`/api/campaigns/${campaignId}/world`, {
    method: "POST", headers: headers(), body: JSON.stringify({ ...faction, type: "faction" }),
  });
  if (!res.ok) throw new Error("Failed to create faction");
  return res.json();
}

export async function updateFactionAPI(campaignId: string, factionId: string, patch: Partial<Faction>) {
  const res = await fetch(`/api/campaigns/${campaignId}/factions/${factionId}`, {
    method: "PATCH", headers: headers(), body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error("Failed to update faction");
  return res.json();
}

export async function deleteFactionFromAPI(campaignId: string, factionId: string) {
  const res = await fetch(`/api/campaigns/${campaignId}/factions/${factionId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete faction");
}

// ── Players ───────────────────────────────────────────────────

export async function addCampaignPlayer(campaignId: string, player: Partial<CampaignPlayer>) {
  const res = await fetch(`/api/campaigns/${campaignId}/players`, {
    method: "POST", headers: headers(), body: JSON.stringify(player),
  });
  if (!res.ok) throw new Error("Failed to add player");
  return res.json();
}

export async function updateCampaignPlayer(campaignId: string, playerId: string, patch: Partial<CampaignPlayer>) {
  const res = await fetch(`/api/campaigns/${campaignId}/players/${playerId}`, {
    method: "PATCH", headers: headers(), body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error("Failed to update player");
  return res.json();
}

export async function removeCampaignPlayer(campaignId: string, playerId: string) {
  const res = await fetch(`/api/campaigns/${campaignId}/players/${playerId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to remove player");
}
