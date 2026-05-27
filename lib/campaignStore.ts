import { newCampaign, newSession } from "@/types/campaign";
import type { Campaign, CampaignPlayer, Session } from "@/types/campaign";

const INVITE_CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
export type CampaignPlayerInput = Omit<CampaignPlayer, "joinedAt"> & { joinedAt?: number };

function randomIndex(max: number) {
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const bytes = new Uint8Array(1);
    crypto.getRandomValues(bytes);
    return bytes[0] % max;
  }

  return Math.floor(Math.random() * max);
}

export function generateInviteCode() {
  return Array.from({ length: 8 }, () => INVITE_CODE_CHARS[randomIndex(INVITE_CODE_CHARS.length)]).join("");
}

export function createCampaign(name: string, dmId: string, overrides: Partial<Campaign> = {}): Campaign {
  return newCampaign(dmId, {
    name: name.trim() || "Campaña sin nombre",
    inviteCode: generateInviteCode(),
    ...overrides,
  });
}

export function addSession(campaignId: string, data: Partial<Session> = {}): Session {
  return newSession(campaignId, data.number ?? 1, data);
}

export function updateSession(session: Session, patch: Partial<Session>): Session {
  return {
    ...session,
    ...patch,
    id: session.id,
    campaignId: session.campaignId,
    createdAt: session.createdAt,
    updatedAt: Date.now(),
  };
}

export function addPlayer(campaign: Campaign, player: CampaignPlayerInput): Campaign {
  const normalizedPlayer: CampaignPlayer = {
    ...player,
    joinedAt: player.joinedAt ?? Date.now(),
  };
  const duplicate = campaign.players.some(existing => {
    if (normalizedPlayer.userId && existing.userId) return existing.userId === normalizedPlayer.userId;
    return existing.id === normalizedPlayer.id;
  });

  if (duplicate) return campaign;

  return {
    ...campaign,
    players: [...campaign.players, normalizedPlayer],
    updatedAt: Date.now(),
  };
}
