import { BACKGROUNDS } from "@/data/backgrounds";
import { CLASSES } from "@/data/classes";
import { RACES } from "@/data/races";
import { SUBCLASSES } from "@/data/subclasses";
import { SUBRACES } from "@/data/subraces";
import type { Campaign, CampaignDecision, CampaignNote, CampaignPlayer, CampaignRules, Session } from "@/types/campaign";
import type { Character, CharacterDraft, CharacterStatus, ASI, StatKey } from "@/types/character";
import { STAT_KEYS, hpForLevel, modOf, proficiencyBonusForLevel } from "@/types/character";
import type { ModuleProgress } from "@/types/learning";
import type { NPC, NPCMemory, NPCRelation } from "@/types/npc";
import type { Quest, QuestObjective } from "@/types/quest";
import type { Faction, FactionRelation, Location, MapPin, WorldLore } from "@/types/world";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type DbTimestamp = string | number;

export interface ApiError {
  code: string;
  message: string;
  details?: Json;
}

export type ApiResponse<T> =
  | { ok: true; data: T; error: null }
  | { ok: false; data: null; error: ApiError };

export type ApiListResponse<T> = ApiResponse<T[]>;

export interface DbCampaignPlayer {
  id: string;
  user_id?: string | null;
  name: string;
  role: CampaignPlayer["role"];
  character_id?: string | null;
  joined_at: DbTimestamp;
}

export interface DbCampaignNote {
  id: string;
  title: string;
  content: string;
  is_dm_only: boolean;
  created_at: DbTimestamp;
  updated_at: DbTimestamp;
}

export interface DbCampaignDecision {
  id: string;
  description: string;
  session_id: string;
  made_by?: string | null;
  consequences?: string | null;
  created_at: DbTimestamp;
}

export interface DbCharacter {
  id: string;
  user_id?: string | null;
  name: string;
  race_id: string | null;
  subrace_id: string | null;
  class_id: string | null;
  subclass_id: string | null;
  background_id: string | null;
  base_stats: Partial<Record<StatKey, number>> | null;
  selected_skills: string[] | null;
  alignment: string;
  story: string;
  ideals: string;
  bonds: string;
  flaws: string;
  level: number;
  age: string;
  status: CharacterStatus;
  concept_id: string | null;
  stats_method: CharacterDraft["statsMethod"];
  equipment: string[] | null;
  equipped_items?: string[] | null;
  spells: string[] | null;
  feats?: string[] | null;
  hp_current?: number | null;
  hp_temp?: number | null;
  gold?: number | null;
  silver?: number | null;
  copper?: number | null;
  platinum?: number | null;
  spell_slots_used?: Record<number, number> | null;
  gender?: CharacterDraft["gender"] | null;
  asi_bonuses?: Partial<Record<StatKey, number>> | null;
  created_at: DbTimestamp;
  updated_at: DbTimestamp;
}

export interface DbCampaign {
  id: string;
  dm_id: string;
  name: string;
  description: string;
  cover_image?: string | null;
  setting: string;
  cover_color: string;
  status: Campaign["status"];
  players: DbCampaignPlayer[] | null;
  sessions: DbSession[] | null;
  notes: DbCampaignNote[] | null;
  npcs: DbNPC[] | null;
  quests: DbQuest[] | null;
  locations: DbWorldLocation[] | null;
  factions: DbFaction[] | null;
  world_lore: DbWorldLore[] | null;
  invite_code?: string | null;
  rules: CampaignRules | null;
  created_at: DbTimestamp;
  updated_at: DbTimestamp;
}

export interface DbSession {
  id: string;
  campaign_id: string;
  number: number;
  title: string;
  status: Session["status"];
  summary: string;
  npcs: string[] | null;
  npcs_encountered?: string[] | null;
  loot: string;
  loot_obtained?: string[] | null;
  xp_awarded: number;
  quests_started?: string[] | null;
  quests_completed?: string[] | null;
  deaths?: number | null;
  key_decisions?: string | null;
  decisions: DbCampaignDecision[] | null;
  date: string;
  created_at: DbTimestamp;
  updated_at: DbTimestamp;
}

