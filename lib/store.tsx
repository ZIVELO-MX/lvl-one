"use client";
import { createContext, useContext, useReducer, useEffect, useMemo, useRef, type ReactNode } from "react";
import type { CharacterDraft } from "@/types/character";
import type { Progress } from "@/types/learning";
import type { Campaign, CampaignPlayer, CampaignNote, Session } from "@/types/campaign";
import type { NPC } from "@/types/npc";
import type { Quest } from "@/types/quest";
import type { Faction, Location, WorldLore } from "@/types/world";
import { RACES } from "@/data/races";
import { SUBRACES } from "@/data/subraces";
import { CLASSES } from "@/data/classes";
import { SUBCLASSES } from "@/data/subclasses";
import { BACKGROUNDS } from "@/data/backgrounds";
import { STAT_KEYS, SKILLS_BY_STAT, modOf, MAX_FREE_CHARACTERS, hpForLevel, proficiencyBonusForLevel, type ASI } from "@/types/character";
import { addInventoryItem, equipInventoryItem, removeInventoryItem, unequipInventoryItem } from "@/lib/inventory";
import { completeLessonProgress, resetModuleProgress } from "@/lib/progress";
import { addPlayer, addSession, createCampaign, updateSession, type CampaignPlayerInput } from "@/lib/campaignStore";
import { deleteNPC, saveNPC } from "@/data/npcStore";
import { deleteQuest, patchQuest, saveQuest } from "@/data/questStore";
import {
  deleteFaction,
  deleteLocation,
  deleteWorldLore,
  saveFaction,
  saveLocation,
  saveWorldLore,
} from "@/data/worldStore";
import { fetchCharacters as apiFetchCharacters } from "@/lib/character-api";
import { fetchProgress as apiFetchProgress, syncModuleProgress } from "@/lib/progress-api";
import {
  fetchCampaigns as apiFetchCampaigns, deleteCampaignFromAPI,
  fetchNPCs, fetchSessions, fetchQuests, fetchPlayers, fetchWorldData, fetchWorldLore,
  createNPC, updateNPC, deleteNPCFromAPI,
  createSession, updateSessionAPI, deleteSessionFromAPI,
  createQuest, updateQuestAPI, deleteQuestFromAPI,
  createLocation, updateLocationAPI, deleteLocationFromAPI,
  createFaction, updateFactionAPI, deleteFactionFromAPI,
  addCampaignPlayer, updateCampaignPlayer, removeCampaignPlayer,
} from "@/lib/campaign-api";
import { uid } from "@/lib/uid";
import { createClient } from "@/lib/supabaseClient";

const LS_KEY = "lvlone:v1";

export interface AppUser {
  id: string;
  username: string;
  email: string;
}

export interface AppState {
  user: AppUser | null;
  isLoading: boolean;
  characters: CharacterDraft[];
  draftCharacter: CharacterDraft | null;
  campaigns: Campaign[];
  progress: Progress;
  onboardingAnswers: Record<string, number> | null;
  ui: {
    limitModalOpen: boolean;
    toast: string | null;
  };
}

const initial: AppState = {
  user: null,
  isLoading: true,
  characters: [],
  draftCharacter: null,
  campaigns: [],
  progress: { m00: { pct: 0, completedLessons: [] } },
  onboardingAnswers: null,
  ui: { limitModalOpen: false, toast: null },
};

type CampaignNoteInput = Omit<CampaignNote, "createdAt" | "updatedAt"> & {
  createdAt?: number;
  updatedAt?: number;
};

