import { uid } from "@/lib/uid";
export type LocationType =
  | "city"
  | "town"
  | "village"
  | "dungeon"
  | "wilderness"
  | "fortress"
  | "ruin"
  | "temple"
  | "port"
  | "other";

export type LoreCategory =
  | "history"
  | "religion"
  | "magic"
  | "geography"
  | "politics"
  | "legend"
  | "other";

export interface MapPin {
  locationId: string;
  x: number;
  y: number;
}

export interface Location {
  id: string;
  campaignId: string;
  name: string;
  type: LocationType;
  description: string;
  climate?: string;
  government?: string;
  economy?: string;
  population?: string;
  npcIds: string[];
  questIds: string[];
  factionIds: string[];
  parentLocationId?: string;
  notes?: string;
  tags: string[];
  pin?: MapPin;
  createdAt: number;
  updatedAt: number;
}

export type FactionRelationType = "ally" | "neutral" | "hostile" | "at_war" | "vassal" | "overlord";

export interface FactionRelation {
  targetFactionId: string;
  type: FactionRelationType;
  notes?: string;
}

export interface Faction {
  id: string;
  campaignId: string;
  name: string;
  description: string;
  goals?: string;
  secrets?: string;
  symbol?: string;
  headquartersLocationId?: string;
  relations: FactionRelation[];
  playerReputation: number;
  locationIds: string[];
  npcIds: string[];
  tags: string[];
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface WorldLore {
  id: string;
  campaignId: string;
  title: string;
  content: string;
  category: LoreCategory;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export function newLocation(campaignId: string, overrides?: Partial<Location>): Location {
  const now = Date.now();
  return {
    id: uid(),
    campaignId,
    name: "",
    type: "other",
    description: "",
    npcIds: [],
    questIds: [],
    factionIds: [],
    tags: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export function newFaction(campaignId: string, overrides?: Partial<Faction>): Faction {
  const now = Date.now();
  return {
    id: uid(),
    campaignId,
    name: "",
    description: "",
    relations: [],
    playerReputation: 0,
    locationIds: [],
    npcIds: [],
    tags: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export function newWorldLore(campaignId: string, overrides?: Partial<WorldLore>): WorldLore {
  const now = Date.now();
  return {
    id: uid(),
    campaignId,
    title: "",
    content: "",
    category: "other",
    tags: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export const LOCATION_TYPE_LABEL: Record<LocationType, string> = {
  city: "Ciudad",
  town: "Pueblo",
  village: "Aldea",
  dungeon: "Mazmorra",
  wilderness: "Tierras salvajes",
  fortress: "Fortaleza",
  ruin: "Ruina",
  temple: "Templo",
  port: "Puerto",
  other: "Otro",
};

export const LOCATION_TYPE_ICON: Record<LocationType, string> = {
  city: "city",
  town: "home",
  village: "home",
  dungeon: "sword",
  wilderness: "tree",
  fortress: "shield",
  ruin: "scroll",
  temple: "star",
  port: "anchor",
  other: "map",
};

export const LORE_CATEGORY_LABEL: Record<LoreCategory, string> = {
  history: "Historia",
  religion: "Religión",
  magic: "Magia",
  geography: "Geografía",
  politics: "Política",
  legend: "Leyenda",
  other: "Otro",
};

export const FACTION_RELATION_LABEL: Record<FactionRelationType, string> = {
  ally: "Aliada",
  neutral: "Neutral",
  hostile: "Hostil",
  at_war: "En guerra",
  vassal: "Vasalla",
  overlord: "Dominante",
};