export interface DbNPC {
  id: string;
  campaign_id: string;
  name: string;
  race?: string | null;
  archetype?: string | null;
  occupation?: string | null;
  location?: string | null;
  alignment?: NPC["alignment"] | null;
  disposition: NPC["disposition"];
  appearance?: string | null;
  personality?: string | null;
  ideals?: string | null;
  bonds?: string | null;
  flaws?: string | null;
  secrets?: string | null;
  backstory?: string | null;
  notes?: string | null;
  affiliations: string[] | null;
  relations: NPCRelation[] | null;
  memory: DbNPCMemory[] | null;
  session_ids: string[] | null;
  tags: string[] | null;
  armor_class?: number | null;
  hit_points?: number | null;
  challenge_rating?: number | null;
  is_alive: boolean;
  created_at: DbTimestamp;
  updated_at: DbTimestamp;
}

export interface DbNPCMemory {
  id: string;
  text: string;
  session_id?: string | null;
  created_at: DbTimestamp;
}

export interface DbQuest {
  id: string;
  campaign_id: string;
  title: string;
  type: Quest["type"];
  status: Quest["status"];
  description: string;
  objectives: DbQuestObjective[] | null;
  reward: string;
  consequences: string;
  quest_giver_id?: string | null;
  related_npc_ids: string[] | null;
  time_limit?: string | null;
  notes: string;
  completed_session_id?: string | null;
  created_at: DbTimestamp;
  updated_at: DbTimestamp;
}

export interface DbQuestObjective {
  id: string;
  description: string;
  completed: boolean;
  completed_at?: DbTimestamp | null;
}

export interface DbWorldLocation {
  id: string;
  campaign_id: string;
  name: string;
  type: Location["type"];
  description: string;
  climate?: string | null;
  government?: string | null;
  economy?: string | null;
  population?: string | null;
  npc_ids: string[] | null;
  quest_ids: string[] | null;
  faction_ids: string[] | null;
  parent_location_id?: string | null;
  notes?: string | null;
  tags: string[] | null;
  pin?: MapPin | null;
  created_at: DbTimestamp;
  updated_at: DbTimestamp;
}

export interface DbFaction {
  id: string;
  campaign_id: string;
  name: string;
  description: string;
  goals?: string | null;
  secrets?: string | null;
  symbol?: string | null;
  headquarters_location_id?: string | null;
  relations: FactionRelation[] | null;
  player_reputation: number;
  location_ids: string[] | null;
  npc_ids: string[] | null;
  tags: string[] | null;
  notes?: string | null;
  created_at: DbTimestamp;
  updated_at: DbTimestamp;
}

export interface DbWorldLore {
  id: string;
  campaign_id: string;
  title: string;
  content: string;
  category: WorldLore["category"];
  tags: string[] | null;
  created_at: DbTimestamp;
  updated_at: DbTimestamp;
}