export type Action =
  | { type: "LOGIN"; user: AppUser }
  | { type: "LOGOUT" }
  | { type: "NPC_LOAD"; campaignId: string; npcs: NPC[] }
  | { type: "SESSION_LOAD"; campaignId: string; sessions: Session[] }
  | { type: "QUEST_LOAD"; campaignId: string; quests: Quest[] }
  | { type: "PLAYER_LOAD"; campaignId: string; players: CampaignPlayer[] }
  | { type: "WORLD_LOAD"; campaignId: string; locations: Location[]; factions: Faction[] }
  | { type: "LORE_LOAD"; campaignId: string; lore: WorldLore[] }
  | { type: "LOADING_SET"; value: boolean }
  | { type: "CHARACTERS_LOADED"; characters: CharacterDraft[] }
  | { type: "CAMPAIGNS_LOADED"; campaigns: Partial<Campaign>[] }
  | { type: "PROGRESS_LOADED"; progress: Progress }
  | { type: "ONBOARDING_DONE"; answers: Record<string, number> }
  | { type: "DRAFT_INIT"; draft: CharacterDraft }
  | { type: "DRAFT_UPDATE"; patch: Partial<CharacterDraft> }
  | { type: "DRAFT_CLEAR" }
  | { type: "CHARACTER_SAVE"; character: CharacterDraft }
  | { type: "CHARACTER_PATCH"; id: string; patch: Partial<CharacterDraft> }
  | { type: "CHARACTER_EQUIPMENT_ADD"; id: string; item: string }
  | { type: "CHARACTER_EQUIPMENT_REMOVE"; id: string; item: string }
  | { type: "CHARACTER_EQUIPMENT_EQUIP"; id: string; item: string }
  | { type: "CHARACTER_EQUIPMENT_UNEQUIP"; id: string; item: string }
  | { type: "CHARACTER_DELETE"; id: string }
  | { type: "CHARACTER_DUPLICATE"; id: string }
  | { type: "LIMIT_OPEN" }
  | { type: "LIMIT_CLOSE" }
  | { type: "TOAST"; toast: string }
  | { type: "TOAST_CLEAR" }
  | { type: "LESSON_COMPLETE"; moduleId: string; lessonId: string }
  | { type: "MODULE_PROGRESS_RESET"; moduleId: string }
  // Campaign actions
  | { type: "CAMPAIGN_CREATE"; campaign: Campaign }
  | { type: "CAMPAIGN_CREATE"; name: string; dmId: string; patch?: Partial<Campaign> }
  | { type: "CAMPAIGN_UPDATE"; id: string; patch: Partial<Campaign> }
  | { type: "CAMPAIGN_ADD_PLAYER"; campaignId: string; player: CampaignPlayerInput }
  | { type: "SESSION_ADD"; campaignId: string; session: Session }
  | { type: "SESSION_ADD"; campaignId: string; data?: Partial<Session> }
  | { type: "SESSION_UPDATE"; campaignId: string; sessionId: string; patch: Partial<Session> }
  | { type: "CAMPAIGN_SAVE"; campaign: Campaign }
  | { type: "CAMPAIGN_PATCH"; id: string; patch: Partial<Campaign> }
  | { type: "CAMPAIGN_DELETE"; id: string }
  | { type: "CAMPAIGN_PLAYER_ADD"; campaignId: string; player: CampaignPlayerInput }
  | { type: "CAMPAIGN_PLAYER_REMOVE"; campaignId: string; playerId?: string; userId?: string }
  | { type: "CAMPAIGN_PLAYER_PATCH"; campaignId: string; playerId?: string; userId?: string; patch: Partial<CampaignPlayer> }
  | { type: "SESSION_SAVE"; campaignId: string; session: Session }
  | { type: "SESSION_PATCH"; campaignId: string; sessionId: string; patch: Partial<Session> }
  | { type: "SESSION_DELETE"; campaignId: string; sessionId: string }
  | { type: "CAMPAIGN_NOTE_SAVE"; campaignId: string; note: CampaignNoteInput }
  | { type: "CAMPAIGN_NOTE_DELETE"; campaignId: string; noteId: string }
  // NPC actions
  | { type: "NPC_SAVE"; campaignId: string; npc: NPC }
  | { type: "NPC_DELETE"; campaignId: string; npcId: string }
  // Quest actions
  | { type: "QUEST_SAVE"; campaignId: string; quest: Quest }
  | { type: "QUEST_PATCH"; campaignId: string; questId: string; patch: Partial<Quest> }
  | { type: "QUEST_DELETE"; campaignId: string; questId: string }
  // World actions
  | { type: "LOCATION_SAVE"; campaignId: string; location: Location }
  | { type: "LOCATION_DELETE"; campaignId: string; locationId: string }
  | { type: "FACTION_SAVE"; campaignId: string; faction: Faction }
  | { type: "FACTION_DELETE"; campaignId: string; factionId: string }
  | { type: "WORLD_LORE_SAVE"; campaignId: string; lore: WorldLore }
  | { type: "WORLD_LORE_DELETE"; campaignId: string; loreId: string };

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "LOGIN":
      return { ...state, user: action.user, isLoading: false };
    case "LOGOUT":
      return { ...initial, isLoading: false, progress: state.progress };
    case "LOADING_SET":
      return { ...state, isLoading: action.value };
    case "CHARACTERS_LOADED":
      return { ...state, characters: action.characters };
    case "CAMPAIGNS_LOADED": {
      const merged = action.campaigns.map(api => {
        const local = state.campaigns.find(c => c.id === api.id);
        if (local) {
          const updated = { ...local };
          for (const [k, v] of Object.entries(api)) { if (v !== undefined) (updated as Record<string, unknown>)[k] = v; }
          return updated;
        }
        const p = api as Partial<Campaign>;
        return {
          id: p.id ?? uid(), name: p.name ?? "", description: p.description ?? "",
          setting: p.setting ?? "", coverColor: p.coverColor ?? "#1a130a",
          coverImage: p.coverImage, status: p.status ?? "planning", dmId: p.dmId ?? "",
          players: [], sessions: [], notes: [], npcs: [], quests: [], locations: [], factions: [], worldLore: [],
          inviteCode: p.inviteCode,
          rules: p.rules ?? { allowMulticlass: true, allowFeats: true, allowHomebrew: false, startingLevel: 1, statGeneration: "standard" },
          createdAt: p.createdAt ?? Date.now(), updatedAt: p.updatedAt ?? Date.now(),
        } as Campaign;
      });
      return { ...state, campaigns: merged };
    }
    case "NPC_LOAD": {
      const campaigns = state.campaigns.map(c =>
        c.id === action.campaignId ? { ...c, npcs: action.npcs } : c
      );
      return { ...state, campaigns };
    }
    case "SESSION_LOAD": {
      const campaigns = state.campaigns.map(c =>
        c.id === action.campaignId ? { ...c, sessions: action.sessions } : c
      );
      return { ...state, campaigns };
    }
    case "QUEST_LOAD": {
      const campaigns = state.campaigns.map(c =>
        c.id === action.campaignId ? { ...c, quests: action.quests } : c
      );
      return { ...state, campaigns };
    }
    case "PLAYER_LOAD": {
      const campaigns = state.campaigns.map(c =>
        c.id === action.campaignId ? { ...c, players: action.players } : c
      );
      return { ...state, campaigns };
    }
    case "WORLD_LOAD": {
      const campaigns = state.campaigns.map(c =>
        c.id === action.campaignId ? { ...c, locations: action.locations, factions: action.factions } : c
      );
      return { ...state, campaigns };
    }
    case "LORE_LOAD": {
      const campaigns = state.campaigns.map(c =>
        c.id === action.campaignId ? { ...c, worldLore: action.lore } : c
      );
      return { ...state, campaigns };
    }
    case "ONBOARDING_DONE":
      return { ...state, onboardingAnswers: action.answers };
    case "DRAFT_INIT":
      return { ...state, draftCharacter: action.draft };
    case "DRAFT_UPDATE":
      return { ...state, draftCharacter: state.draftCharacter ? { ...state.draftCharacter, ...action.patch, updatedAt: Date.now() } : null };
    case "DRAFT_CLEAR":
      return { ...state, draftCharacter: null };
    case "CHARACTER_SAVE": {
      const ch = action.character;
      const idx = state.characters.findIndex(c => c.id === ch.id);
      const characters = idx >= 0
        ? state.characters.map(c => c.id === ch.id ? ch : c)
        : [...state.characters, ch];
      return { ...state, characters, draftCharacter: null, ui: { ...state.ui, toast: "¡Personaje guardado!" } };
    }
    case "CHARACTER_PATCH": {
      const characters = state.characters.map(c =>
        c.id === action.id ? { ...c, ...action.patch, updatedAt: Date.now() } : c
      );
      return { ...state, characters };
    }
    case "CHARACTER_EQUIPMENT_ADD": {
      const characters = state.characters.map(c =>
        c.id === action.id ? { ...c, equipment: addInventoryItem(c.equipment, action.item), updatedAt: Date.now() } : c
      );
      return { ...state, characters };
    }
    case "CHARACTER_EQUIPMENT_REMOVE": {
      const characters = state.characters.map(c => {
        if (c.id !== action.id) return c;
        const inventory = removeInventoryItem({ equipment: c.equipment, equippedItems: c.equippedItems }, action.item);
        return { ...c, ...inventory, updatedAt: Date.now() };
      });
      return { ...state, characters };
    }
    case "CHARACTER_EQUIPMENT_EQUIP": {
      const characters = state.characters.map(c =>
        c.id === action.id
          ? { ...c, equippedItems: equipInventoryItem({ equipment: c.equipment, equippedItems: c.equippedItems }, action.item), updatedAt: Date.now() }
          : c
      );
      return { ...state, characters };
    }
    case "CHARACTER_EQUIPMENT_UNEQUIP": {
      const characters = state.characters.map(c =>
        c.id === action.id ? { ...c, equippedItems: unequipInventoryItem(c.equippedItems, action.item), updatedAt: Date.now() } : c
      );
      return { ...state, characters };
    }
    case "CHARACTER_DELETE":
      return { ...state, characters: state.characters.filter(c => c.id !== action.id) };
    case "CHARACTER_DUPLICATE": {
      const src = state.characters.find(c => c.id === action.id);
      if (!src || state.characters.length >= MAX_FREE_CHARACTERS)
        return { ...state, ui: { ...state.ui, limitModalOpen: true } };
      const copy: CharacterDraft = { ...src, id: uid(), name: src.name + " (copia)", status: "draft", createdAt: Date.now(), updatedAt: Date.now() };
      return { ...state, characters: [...state.characters, copy], ui: { ...state.ui, toast: "Personaje duplicado." } };
    }
    case "LIMIT_OPEN":  return { ...state, ui: { ...state.ui, limitModalOpen: true } };
    case "LIMIT_CLOSE": return { ...state, ui: { ...state.ui, limitModalOpen: false } };
    case "TOAST":       return { ...state, ui: { ...state.ui, toast: action.toast } };
    case "TOAST_CLEAR": return { ...state, ui: { ...state.ui, toast: null } };
    case "PROGRESS_LOADED": {
      return { ...state, progress: { ...state.progress, ...action.progress } };
    }
    case "LESSON_COMPLETE": {
      const progress = completeLessonProgress(state.progress, action.moduleId, action.lessonId);
      if (progress === state.progress) return state;
      return { ...state, progress, ui: { ...state.ui, toast: "Lección completada." } };
    }
    case "MODULE_PROGRESS_RESET": {
      return {
        ...state,
        progress: resetModuleProgress(state.progress, action.moduleId),
        ui: { ...state.ui, toast: "Progreso del módulo reiniciado." },
      };
    }
    // Campaign CRUD
    case "CAMPAIGN_CREATE":
    case "CAMPAIGN_SAVE": {
      const campaign = "campaign" in action ? action.campaign : createCampaign(action.name, action.dmId, action.patch);
      const idx = state.campaigns.findIndex(c => c.id === campaign.id);
      const campaigns = idx >= 0
        ? state.campaigns.map(c => c.id === campaign.id ? campaign : c)
        : [...state.campaigns, campaign];
      return { ...state, campaigns, ui: { ...state.ui, toast: "Campaña guardada." } };
    }
    case "CAMPAIGN_UPDATE":
    case "CAMPAIGN_PATCH": {
      const campaigns = state.campaigns.map(c =>
        c.id === action.id ? { ...c, ...action.patch, updatedAt: Date.now() } : c
      );
      return { ...state, campaigns };
    }
    case "CAMPAIGN_DELETE":
      return { ...state, campaigns: state.campaigns.filter(c => c.id !== action.id) };
    case "CAMPAIGN_ADD_PLAYER":
    case "CAMPAIGN_PLAYER_ADD": {
      const campaigns = state.campaigns.map(c =>
        c.id === action.campaignId
          ? addPlayer(c, action.player)
          : c
      );
      return { ...state, campaigns };
    }
    case "CAMPAIGN_PLAYER_REMOVE": {
      const playerId = action.playerId ?? action.userId;
      const campaigns = state.campaigns.map(c =>
        c.id === action.campaignId
          ? { ...c, players: c.players.filter(p => p.id !== playerId && p.userId !== playerId), updatedAt: Date.now() }
          : c
      );
      return { ...state, campaigns };
    }
    case "CAMPAIGN_PLAYER_PATCH": {
      const playerId = action.playerId ?? action.userId;
      const campaigns = state.campaigns.map(c =>
        c.id === action.campaignId
          ? { ...c, players: c.players.map(p => p.id === playerId || p.userId === playerId ? { ...p, ...action.patch } : p), updatedAt: Date.now() }
          : c
      );
      return { ...state, campaigns };
    }
    // Session CRUD
    case "SESSION_ADD":
    case "SESSION_SAVE": {
      const campaigns = state.campaigns.map(c => {
        if (c.id !== action.campaignId) return c;
        const s = "session" in action
          ? action.session
          : addSession(action.campaignId, {
              ...action.data,
              number: action.data?.number ?? c.sessions.length + 1,
            });
        const sIdx = c.sessions.findIndex(x => x.id === s.id);
        const sessions = sIdx >= 0
          ? c.sessions.map(x => x.id === s.id ? s : x)
          : [...c.sessions, s];
        return { ...c, sessions, updatedAt: Date.now() };
      });
      return { ...state, campaigns };
    }
    case "SESSION_UPDATE":
    case "SESSION_PATCH": {
      const campaigns = state.campaigns.map(c => {
        if (c.id !== action.campaignId) return c;
        const sessions = c.sessions.map(s =>
          s.id === action.sessionId ? updateSession(s, action.patch) : s
        );
        return { ...c, sessions, updatedAt: Date.now() };
      });
      return { ...state, campaigns };
    }
    case "SESSION_DELETE": {
      const campaigns = state.campaigns.map(c => {
        if (c.id !== action.campaignId) return c;
        return { ...c, sessions: c.sessions.filter(s => s.id !== action.sessionId), updatedAt: Date.now() };
      });
      return { ...state, campaigns };
    }
    // Notes
    case "CAMPAIGN_NOTE_SAVE": {
      const now = Date.now();
      const note: CampaignNote = {
        ...action.note,
        createdAt: action.note.createdAt ?? now,
        updatedAt: action.note.updatedAt ?? now,
      };
      const campaigns = state.campaigns.map(c => {
        if (c.id !== action.campaignId) return c;
        const nIdx = c.notes.findIndex(n => n.id === note.id);
        const notes = nIdx >= 0
          ? c.notes.map(n => n.id === note.id ? note : n)
          : [...c.notes, note];
        return { ...c, notes, updatedAt: Date.now() };
      });
      return { ...state, campaigns };
    }
    case "CAMPAIGN_NOTE_DELETE": {
      const campaigns = state.campaigns.map(c => {
        if (c.id !== action.campaignId) return c;
        return { ...c, notes: c.notes.filter(n => n.id !== action.noteId), updatedAt: Date.now() };
      });
      return { ...state, campaigns };
    }
    case "NPC_SAVE": {
      const campaigns = state.campaigns.map(c => {
        if (c.id !== action.campaignId) return c;
        const now = Date.now();
        const npcs = saveNPC(c.npcs, { ...action.npc, updatedAt: now });
        return { ...c, npcs, updatedAt: Date.now() };
      });
      return { ...state, campaigns };
    }
    case "NPC_DELETE": {
      const campaigns = state.campaigns.map(c => {
        if (c.id !== action.campaignId) return c;
        return { ...c, npcs: deleteNPC(c.npcs, action.npcId), updatedAt: Date.now() };
      });
      return { ...state, campaigns };
    }
    case "QUEST_SAVE": {
      const campaigns = state.campaigns.map(c => {
        if (c.id !== action.campaignId) return c;
        const now = Date.now();
        const quests = saveQuest(c.quests, { ...action.quest, updatedAt: now });
        return { ...c, quests, updatedAt: Date.now() };
      });
      return { ...state, campaigns };
    }
    case "QUEST_PATCH": {
      const now = Date.now();
      const campaigns = state.campaigns.map(c => {
        if (c.id !== action.campaignId) return c;
        const quests = patchQuest(c.quests, action.questId, { ...action.patch, updatedAt: now });
        return { ...c, quests, updatedAt: now };
      });
      return { ...state, campaigns };
    }
    case "QUEST_DELETE": {
      const campaigns = state.campaigns.map(c => {
        if (c.id !== action.campaignId) return c;
        return { ...c, quests: deleteQuest(c.quests, action.questId), updatedAt: Date.now() };
      });
      return { ...state, campaigns };
    }
    case "LOCATION_SAVE": {
      const now = Date.now();
      const campaigns = state.campaigns.map(c => {
        if (c.id !== action.campaignId) return c;
        const locations = saveLocation(c.locations, { ...action.location, updatedAt: now });
        return { ...c, locations, updatedAt: now };
      });
      return { ...state, campaigns };
    }
    case "LOCATION_DELETE": {
      const campaigns = state.campaigns.map(c => {
        if (c.id !== action.campaignId) return c;
        return { ...c, locations: deleteLocation(c.locations, action.locationId), updatedAt: Date.now() };
      });
      return { ...state, campaigns };
    }
    case "FACTION_SAVE": {
      const now = Date.now();
      const campaigns = state.campaigns.map(c => {
        if (c.id !== action.campaignId) return c;
        const factions = saveFaction(c.factions, { ...action.faction, updatedAt: now });
        return { ...c, factions, updatedAt: now };
      });
      return { ...state, campaigns };
    }
    case "FACTION_DELETE": {
      const campaigns = state.campaigns.map(c => {
        if (c.id !== action.campaignId) return c;
        return { ...c, factions: deleteFaction(c.factions, action.factionId), updatedAt: Date.now() };
      });
      return { ...state, campaigns };
    }
    case "WORLD_LORE_SAVE": {
      const now = Date.now();
      const campaigns = state.campaigns.map(c => {
        if (c.id !== action.campaignId) return c;
        const worldLore = saveWorldLore(c.worldLore, { ...action.lore, updatedAt: now });
        return { ...c, worldLore, updatedAt: now };
      });
      return { ...state, campaigns };
    }
    case "WORLD_LORE_DELETE": {
      const campaigns = state.campaigns.map(c => {
        if (c.id !== action.campaignId) return c;
        return { ...c, worldLore: deleteWorldLore(c.worldLore, action.loreId), updatedAt: Date.now() };
      });
      return { ...state, campaigns };
    }
    default: return state;
  }
}

