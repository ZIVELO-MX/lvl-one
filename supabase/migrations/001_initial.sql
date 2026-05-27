-- LVL ONE — Initial schema (M13)
-- Run this in Supabase SQL Editor or via `supabase db push`

-- 0. Extensions
create extension if not exists "pgcrypto";

-- ════════════════════════════════════════════
-- 1. CREATE ALL TABLES (no policies yet)
-- ════════════════════════════════════════════

-- 1a. Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  email text not null,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 1b. Reference data tables (read-only for users)
create table if not exists public.races (
  id text primary key,
  name text not null,
  short text not null,
  tags text[] not null default '{}',
  glyph text not null default '',
  description text not null default '',
  asi jsonb not null default '{}',
  speed integer not null default 9,
  size text not null default 'Mediano',
  languages text[] not null default '{}',
  fantasy text not null default '',
  traits text[] not null default '{}',
  category text default 'common',
  source_tag text default 'PHB',
  requires_dm_approval boolean default false,
  complexity text default 'Baja',
  recommended_for text[] default '{}',
  subrace_ids text[] default '{}',
  age text,
  alignment_hint text,
  trait_details jsonb default '[]',
  skill_proficiencies text[] default '{}',
  weapon_proficiencies text[] default '{}',
  armor_proficiencies text[] default '{}',
  tool_proficiencies text[] default '{}',
  language_choices jsonb default '[]',
  created_at timestamptz not null default now()
);