export interface CampaignMap {
  id: string;
  campaignId: string;
  name: string;
  imageUrl?: string;
  pins: MapPin[];
  isPublic: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface DbMap {
  id: string;
  campaign_id: string;
  name: string;
  image_url?: string | null;
  pins: MapPin[] | null;
  is_public: boolean;
  created_at: DbTimestamp;
  updated_at: DbTimestamp;
}

export interface DbModuleProgress {
  id?: string;
  user_id: string;
  module_id: string;
  pct: number;
  completed_lessons: string[] | null;
  created_at?: DbTimestamp;
  updated_at?: DbTimestamp;
}

type SupabaseTable<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      characters: SupabaseTable<DbCharacter>;
      campaigns: SupabaseTable<DbCampaign>;
      sessions: SupabaseTable<DbSession>;
      npcs: SupabaseTable<DbNPC>;
      quests: SupabaseTable<DbQuest>;
      world_locations: SupabaseTable<DbWorldLocation>;
      factions: SupabaseTable<DbFaction>;
      maps: SupabaseTable<DbMap>;
      modules_progress: SupabaseTable<DbModuleProgress>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type SupabaseTableName = keyof Database["public"]["Tables"];
export type SupabaseRow<T extends SupabaseTableName> = Database["public"]["Tables"][T]["Row"];
export type SupabaseInsert<T extends SupabaseTableName> = Database["public"]["Tables"][T]["Insert"];
export type SupabaseUpdate<T extends SupabaseTableName> = Database["public"]["Tables"][T]["Update"];

export function stripUndefined<T extends object>(value: T): Partial<T> {
  const entries = Object.entries(value as Record<string, unknown>).filter(([, item]) => item !== undefined);
  return Object.fromEntries(entries) as Partial<T>;
}

function toMillis(value: DbTimestamp | null | undefined): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function toIso(value: number | undefined): string | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  return new Date(value).toISOString();
}

function listOf<T>(value: T[] | null | undefined): T[] {
  return value ? [...value] : [];
}

function maybeString(value: string | null | undefined): string | undefined {
  return value ?? undefined;
}

function defaultCampaignRules(): CampaignRules {
  return {
    allowMulticlass: true,
    allowFeats: true,
    allowHomebrew: false,
    startingLevel: 1,
    statGeneration: "standard",
  };
}

function hydrateCharacter(draft: CharacterDraft): Character {
  const race = RACES.find(raceOption => raceOption.id === draft.raceId);
  const subrace = SUBRACES.find(subraceOption => subraceOption.id === draft.subraceId);
  const cls = CLASSES.find(classOption => classOption.id === draft.classId);
  const subclass = SUBCLASSES.find(subclassOption => subclassOption.id === draft.subclassId);
  const background = BACKGROUNDS.find(backgroundOption => backgroundOption.id === draft.backgroundId);
  const stats = {} as Record<StatKey, number>;
  const mods = {} as Record<StatKey, number>;

  STAT_KEYS.forEach(key => {
    const base = draft.baseStats[key] ?? 10;
    const raceAsi = race?.asi ?? {};
    const subraceAsi = subrace?.asi ?? {};
    stats[key] = base
      + (raceAsi.all ?? 0)
      + (raceAsi[key] ?? 0)
      + (subraceAsi.all ?? 0)
      + (subraceAsi[key] ?? 0)
      + (draft.asiBonuses?.[key] ?? 0);
    mods[key] = modOf(stats[key]);
  });

  const choiceSources: ASI[] = [race?.asi, subrace?.asi].filter((source): source is ASI => Boolean(source?.choices));
  for (const source of choiceSources) {
    for (const choice of source.choices ?? []) {
      const eligible = choice.from ? STAT_KEYS.filter(key => choice.from!.includes(key)) : [...STAT_KEYS];
      const existing = eligible.filter(key => (draft.asiBonuses?.[key] ?? 0) > 0);
      const toAssign = Math.max(0, choice.choose - existing.length);
      let assigned = 0;

      for (const key of eligible) {
        if (assigned >= toAssign) break;
        if ((draft.asiBonuses?.[key] ?? 0) === 0) {
          stats[key] += choice.amount;
          mods[key] = modOf(stats[key]);
          assigned += 1;
        }
      }
    }
  }

  const conMod = modOf(stats.CON ?? 10);
  const dexMod = modOf(stats.DES ?? 10);
  const wisMod = modOf(stats.SAB ?? 10);
  const hitDie = cls ? Number.parseInt(cls.hit.slice(1), 10) : 8;
  const level = Math.max(1, draft.level ?? 1);
  const hp = hpForLevel(hitDie, conMod, level);
  const proficiencyBonus = proficiencyBonusForLevel(level);
  const ac = (() => {
    switch (cls?.id) {
      case "fighter":
      case "paladin":
        return 18;
      case "cleric":
        return 16 + Math.min(dexMod, 2);
      case "barbarian":
        return 10 + dexMod + conMod;
      case "monk":
        return 10 + dexMod + wisMod;
      case "druid":
        return 13 + dexMod;
      case "ranger":
        return 14 + Math.min(dexMod, 2);
      case "bard":
      case "rogue":
      case "warlock":
        return 11 + dexMod;
      default:
        return 10 + dexMod;
    }
  })();

  const inheritedSpells = [...(draft.spells ?? [])];
  for (const spell of subrace?.spells ?? []) {
    if (!inheritedSpells.includes(spell)) inheritedSpells.push(spell);
  }
  for (const spell of subclass?.spells ?? []) {
    if (!inheritedSpells.includes(spell)) inheritedSpells.push(spell);
  }

  return {
    ...draft,
    race,
    subrace,
    class: cls,
    subclass,
    background,
    stats,
    mods,
    hp,
    ac,
    initiative: dexMod,
    proficiencyBonus,
    spells: inheritedSpells,
  };
}