export function migrateCampaignCollections(campaign: Campaign): Campaign {
  return {
    ...campaign,
    npcs: campaign.npcs ?? [],
    quests: campaign.quests ?? [],
    locations: campaign.locations ?? [],
    factions: campaign.factions ?? [],
    worldLore: campaign.worldLore ?? [],
  };
}

function load(): AppState {
  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem(LS_KEY) : null;
    if (!raw) return initial;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return {
      ...initial,
      ...parsed,
      user: null,       // always null until Supabase confirms session
      isLoading: true,  // auth check pending
      campaigns: (parsed.campaigns ?? []).map(c => migrateCampaignCollections(c)),
      ui: { limitModalOpen: false, toast: null },
    };
  } catch { return initial; }
}

function save(s: AppState) {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(LS_KEY, JSON.stringify({ ...s }));
  } catch { /* noop */ }
}

interface Ctx {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, rawDispatch] = useReducer(reducer, initial, load);
  const dispatch = rawDispatch;

  // Supabase auth init — runs once on mount
  useEffect(() => {
    const supabase = createClient();
    let resolved = false;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (resolved) return;
      resolved = true;
      if (user) {
        dispatch({ type: "LOGIN", user: { id: user.id, username: user.user_metadata?.username ?? user.email?.split("@")[0] ?? "", email: user.email ?? "" } });
      } else {
        dispatch({ type: "LOADING_SET", value: false });
      }
    }).catch(() => { if (!resolved) { resolved = true; dispatch({ type: "LOADING_SET", value: false }); } });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        dispatch({ type: "LOGOUT" });
      } else if (session.user) {
        if (!resolved) { resolved = true; }
        dispatch({ type: "LOGIN", user: { id: session.user.id, username: session.user.user_metadata?.username ?? session.user.email?.split("@")[0] ?? "", email: session.user.email ?? "" } });
      }
    });
    return () => { resolved = true; subscription.unsubscribe(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // dispatch is stable (useReducer)

  useEffect(() => { save(state); }, [state]);

  useEffect(() => {
    if (!state.ui.toast) return;
    const t = setTimeout(() => dispatch({ type: "TOAST_CLEAR" }), 2800);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.ui.toast]); // dispatch is stable (useReducer)

  // Fetch all user data when session is established
  useEffect(() => {
    if (!state.user) return;
    let cancelled = false;
    apiFetchCharacters()
      .then(chars => { if (!cancelled) dispatch({ type: "CHARACTERS_LOADED", characters: chars }); })
      .catch(() => dispatch({ type: "TOAST", toast: "Error al cargar personajes." }));
    apiFetchCampaigns()
      .then(camps => {
        if (cancelled) return;
        dispatch({ type: "CAMPAIGNS_LOADED", campaigns: camps });
        const ids = camps.map(c => c.id).filter(Boolean) as string[];
        Promise.all(ids.flatMap(id => [
          fetchNPCs(id).then(npcs => { if (!cancelled) dispatch({ type: "NPC_LOAD", campaignId: id, npcs }); }).catch(() => dispatch({ type: "TOAST", toast: "Error al cargar NPCs." })),
          fetchSessions(id).then(sessions => { if (!cancelled) dispatch({ type: "SESSION_LOAD", campaignId: id, sessions }); }).catch(() => dispatch({ type: "TOAST", toast: "Error al cargar sesiones." })),
          fetchQuests(id).then(quests => { if (!cancelled) dispatch({ type: "QUEST_LOAD", campaignId: id, quests }); }).catch(() => dispatch({ type: "TOAST", toast: "Error al cargar misiones." })),
          fetchPlayers(id).then(players => { if (!cancelled) dispatch({ type: "PLAYER_LOAD", campaignId: id, players }); }).catch(() => dispatch({ type: "TOAST", toast: "Error al cargar jugadores." })),
          fetchWorldData(id).then(w => { if (!cancelled) dispatch({ type: "WORLD_LOAD", campaignId: id, locations: w.locations, factions: w.factions }); }).catch(() => dispatch({ type: "TOAST", toast: "Error al cargar mundo." })),
          fetchWorldLore(id).then(lore => { if (!cancelled) dispatch({ type: "LORE_LOAD", campaignId: id, lore }); }).catch(() => dispatch({ type: "TOAST", toast: "Error al cargar lore." })),
        ]));
      })
      .catch(() => dispatch({ type: "TOAST", toast: "Error al cargar campañas." }));
    apiFetchProgress()
      .then(p => { if (!cancelled) dispatch({ type: "PROGRESS_LOADED", progress: p }); })
      .catch(() => dispatch({ type: "TOAST", toast: "Error al cargar progreso." }));
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.user?.id]); // dispatch is stable; intentional narrow dep to avoid re-fetch on non-id updates

  const prevRef = useRef("");
  useEffect(() => {
    const serialized = JSON.stringify(state.campaigns);
    if (serialized === prevRef.current) return;
    const prev = prevRef.current;
    prevRef.current = serialized;
    if (!prev) return;

    const current = state.campaigns;
    try {
      const prevCampaigns: Campaign[] = JSON.parse(prev);
      const prevMap = new Map(prevCampaigns.map(c => [c.id, c]));
      for (const campaign of current) {
        const prevCamp = prevMap.get(campaign.id);
        if (!prevCamp) continue;
        for (const npc of campaign.npcs) {
          const prevNpc = prevCamp.npcs.find((n: NPC) => n.id === npc.id);
          if (!prevNpc) { createNPC(campaign.id, npc).catch(() => {}); continue; }
          if (JSON.stringify(npc) !== JSON.stringify(prevNpc)) updateNPC(campaign.id, npc.id, npc).catch(() => {});
        }
        for (const prevNpc of prevCamp.npcs) {
          if (!campaign.npcs.find(n => n.id === prevNpc.id)) deleteNPCFromAPI(campaign.id, prevNpc.id).catch(() => {});
        }
        for (const quest of campaign.quests) {
          const prevQuest = prevCamp.quests.find((q: Quest) => q.id === quest.id);
          if (!prevQuest) { createQuest(campaign.id, quest).catch(() => {}); continue; }
          if (JSON.stringify(quest) !== JSON.stringify(prevQuest)) updateQuestAPI(campaign.id, quest.id, quest).catch(() => {});
        }
        for (const prevQuest of prevCamp.quests) {
          if (!campaign.quests.find(q => q.id === prevQuest.id)) deleteQuestFromAPI(campaign.id, prevQuest.id).catch(() => {});
        }
        for (const session of campaign.sessions) {
          const prevSession = prevCamp.sessions.find((s: Session) => s.id === session.id);
          if (!prevSession) { createSession(campaign.id, session).catch(() => {}); continue; }
          if (JSON.stringify(session) !== JSON.stringify(prevSession)) updateSessionAPI(campaign.id, session.id, session).catch(() => {});
        }
        for (const prevSession of prevCamp.sessions) {
          if (!campaign.sessions.find(s => s.id === prevSession.id)) deleteSessionFromAPI(campaign.id, prevSession.id).catch(() => {});
        }
        for (const loc of campaign.locations) {
          const prevLoc = prevCamp.locations.find((l: Location) => l.id === loc.id);
          if (!prevLoc) { createLocation(campaign.id, loc).catch(() => {}); continue; }
          if (JSON.stringify(loc) !== JSON.stringify(prevLoc)) updateLocationAPI(campaign.id, loc.id, loc).catch(() => {});
        }
        for (const prevLoc of prevCamp.locations) {
          if (!campaign.locations.find(l => l.id === prevLoc.id)) deleteLocationFromAPI(campaign.id, prevLoc.id).catch(() => {});
        }
        for (const faction of campaign.factions) {
          const prevFaction = prevCamp.factions.find((f: Faction) => f.id === faction.id);
          if (!prevFaction) { createFaction(campaign.id, faction).catch(() => {}); continue; }
          if (JSON.stringify(faction) !== JSON.stringify(prevFaction)) updateFactionAPI(campaign.id, faction.id, faction).catch(() => {});
        }
        for (const prevFaction of prevCamp.factions) {
          if (!campaign.factions.find(f => f.id === prevFaction.id)) deleteFactionFromAPI(campaign.id, prevFaction.id).catch(() => {});
        }
        for (const player of campaign.players) {
          const prevPlayer = prevCamp.players.find((p: CampaignPlayer) => p.id === player.id);
          if (!prevPlayer) { addCampaignPlayer(campaign.id, player).catch(() => {}); continue; }
          if (JSON.stringify(player) !== JSON.stringify(prevPlayer)) updateCampaignPlayer(campaign.id, player.id, player).catch(() => {});
        }
        for (const prevPlayer of prevCamp.players) {
          if (!campaign.players.find(p => p.id === prevPlayer.id)) removeCampaignPlayer(campaign.id, prevPlayer.id).catch(() => {});
        }
      }
    } catch { /* serialization or sync error */ }
  }, [state.campaigns]);

  // Character sync removed — components call the API directly

  // Progress write sync
  const prevProgRef = useRef("");
  useEffect(() => {
    const serialized = JSON.stringify(state.progress);
    if (serialized === prevProgRef.current) return;
    const prev = prevProgRef.current;
    prevProgRef.current = serialized;
    if (!prev || !state.user) return;
    try {
      const prevProg: Progress = JSON.parse(prev);
      for (const [moduleId, mp] of Object.entries(state.progress)) {
        const prevMp = prevProg[moduleId];
        if (!prevMp) { syncModuleProgress(moduleId, mp.completedLessons, mp.pct).catch(() => {}); continue; }
        if (JSON.stringify(mp) !== JSON.stringify(prevMp)) syncModuleProgress(moduleId, mp.completedLessons, mp.pct).catch(() => {});
      }
    } catch { /* noop */ }
  }, [state.progress, state.user]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const value = useMemo(() => ({ state, dispatch }), [state]); // dispatch is stable (useReducer)
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}

export function buildCharacter(draft: CharacterDraft) {
  const race = RACES.find(r => r.id === draft.raceId);
  const subrace = SUBRACES.find(s => s.id === draft.subraceId);
  const cls = CLASSES.find(c => c.id === draft.classId);
  const subclass = SUBCLASSES.find(s => s.id === draft.subclassId);
  const bg = BACKGROUNDS.find(b => b.id === draft.backgroundId);

  const stats: Record<string, number> = {};
  const mods: Record<string, number> = {};
  STAT_KEYS.forEach(k => {
    const base = draft.baseStats[k] ?? 10;
    const asi = race?.asi ?? {};
    const subraceAsi = subrace?.asi ?? {};
    stats[k] = base
      + (("all" in asi ? asi.all ?? 0 : 0))
      + ((asi as Record<string, number>)[k] ?? 0)
      + (("all" in subraceAsi ? subraceAsi.all ?? 0 : 0))
      + ((subraceAsi as Record<string, number>)[k] ?? 0)
      + (draft.asiBonuses?.[k] ?? 0);
    mods[k] = modOf(stats[k]);
  });

  // Apply racial ASI choices (e.g. Variant Human, Half-Elf) via asiBonuses
  // If asiBonuses has user-set values, use them; otherwise auto-assign to fill choices
  const choiceSources: ASI[] = [race?.asi, subrace?.asi].filter((s): s is ASI => s !== undefined && !!s.choices);
  for (const src of choiceSources) {
    for (const choice of src.choices ?? []) {
      const eligible = choice.from
        ? STAT_KEYS.filter(k => choice.from!.includes(k))
        : [...STAT_KEYS];
      const existing = eligible.filter(k => (draft.asiBonuses?.[k] ?? 0) > 0);
      const toAssign = Math.max(0, choice.choose - existing.length);
      let assigned = 0;
      for (const k of eligible) {
        if (assigned >= toAssign) break;
        if ((draft.asiBonuses?.[k] ?? 0) === 0) {
          stats[k] += choice.amount;
          mods[k] = modOf(stats[k]);
          assigned++;
        }
      }
    }
  }

  const conMod = modOf(stats.CON ?? 10);
  const dexMod = modOf(stats.DES ?? 10);
  const wisMod = modOf(stats.SAB ?? 10);
  const hitDie = cls ? parseInt(cls.hit.slice(1), 10) : 8;
  const level = Math.max(1, draft.level ?? 1);
  const hp = hpForLevel(hitDie, conMod, level);
  const proficiencyBonus = proficiencyBonusForLevel(level);
  const ac = (() => {
    switch (cls?.id) {
      case "fighter": case "paladin": return 18;
      case "cleric": return 16 + Math.min(dexMod, 2);
      case "barbarian": return 10 + dexMod + conMod;
      case "monk": return 10 + dexMod + wisMod;
      case "druid": return 13 + dexMod;
      case "ranger": return 14 + Math.min(dexMod, 2);
      case "bard": case "rogue": case "warlock": return 11 + dexMod;
      default: return 10 + dexMod;
    }
  })();

  const inheritedSpells = [...(draft.spells ?? [])];
  if (subrace?.spells) {
    for (const s of subrace.spells) {
      if (!inheritedSpells.includes(s)) inheritedSpells.push(s);
    }
  }
  if (subclass?.spells) {
    for (const s of subclass.spells) {
      if (!inheritedSpells.includes(s)) inheritedSpells.push(s);
    }
  }

  // Competencias de habilidad: las elegidas, las del trasfondo y las que
  // concede la raza. Estas últimas no se aplicaban en ninguna parte, así que
  // un elfo no era competente en Percepción ni un semiorco en Intimidación
  // aunque su ficha lo prometiera.
  const ALL_SKILLS = new Set(Object.values(SKILLS_BY_STAT).flat());
  const skillProficiencies = [...new Set([
    ...(bg?.skills ?? []),
    ...(draft.selectedSkills ?? []),
    // "+2 a elección" del semielfo es un marcador, no una habilidad: se filtra
    // aquí y se elige en el asistente.
    ...(race?.skillProficiencies ?? []).filter(s => ALL_SKILLS.has(s)),
    ...(subrace?.skillProficiencies ?? []).filter(s => ALL_SKILLS.has(s)),
  ])];

  return { ...draft, race, subrace, class: cls, subclass, background: bg, stats, mods, hp, ac, initiative: dexMod, proficiencyBonus, spells: inheritedSpells, skillProficiencies };
}

export function newDraft(): CharacterDraft {
  return {
    id: uid(),
    name: "",
    raceId: null,
    subraceId: null,
    classId: null,
    subclassId: null,
    backgroundId: null,
    baseStats: { FUE: 15, DES: 14, CON: 13, INT: 12, SAB: 10, CAR: 8 },
    selectedSkills: [],
    alignment: "",
    story: "",
    ideals: "",
    bonds: "",
    flaws: "",
    level: 1,
    age: "",
    status: "draft",
    conceptId: null,
    statsMethod: "standard",
    equipment: [],
    equippedItems: [],
    spells: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}
