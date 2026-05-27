import { newNPC } from "@/types/npc";
import type { NPC, NPCMemory, NPCRelation } from "@/types/npc";
import { cleanList } from "@/lib/utils";
import { uid } from "@/lib/uid";

export type NPCInput = Partial<NPC> & Pick<NPC, "name">;
export type NPCPatch = Partial<Omit<NPC, "id" | "campaignId" | "createdAt">>;

export function normalizeNPC(npc: NPC): NPC {
  return {
    ...npc,
    name: npc.name.trim(),
    race: npc.race?.trim(),
    archetype: npc.archetype?.trim(),
    occupation: npc.occupation?.trim(),
    location: npc.location?.trim(),
    affiliations: cleanList(npc.affiliations),
    relations: npc.relations ?? [],
    memory: npc.memory ?? [],
    sessionIds: cleanList(npc.sessionIds),
    tags: cleanList(npc.tags),
  };
}

export function createNPC(campaignId: string, data: NPCInput): NPC {
  return normalizeNPC(newNPC(campaignId, data));
}

export function saveNPC(npcs: NPC[], npc: NPC): NPC[] {
  const normalized = normalizeNPC(npc);
  const idx = npcs.findIndex(current => current.id === normalized.id);
  if (idx < 0) return [...npcs, normalized];
  return npcs.map(current => current.id === normalized.id ? normalized : current);
}

export function updateNPC(npcs: NPC[], npcId: string, patch: NPCPatch): NPC[] {
  const now = Date.now();
  return npcs.map(npc =>
    npc.id === npcId
      ? normalizeNPC({
          ...npc,
          ...patch,
          id: npc.id,
          campaignId: npc.campaignId,
          createdAt: npc.createdAt,
          updatedAt: now,
        })
      : npc,
  );
}

export function deleteNPC(npcs: NPC[], npcId: string): NPC[] {
  return npcs.filter(npc => npc.id !== npcId);
}

export function upsertNPCRelation(npc: NPC, relation: NPCRelation): NPC {
  const relations = npc.relations.some(current =>
    current.targetId === relation.targetId && current.targetType === relation.targetType
  )
    ? npc.relations.map(current =>
        current.targetId === relation.targetId && current.targetType === relation.targetType
          ? relation
          : current,
      )
    : [...npc.relations, relation];

  return { ...npc, relations, updatedAt: Date.now() };
}

export function removeNPCRelation(npc: NPC, targetId: string, targetType: NPCRelation["targetType"]): NPC {
  return {
    ...npc,
    relations: npc.relations.filter(relation => relation.targetId !== targetId || relation.targetType !== targetType),
    updatedAt: Date.now(),
  };
}

export function rememberNPC(npc: NPC, memory: Omit<NPCMemory, "id" | "createdAt"> & Partial<Pick<NPCMemory, "id" | "createdAt">>): NPC {
  const now = Date.now();
  return {
    ...npc,
    memory: [
      ...npc.memory,
      {
        id: memory.id ?? uid(),
        text: memory.text.trim(),
        sessionId: memory.sessionId,
        createdAt: memory.createdAt ?? now,
      },
    ],
    updatedAt: now,
  };
}