export function toCharacter(db: DbCharacter): Character {
  const draft: CharacterDraft = {
    id: db.id,
    name: db.name,
    raceId: db.race_id,
    subraceId: db.subrace_id,
    classId: db.class_id,
    subclassId: db.subclass_id,
    backgroundId: db.background_id,
    baseStats: db.base_stats ?? {},
    selectedSkills: listOf(db.selected_skills),
    alignment: db.alignment,
    story: db.story,
    ideals: db.ideals,
    bonds: db.bonds,
    flaws: db.flaws,
    level: db.level,
    age: db.age,
    status: db.status,
    conceptId: db.concept_id,
    statsMethod: db.stats_method,
    equipment: listOf(db.equipment),
    equippedItems: listOf(db.equipped_items),
    spells: listOf(db.spells),
    hpCurrent: db.hp_current ?? undefined,
    hpTemp: db.hp_temp ?? undefined,
    gold: db.gold ?? undefined,
    silver: db.silver ?? undefined,
    copper: db.copper ?? undefined,
    platinum: db.platinum ?? undefined,
    spellSlotsUsed: db.spell_slots_used ?? undefined,
    gender: db.gender ?? undefined,
    asiBonuses: db.asi_bonuses ?? undefined,
    createdAt: toMillis(db.created_at),
    updatedAt: toMillis(db.updated_at),
  };
  const character = hydrateCharacter(draft) as Character & { feats?: string[] };
  if (db.feats) character.feats = [...db.feats];
  return character;
}

export function fromCharacter(character: Character): Partial<DbCharacter> {
  const withFeats = character as Character & { feats?: string[] };
  return stripUndefined({
    id: character.id,
    name: character.name,
    race_id: character.raceId,
    subrace_id: character.subraceId,
    class_id: character.classId,
    subclass_id: character.subclassId,
    background_id: character.backgroundId,
    base_stats: character.baseStats,
    selected_skills: character.selectedSkills,
    alignment: character.alignment,
    story: character.story,
    ideals: character.ideals,
    bonds: character.bonds,
    flaws: character.flaws,
    level: character.level,
    age: character.age,
    status: character.status,
    concept_id: character.conceptId,
    stats_method: character.statsMethod,
    equipment: character.equipment,
    equipped_items: character.equippedItems,
    spells: character.spells,
    feats: withFeats.feats,
    hp_current: character.hpCurrent,
    hp_temp: character.hpTemp,
    gold: character.gold,
    silver: character.silver,
    copper: character.copper,
    platinum: character.platinum,
    spell_slots_used: character.spellSlotsUsed,
    gender: character.gender,
    asi_bonuses: character.asiBonuses,
    created_at: toIso(character.createdAt),
    updated_at: toIso(character.updatedAt),
  });
}