create table if not exists public.subraces (
  id text primary key,
  race_id text not null references public.races(id) on delete cascade,
  name text not null,
  short text not null,
  source_tag text not null default 'PHB',
  requires_dm_approval boolean default false,
  asi jsonb not null default '{}',
  speed integer,
  languages text[] default '{}',
  language_choices jsonb default '[]',
  skill_proficiencies text[] default '{}',
  weapon_proficiencies text[] default '{}',
  armor_proficiencies text[] default '{}',
  tool_proficiencies text[] default '{}',
  spellcasting_ability text,
  traits jsonb not null default '[]',
  spells text[] default '{}',
  beginner_summary text not null default '',
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.classes (
  id text primary key,
  name text not null,
  short text not null,
  tags text[] not null default '{}',
  glyph text not null default '',
  description text not null default '',
  role text not null default '',
  hit text not null default 'd8',
  saves text[] not null default '{}',
  profs text[] not null default '{}',
  spellcaster boolean not null default false,
  skill_choices jsonb not null default '{"count": 2, "options": []}',
  primary_stats text[] default '{}',
  complexity text default 'Media',
  combat text,
  outside text,
  spellcasting text,
  spellcasting_progression jsonb,
  subclass_level integer default 3,
  armor_proficiencies text[] default '{}',
  weapon_proficiencies text[] default '{}',
  tool_proficiencies text[] default '{}',
  class_features jsonb default '[]',
  recommended_for text[] default '{}',
  starting_equipment_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.subclasses (
  id text primary key,
  class_id text not null references public.classes(id) on delete cascade,
  name text not null,
  level integer not null default 3,
  source_tag text not null default 'PHB',
  complexity text default 'Media',
  role text not null default '',
  summary text not null default '',
  traits jsonb not null default '[]',
  spells text[] default '{}',
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.spells (
  id text primary key,
  name text not null,
  level integer not null default 0 check (level between 0 and 9),
  school text not null default '',
  casting_time text not null default '1 acción',
  range text not null default '',
  duration text not null default '',
  classes text[] not null default '{}',
  description text,
  components text[] not null default '{}',
  damage text,
  heal text,
  save text,
  saving_throw text,
  concentration boolean not null default false,
  ritual boolean not null default false,
  tags text[] not null default '{}',
  beginner_summary text not null default '',
  source_tag text not null default 'PHB',
  created_at timestamptz not null default now()
);

create table if not exists public.feats (
  id text primary key,
  name text not null,
  description text not null default '',
  prerequisite jsonb,
  type text not null check (type in ('combat', 'magic', 'general', 'racial')),
  source_tag text default 'PHB',
  created_at timestamptz not null default now()
);

create table if not exists public.monsters (
  id text primary key,
  name text not null,
  short text not null default '',
  cr numeric not null default 0,
  xp integer not null default 0,
  type text not null default 'bestia',
  size text not null default 'Mediano',
  alignment text not null default 'no-alineado',
  ac integer not null default 10,
  hp integer not null default 1,
  speed text not null default '9 m',
  stats jsonb not null default '{}',
  senses text,
  languages text,
  traits jsonb default '[]',
  actions jsonb not null default '[]',
  reactions jsonb default '[]',
  legendary_actions jsonb default '[]',
  legendary_actions_per_round integer default 3,
  spellcasting jsonb,
  tags text[] not null default '{}',
  environment text[] not null default '{}',
  portrait_prompt text,
  created_at timestamptz not null default now()
);

create table if not exists public.items (
  id text primary key,
  name text not null,
  category text not null check (category in ('armor', 'shield', 'weapon', 'adventuringGear', 'tool', 'pack', 'focus', 'treasure')),
  cost text,
  weight_kg numeric,
  armor_class text,
  strength_requirement integer,
  stealth_disadvantage boolean default false,
  damage text,
  damage_type text,
  properties text[] default '{}',
  summary text,
  created_at timestamptz not null default now()
);

create table if not exists public.backgrounds (
  id text primary key,
  name text not null,
  short text not null,
  tags text[] not null default '{}',
  skills text[] not null default '{}',
  tools text[] not null default '{}',
  equipment text not null default '',
  feature text not null default '',
  created_at timestamptz not null default now()
);

-- 1c. User data tables
create table if not exists public.characters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null default '',
  race_id text references public.races(id),
  subrace_id text references public.subraces(id),
  class_id text references public.classes(id),
  subclass_id text references public.subclasses(id),
  background_id text references public.backgrounds(id),
  base_stats jsonb not null default '{}',
  selected_skills text[] not null default '{}',
  alignment text not null default '',
  story text not null default '',
  ideals text not null default '',
  bonds text not null default '',
  flaws text not null default '',
  level integer not null default 1 check (level between 1 and 20),
  age text not null default '',
  status text not null default 'draft' check (status in ('draft', 'ready', 'archived')),
  concept_id text,
  stats_method text not null default 'standard' check (stats_method in ('standard', 'roll')),
  equipment text[] not null default '{}',
  equipped_items text[] default '{}',
  spells text[] not null default '{}',
  hp_current integer,
  hp_temp integer default 0,
  gold integer default 0,
  silver integer default 0,
  copper integer default 0,
  platinum integer default 0,
  spell_slots_used jsonb default '{}',
  gender text check (gender in ('male', 'female')),
  asi_bonuses jsonb default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  dm_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text not null default '',
  cover_image text,
  setting text not null default '',
  cover_color text not null default '#1a130a',
  status text not null default 'planning' check (status in ('planning', 'active', 'paused', 'completed', 'archived')),
  invite_code text,
  rules jsonb not null default '{"allowMulticlass": true, "allowFeats": true, "allowHomebrew": false, "startingLevel": 1, "statGeneration": "standard"}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.campaign_players (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  user_id uuid references public.profiles(id),
  name text not null,
  role text not null default 'player' check (role in ('dm', 'co-dm', 'player', 'spectator')),
  character_id uuid references public.characters(id),
  joined_at timestamptz not null default now()
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  number integer not null,
  title text not null default '',
  status text not null default 'scheduled' check (status in ('scheduled', 'in-progress', 'completed', 'cancelled')),
  summary text not null default '',
  npcs_encountered text[] default '{}',
  loot_obtained text[] default '{}',
  xp_awarded integer not null default 0,
  quests_started text[] default '{}',
  quests_completed text[] default '{}',
  deaths integer default 0,
  key_decisions text,
  decisions jsonb default '[]',
  date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.npcs (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  name text not null,
  race text,
  archetype text,
  occupation text,
  location text,
  alignment text check (alignment in ('lg', 'ng', 'cg', 'ln', 'tn', 'cn', 'le', 'ne', 'ce')),
  disposition text not null default 'neutral' check (disposition in ('friendly', 'neutral', 'hostile', 'unknown')),
  appearance text,
  personality text,
  ideals text,
  bonds text,
  flaws text,
  secrets text,
  backstory text,
  notes text,
  affiliations text[] default '{}',
  relations jsonb default '[]',
  memory jsonb default '[]',
  session_ids text[] default '{}',
  tags text[] default '{}',
  armor_class integer,
  hit_points integer,
  challenge_rating numeric,
  is_alive boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quests (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  title text not null,
  type text not null default 'side' check (type in ('main', 'side', 'faction', 'personal', 'bounty')),
  status text not null default 'available' check (status in ('available', 'active', 'completed', 'failed')),
  description text not null default '',
  objectives jsonb default '[]',
  reward text not null default '',
  consequences text not null default '',
  quest_giver_id uuid,
  related_npc_ids text[] default '{}',
  time_limit text,
  notes text not null default '',
  completed_session_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.world_locations (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  name text not null,
  type text not null default 'other' check (type in ('city', 'town', 'village', 'dungeon', 'wilderness', 'fortress', 'ruin', 'temple', 'port', 'other')),
  description text not null default '',
  climate text,
  government text,
  economy text,
  population text,
  npc_ids text[] default '{}',
  quest_ids text[] default '{}',
  faction_ids text[] default '{}',
  parent_location_id uuid,
  notes text,
  tags text[] default '{}',
  pin jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.factions (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  name text not null,
  description text not null default '',
  goals text,
  secrets text,
  symbol text,
  headquarters_location_id uuid,
  relations jsonb default '[]',
  player_reputation integer not null default 0,
  location_ids text[] default '{}',
  npc_ids text[] default '{}',
  tags text[] default '{}',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.modules_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  module_id text not null,
  completed_lessons text[] not null default '{}',
  pct numeric not null default 0 check (pct between 0 and 100),
  updated_at timestamptz not null default now(),
  unique(user_id, module_id)
);

-- ════════════════════════════════════════════
-- 2. ENABLE ROW LEVEL SECURITY
-- ════════════════════════════════════════════

alter table public.profiles enable row level security;
alter table public.races enable row level security;
alter table public.subraces enable row level security;
alter table public.classes enable row level security;
alter table public.subclasses enable row level security;
alter table public.spells enable row level security;
alter table public.feats enable row level security;
alter table public.monsters enable row level security;
alter table public.items enable row level security;
alter table public.backgrounds enable row level security;
alter table public.characters enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_players enable row level security;
alter table public.sessions enable row level security;
alter table public.npcs enable row level security;
alter table public.quests enable row level security;
alter table public.world_locations enable row level security;
alter table public.factions enable row level security;
alter table public.modules_progress enable row level security;

-- ════════════════════════════════════════════
-- 3. CREATE POLICIES
-- ════════════════════════════════════════════

-- 3a. Reference data (public read-only)
-- Use PL/pgSQL to handle idempotent policy creation (compatible with PG < 15)
do $$ begin
  create policy "Public read" on public.races for select using (true);
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "Public read" on public.subraces for select using (true);
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "Public read" on public.classes for select using (true);
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "Public read" on public.subclasses for select using (true);
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "Public read" on public.spells for select using (true);
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "Public read" on public.feats for select using (true);
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "Public read" on public.monsters for select using (true);
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "Public read" on public.items for select using (true);
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "Public read" on public.backgrounds for select using (true);
exception when duplicate_object then null;
end $$;

-- 3b. Profiles
do $$ begin create policy "Own profile select" on public.profiles for select using (auth.uid() = id); exception when duplicate_object then null; end $$;
do $$ begin create policy "Own profile insert" on public.profiles for insert with check (auth.uid() = id); exception when duplicate_object then null; end $$;
do $$ begin create policy "Own profile update" on public.profiles for update using (auth.uid() = id); exception when duplicate_object then null; end $$;

-- 3c. Characters
do $$ begin
  create policy "Own characters all"
    on public.characters for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

-- 3d. Campaigns
do $$ begin
  create policy "DM all"
    on public.campaigns for all
    using (auth.uid() = dm_id)
    with check (auth.uid() = dm_id);
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "Player select"
    on public.campaigns for select
    using (
      auth.uid() = dm_id
      or auth.uid() in (select user_id from public.campaign_players where campaign_id = id)
    );
exception when duplicate_object then null;
end $$;

-- 3e. Campaign players
do $$ begin create policy "Player select own" on public.campaign_players for select using (auth.uid() = user_id); exception when duplicate_object then null; end $$;
do $$ begin
  create policy "DM manage players"
    on public.campaign_players for all
    using (exists (select 1 from public.campaigns where id = campaign_id and dm_id = auth.uid()))
    with check (exists (select 1 from public.campaigns where id = campaign_id and dm_id = auth.uid()));
exception when duplicate_object then null;
end $$;

-- 3f. Sessions
do $$ begin
  create policy "DM sessions all"
    on public.sessions for all
    using (exists (select 1 from public.campaigns where id = campaign_id and dm_id = auth.uid()))
    with check (exists (select 1 from public.campaigns where id = campaign_id and dm_id = auth.uid()));
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "Player sessions select"
    on public.sessions for select
    using (
      auth.uid() in (select user_id from public.campaign_players where campaign_id = sessions.campaign_id)
      or exists (select 1 from public.campaigns where id = campaign_id and dm_id = auth.uid())
    );
exception when duplicate_object then null;
end $$;

-- 3g. NPCs
do $$ begin
  create policy "DM npcs all"
    on public.npcs for all
    using (exists (select 1 from public.campaigns where id = campaign_id and dm_id = auth.uid()))
    with check (exists (select 1 from public.campaigns where id = campaign_id and dm_id = auth.uid()));
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "Player npcs select"
    on public.npcs for select
    using (
      auth.uid() in (select user_id from public.campaign_players where campaign_id = npcs.campaign_id)
      or exists (select 1 from public.campaigns where id = campaign_id and dm_id = auth.uid())
    );
exception when duplicate_object then null;
end $$;

-- 3h. Quests
do $$ begin
  create policy "DM quests all"
    on public.quests for all
    using (exists (select 1 from public.campaigns where id = campaign_id and dm_id = auth.uid()))
    with check (exists (select 1 from public.campaigns where id = campaign_id and dm_id = auth.uid()));
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "Player quests select"
    on public.quests for select
    using (
      auth.uid() in (select user_id from public.campaign_players where campaign_id = quests.campaign_id)
      or exists (select 1 from public.campaigns where id = campaign_id and dm_id = auth.uid())
    );
exception when duplicate_object then null;
end $$;

-- 3i. World locations
do $$ begin
  create policy "DM locations all"
    on public.world_locations for all
    using (exists (select 1 from public.campaigns where id = campaign_id and dm_id = auth.uid()))
    with check (exists (select 1 from public.campaigns where id = campaign_id and dm_id = auth.uid()));
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "Player locations select"
    on public.world_locations for select
    using (
      auth.uid() in (select user_id from public.campaign_players where campaign_id = world_locations.campaign_id)
      or exists (select 1 from public.campaigns where id = campaign_id and dm_id = auth.uid())
    );
exception when duplicate_object then null;
end $$;

-- 3j. Factions
do $$ begin
  create policy "DM factions all"
    on public.factions for all
    using (exists (select 1 from public.campaigns where id = campaign_id and dm_id = auth.uid()))
    with check (exists (select 1 from public.campaigns where id = campaign_id and dm_id = auth.uid()));
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "Player factions select"
    on public.factions for select
    using (
      auth.uid() in (select user_id from public.campaign_players where campaign_id = factions.campaign_id)
      or exists (select 1 from public.campaigns where id = campaign_id and dm_id = auth.uid())
    );
exception when duplicate_object then null;
end $$;

-- 3k. Module progress
do $$ begin
  create policy "Own progress all"
    on public.modules_progress for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

-- ════════════════════════════════════════════
-- 4. INDEXES
-- ════════════════════════════════════════════

create index if not exists idx_characters_user_id on public.characters(user_id);
create index if not exists idx_campaigns_dm_id on public.campaigns(dm_id);
create index if not exists idx_campaign_players_campaign on public.campaign_players(campaign_id);
create index if not exists idx_sessions_campaign on public.sessions(campaign_id);
create index if not exists idx_npcs_campaign on public.npcs(campaign_id);
create index if not exists idx_quests_campaign on public.quests(campaign_id);
create index if not exists idx_world_locations_campaign on public.world_locations(campaign_id);
create index if not exists idx_factions_campaign on public.factions(campaign_id);
create index if not exists idx_modules_progress_user on public.modules_progress(user_id);

-- ════════════════════════════════════════════
-- 5. TRIGGER: auto-create profile on signup
-- ════════════════════════════════════════════

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
