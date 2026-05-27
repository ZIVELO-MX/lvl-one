import type { Faction, FactionRelation, Location, MapPin, WorldLore } from "@/types/world";
import { cleanList } from "@/lib/utils";

function cleanText(value: string | undefined) {
  const cleaned = value?.trim();
  return cleaned || undefined;
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value));
}

export function normalizeLocation(location: Location): Location {
  return {
    ...location,
    name: location.name.trim(),
    description: location.description.trim(),
    climate: cleanText(location.climate),
    government: cleanText(location.government),
    economy: cleanText(location.economy),
    population: cleanText(location.population),
    npcIds: cleanList(location.npcIds),
    questIds: cleanList(location.questIds),
    factionIds: cleanList(location.factionIds),
    parentLocationId: cleanText(location.parentLocationId),
    notes: cleanText(location.notes),
    tags: cleanList(location.tags),
    pin: location.pin
      ? { locationId: location.id, x: clampPercent(location.pin.x), y: clampPercent(location.pin.y) }
      : undefined,
  };
}

export function normalizeFaction(faction: Faction): Faction {
  const seenRelations = new Set<string>();
  const relations = faction.relations.filter(relation => {
    if (!relation.targetFactionId || seenRelations.has(relation.targetFactionId)) return false;
    seenRelations.add(relation.targetFactionId);
    return true;
  });

  return {
    ...faction,
    name: faction.name.trim(),
    description: faction.description.trim(),
    goals: cleanText(faction.goals),
    secrets: cleanText(faction.secrets),
    symbol: cleanText(faction.symbol),
    headquartersLocationId: cleanText(faction.headquartersLocationId),
    relations,
    playerReputation: Math.max(-5, Math.min(5, faction.playerReputation)),
    locationIds: cleanList(faction.locationIds),
    npcIds: cleanList(faction.npcIds),
    tags: cleanList(faction.tags),
    notes: cleanText(faction.notes),
  };
}

export function normalizeWorldLore(lore: WorldLore): WorldLore {
  return {
    ...lore,
    title: lore.title.trim(),
    content: lore.content.trim(),
    tags: cleanList(lore.tags),
  };
}

export function saveLocation(locations: Location[], location: Location): Location[] {
  const normalized = normalizeLocation(location);
  const idx = locations.findIndex(current => current.id === normalized.id);
  if (idx < 0) return [...locations, normalized];
  return locations.map(current => current.id === normalized.id ? normalized : current);
}

export function deleteLocation(locations: Location[], id: string): Location[] {
  return locations.filter(location => location.id !== id);
}

export function saveFaction(factions: Faction[], faction: Faction): Faction[] {
  const normalized = normalizeFaction(faction);
  const idx = factions.findIndex(current => current.id === normalized.id);
  if (idx < 0) return [...factions, normalized];
  return factions.map(current => current.id === normalized.id ? normalized : current);
}

export function deleteFaction(factions: Faction[], id: string): Faction[] {
  return factions.filter(faction => faction.id !== id);
}

export function saveWorldLore(lores: WorldLore[], lore: WorldLore): WorldLore[] {
  const normalized = normalizeWorldLore(lore);
  const idx = lores.findIndex(current => current.id === normalized.id);
  if (idx < 0) return [...lores, normalized];
  return lores.map(current => current.id === normalized.id ? normalized : current);
}

export function deleteWorldLore(lores: WorldLore[], id: string): WorldLore[] {
  return lores.filter(lore => lore.id !== id);
}

export function upsertFactionRelation(faction: Faction, relation: FactionRelation): Faction {
  const relations = faction.relations.some(current => current.targetFactionId === relation.targetFactionId)
    ? faction.relations.map(current => current.targetFactionId === relation.targetFactionId ? relation : current)
    : [...faction.relations, relation];

  return normalizeFaction({ ...faction, relations, updatedAt: Date.now() });
}

export function removeFactionRelation(faction: Faction, targetId: string): Faction {
  return {
    ...faction,
    relations: faction.relations.filter(relation => relation.targetFactionId !== targetId),
    updatedAt: Date.now(),
  };
}

export function setLocationPin(locations: Location[], locationId: string, pin: Omit<MapPin, "locationId">): Location[] {
  return locations.map(location =>
    location.id === locationId
      ? normalizeLocation({
          ...location,
          pin: {
            locationId,
            x: pin.x,
            y: pin.y,
          },
          updatedAt: Date.now(),
        })
      : location,
  );
}