export function toCampaignPlayer(db: DbCampaignPlayer): CampaignPlayer {
  return stripUndefined({
    id: db.id,
    userId: maybeString(db.user_id),
    name: db.name,
    role: db.role,
    characterId: maybeString(db.character_id),
    joinedAt: toMillis(db.joined_at),
  }) as CampaignPlayer;
}

export function fromCampaignPlayer(player: CampaignPlayer): Partial<DbCampaignPlayer> {
  return stripUndefined({
    id: player.id,
    user_id: player.userId,
    name: player.name,
    role: player.role,
    character_id: player.characterId,
    joined_at: toIso(player.joinedAt),
  });
}

export function toCampaignNote(db: DbCampaignNote): CampaignNote {
  return {
    id: db.id,
    title: db.title,
    content: db.content,
    isDmOnly: db.is_dm_only,
    createdAt: toMillis(db.created_at),
    updatedAt: toMillis(db.updated_at),
  };
}

export function fromCampaignNote(note: CampaignNote): Partial<DbCampaignNote> {
  return stripUndefined({
    id: note.id,
    title: note.title,
    content: note.content,
    is_dm_only: note.isDmOnly,
    created_at: toIso(note.createdAt),
    updated_at: toIso(note.updatedAt),
  });
}

export function toCampaignDecision(db: DbCampaignDecision): CampaignDecision {
  return stripUndefined({
    id: db.id,
    description: db.description,
    sessionId: db.session_id,
    madeBy: maybeString(db.made_by),
    consequences: maybeString(db.consequences),
    createdAt: toMillis(db.created_at),
  }) as CampaignDecision;
}

export function fromCampaignDecision(decision: CampaignDecision): Partial<DbCampaignDecision> {
  return stripUndefined({
    id: decision.id,
    description: decision.description,
    session_id: decision.sessionId,
    made_by: decision.madeBy,
    consequences: decision.consequences,
    created_at: toIso(decision.createdAt),
  });
}

export function toCampaign(db: DbCampaign): Campaign {
  return stripUndefined({
    id: db.id,
    name: db.name,
    description: db.description,
    coverImage: maybeString(db.cover_image),
    setting: db.setting,
    coverColor: db.cover_color,
    status: db.status,
    dmId: db.dm_id,
    players: listOf(db.players).map(toCampaignPlayer),
    sessions: listOf(db.sessions).map(toSession),
    notes: listOf(db.notes).map(toCampaignNote),
    npcs: listOf(db.npcs).map(toNPC),
    quests: listOf(db.quests).map(toQuest),
    locations: listOf(db.locations).map(toWorldLocation),
    factions: listOf(db.factions).map(toFaction),
    worldLore: listOf(db.world_lore).map(toWorldLore),
    inviteCode: maybeString(db.invite_code),
    rules: db.rules ?? defaultCampaignRules(),
    createdAt: toMillis(db.created_at),
    updatedAt: toMillis(db.updated_at),
  }) as Campaign;
}

export function fromCampaign(campaign: Campaign): Partial<DbCampaign> {
  return stripUndefined({
    id: campaign.id,
    dm_id: campaign.dmId,
    name: campaign.name,
    description: campaign.description,
    cover_image: campaign.coverImage,
    setting: campaign.setting,
    cover_color: campaign.coverColor,
    status: campaign.status,
    players: campaign.players.map(player => fromCampaignPlayer(player) as DbCampaignPlayer),
    sessions: campaign.sessions.map(session => fromSession(session) as DbSession),
    notes: campaign.notes.map(note => fromCampaignNote(note) as DbCampaignNote),
    npcs: campaign.npcs.map(npc => fromNPC(npc) as DbNPC),
    quests: campaign.quests.map(quest => fromQuest(quest) as DbQuest),
    locations: campaign.locations.map(location => fromWorldLocation(location) as DbWorldLocation),
    factions: campaign.factions.map(faction => fromFaction(faction) as DbFaction),
    world_lore: campaign.worldLore.map(lore => fromWorldLore(lore) as DbWorldLore),
    invite_code: campaign.inviteCode,
    rules: campaign.rules,
    created_at: toIso(campaign.createdAt),
    updated_at: toIso(campaign.updatedAt),
  });
}

export function toSession(db: DbSession): Session {
  return stripUndefined({
    id: db.id,
    campaignId: db.campaign_id,
    number: db.number,
    title: db.title,
    status: db.status,
    summary: db.summary,
    npcs: listOf(db.npcs),
    npcsEncountered: db.npcs_encountered ? listOf(db.npcs_encountered) : undefined,
    loot: db.loot,
    lootObtained: db.loot_obtained ? listOf(db.loot_obtained) : undefined,
    xpAwarded: db.xp_awarded,
    questsStarted: db.quests_started ? listOf(db.quests_started) : undefined,
    questsCompleted: db.quests_completed ? listOf(db.quests_completed) : undefined,
    deaths: db.deaths ?? undefined,
    keyDecisions: maybeString(db.key_decisions),
    decisions: listOf(db.decisions).map(toCampaignDecision),
    date: db.date,
    createdAt: toMillis(db.created_at),
    updatedAt: toMillis(db.updated_at),
  }) as Session;
}

export function fromSession(session: Session): Partial<DbSession> {
  return stripUndefined({
    id: session.id,
    campaign_id: session.campaignId,
    number: session.number,
    title: session.title,
    status: session.status,
    summary: session.summary,
    npcs: session.npcs,
    npcs_encountered: session.npcsEncountered,
    loot: session.loot,
    loot_obtained: session.lootObtained,
    xp_awarded: session.xpAwarded,
    quests_started: session.questsStarted,
    quests_completed: session.questsCompleted,
    deaths: session.deaths,
    key_decisions: session.keyDecisions,
    decisions: session.decisions.map(decision => fromCampaignDecision(decision) as DbCampaignDecision),
    date: session.date,
    created_at: toIso(session.createdAt),
    updated_at: toIso(session.updatedAt),
  });
}

export function toNPC(db: DbNPC): NPC {
  return stripUndefined({
    id: db.id,
    campaignId: db.campaign_id,
    name: db.name,
    race: maybeString(db.race),
    archetype: maybeString(db.archetype),
    occupation: maybeString(db.occupation),
    location: maybeString(db.location),
    alignment: db.alignment ?? undefined,
    disposition: db.disposition,
    appearance: maybeString(db.appearance),
    personality: maybeString(db.personality),
    ideals: maybeString(db.ideals),
    bonds: maybeString(db.bonds),
    flaws: maybeString(db.flaws),
    secrets: maybeString(db.secrets),
    backstory: maybeString(db.backstory),
    notes: maybeString(db.notes),
    affiliations: listOf(db.affiliations),
    relations: listOf(db.relations),
    memory: listOf(db.memory).map(toNPCMemory),
    sessionIds: listOf(db.session_ids),
    tags: listOf(db.tags),
    armorClass: db.armor_class ?? undefined,
    hitPoints: db.hit_points ?? undefined,
    challengeRating: db.challenge_rating ?? undefined,
    isAlive: db.is_alive,
    createdAt: toMillis(db.created_at),
    updatedAt: toMillis(db.updated_at),
  }) as NPC;
}

export function fromNPC(npc: NPC): Partial<DbNPC> {
  return stripUndefined({
    id: npc.id,
    campaign_id: npc.campaignId,
    name: npc.name,
    race: npc.race,
    archetype: npc.archetype,
    occupation: npc.occupation,
    location: npc.location,
    alignment: npc.alignment,
    disposition: npc.disposition,
    appearance: npc.appearance,
    personality: npc.personality,
    ideals: npc.ideals,
    bonds: npc.bonds,
    flaws: npc.flaws,
    secrets: npc.secrets,
    backstory: npc.backstory,
    notes: npc.notes,
    affiliations: npc.affiliations,
    relations: npc.relations,
    memory: npc.memory.map(memory => fromNPCMemory(memory) as DbNPCMemory),
    session_ids: npc.sessionIds,
    tags: npc.tags,
    armor_class: npc.armorClass,
    hit_points: npc.hitPoints,
    challenge_rating: npc.challengeRating,
    is_alive: npc.isAlive,
    created_at: toIso(npc.createdAt),
    updated_at: toIso(npc.updatedAt),
  });
}

export function toNPCMemory(db: DbNPCMemory): NPCMemory {
  return stripUndefined({
    id: db.id,
    text: db.text,
    sessionId: maybeString(db.session_id),
    createdAt: toMillis(db.created_at),
  }) as NPCMemory;
}

export function fromNPCMemory(memory: NPCMemory): Partial<DbNPCMemory> {
  return stripUndefined({
    id: memory.id,
    text: memory.text,
    session_id: memory.sessionId,
    created_at: toIso(memory.createdAt),
  });
}

export function toQuest(db: DbQuest): Quest {
  return stripUndefined({
    id: db.id,
    campaignId: db.campaign_id,
    title: db.title,
    type: db.type,
    status: db.status,
    description: db.description,
    objectives: listOf(db.objectives).map(toQuestObjective),
    reward: db.reward,
    consequences: db.consequences,
    questGiverId: maybeString(db.quest_giver_id),
    relatedNpcIds: listOf(db.related_npc_ids),
    timeLimit: maybeString(db.time_limit),
    notes: db.notes,
    completedSessionId: maybeString(db.completed_session_id),
    createdAt: toMillis(db.created_at),
    updatedAt: toMillis(db.updated_at),
  }) as Quest;
}

export function fromQuest(quest: Quest): Partial<DbQuest> {
  return stripUndefined({
    id: quest.id,
    campaign_id: quest.campaignId,
    title: quest.title,
    type: quest.type,
    status: quest.status,
    description: quest.description,
    objectives: quest.objectives.map(objective => fromQuestObjective(objective) as DbQuestObjective),
    reward: quest.reward,
    consequences: quest.consequences,
    quest_giver_id: quest.questGiverId,
    related_npc_ids: quest.relatedNpcIds,
    time_limit: quest.timeLimit,
    notes: quest.notes,
    completed_session_id: quest.completedSessionId,
    created_at: toIso(quest.createdAt),
    updated_at: toIso(quest.updatedAt),
  });
}

export function toQuestObjective(db: DbQuestObjective): QuestObjective {
  return stripUndefined({
    id: db.id,
    description: db.description,
    completed: db.completed,
    completedAt: db.completed_at == null ? undefined : toMillis(db.completed_at),
  }) as QuestObjective;
}

export function fromQuestObjective(objective: QuestObjective): Partial<DbQuestObjective> {
  return stripUndefined({
    id: objective.id,
    description: objective.description,
    completed: objective.completed,
    completed_at: toIso(objective.completedAt),
  });
}

export function toWorldLocation(db: DbWorldLocation): Location {
  return stripUndefined({
    id: db.id,
    campaignId: db.campaign_id,
    name: db.name,
    type: db.type,
    description: db.description,
    climate: maybeString(db.climate),
    government: maybeString(db.government),
    economy: maybeString(db.economy),
    population: maybeString(db.population),
    npcIds: listOf(db.npc_ids),
    questIds: listOf(db.quest_ids),
    factionIds: listOf(db.faction_ids),
    parentLocationId: maybeString(db.parent_location_id),
    notes: maybeString(db.notes),
    tags: listOf(db.tags),
    pin: db.pin ?? undefined,
    createdAt: toMillis(db.created_at),
    updatedAt: toMillis(db.updated_at),
  }) as Location;
}

export function fromWorldLocation(location: Location): Partial<DbWorldLocation> {
  return stripUndefined({
    id: location.id,
    campaign_id: location.campaignId,
    name: location.name,
    type: location.type,
    description: location.description,
    climate: location.climate,
    government: location.government,
    economy: location.economy,
    population: location.population,
    npc_ids: location.npcIds,
    quest_ids: location.questIds,
    faction_ids: location.factionIds,
    parent_location_id: location.parentLocationId,
    notes: location.notes,
    tags: location.tags,
    pin: location.pin,
    created_at: toIso(location.createdAt),
    updated_at: toIso(location.updatedAt),
  });
}

export function toFaction(db: DbFaction): Faction {
  return stripUndefined({
    id: db.id,
    campaignId: db.campaign_id,
    name: db.name,
    description: db.description,
    goals: maybeString(db.goals),
    secrets: maybeString(db.secrets),
    symbol: maybeString(db.symbol),
    headquartersLocationId: maybeString(db.headquarters_location_id),
    relations: listOf(db.relations),
    playerReputation: db.player_reputation,
    locationIds: listOf(db.location_ids),
    npcIds: listOf(db.npc_ids),
    tags: listOf(db.tags),
    notes: maybeString(db.notes),
    createdAt: toMillis(db.created_at),
    updatedAt: toMillis(db.updated_at),
  }) as Faction;
}

export function fromFaction(faction: Faction): Partial<DbFaction> {
  return stripUndefined({
    id: faction.id,
    campaign_id: faction.campaignId,
    name: faction.name,
    description: faction.description,
    goals: faction.goals,
    secrets: faction.secrets,
    symbol: faction.symbol,
    headquarters_location_id: faction.headquartersLocationId,
    relations: faction.relations,
    player_reputation: faction.playerReputation,
    location_ids: faction.locationIds,
    npc_ids: faction.npcIds,
    tags: faction.tags,
    notes: faction.notes,
    created_at: toIso(faction.createdAt),
    updated_at: toIso(faction.updatedAt),
  });
}

export function toWorldLore(db: DbWorldLore): WorldLore {
  return {
    id: db.id,
    campaignId: db.campaign_id,
    title: db.title,
    content: db.content,
    category: db.category,
    tags: listOf(db.tags),
    createdAt: toMillis(db.created_at),
    updatedAt: toMillis(db.updated_at),
  };
}

export function fromWorldLore(lore: WorldLore): Partial<DbWorldLore> {
  return stripUndefined({
    id: lore.id,
    campaign_id: lore.campaignId,
    title: lore.title,
    content: lore.content,
    category: lore.category,
    tags: lore.tags,
    created_at: toIso(lore.createdAt),
    updated_at: toIso(lore.updatedAt),
  });
}

export function toMap(db: DbMap): CampaignMap {
  return stripUndefined({
    id: db.id,
    campaignId: db.campaign_id,
    name: db.name,
    imageUrl: maybeString(db.image_url),
    pins: listOf(db.pins),
    isPublic: db.is_public,
    createdAt: toMillis(db.created_at),
    updatedAt: toMillis(db.updated_at),
  }) as CampaignMap;
}

export function fromMap(map: CampaignMap): Partial<DbMap> {
  return stripUndefined({
    id: map.id,
    campaign_id: map.campaignId,
    name: map.name,
    image_url: map.imageUrl,
    pins: map.pins,
    is_public: map.isPublic,
    created_at: toIso(map.createdAt),
    updated_at: toIso(map.updatedAt),
  });
}

export function toModuleProgress(db: DbModuleProgress): ModuleProgress {
  return {
    pct: db.pct,
    completedLessons: listOf(db.completed_lessons),
  };
}

export function fromModuleProgress(
  userId: string,
  moduleId: string,
  progress: ModuleProgress,
): Partial<DbModuleProgress> {
  return stripUndefined({
    user_id: userId,
    module_id: moduleId,
    pct: progress.pct,
    completed_lessons: progress.completedLessons,
  });
}
