-- LVL ONE — Migration 004: Social Features + Comunidad (M15)
-- Adds follows, bookmarks, comments, activity_feed, groups, gamification

-- ════════════════════════════════════════════
-- 1. NEW COLUMNS ON EXISTING TABLES
-- ════════════════════════════════════════════

alter table public.profiles add column if not exists avatar_url text;

alter table public.characters add column if not exists is_public boolean not null default false;

alter table public.campaigns add column if not exists is_public boolean not null default false;

-- ════════════════════════════════════════════
-- 2. SOCIAL TABLES
-- ════════════════════════════════════════════

create table if not exists public.follows (
  follower_id uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id)
);

create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('character', 'campaign')),
  target_id uuid not null,
  created_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activity_feed (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('character_created', 'campaign_created', 'session_played', 'level_up', 'achievement_earned')),
  target_id uuid not null,
  target_type text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  dm_id uuid not null references auth.users(id) on delete cascade,
  is_public boolean not null default true,
  max_players integer not null default 6,
  created_at timestamptz not null default now()
);

create table if not exists public.group_members (
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'player' check (role in ('dm', 'player')),
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

-- ════════════════════════════════════════════
-- 3. GAMIFICATION TABLES
-- ════════════════════════════════════════════

create table if not exists public.user_xp (
  user_id uuid primary key references auth.users(id) on delete cascade,
  total integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  earned_at timestamptz not null default now()
);

-- ════════════════════════════════════════════
-- 4. ROW LEVEL SECURITY
-- ════════════════════════════════════════════

alter table public.follows enable row level security;
alter table public.bookmarks enable row level security;
alter table public.comments enable row level security;
alter table public.activity_feed enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.user_xp enable row level security;
alter table public.achievements enable row level security;

-- 4a. follows — public read, self-managed
do $$ begin
  create policy "Follows select all" on public.follows for select
    using (true);
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "Follows insert own" on public.follows for insert
    with check (auth.uid() = follower_id);
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "Follows delete own" on public.follows for delete
    using (auth.uid() = follower_id);
exception when duplicate_object then null;
end $$;

-- 4b. bookmarks — user sees and manages own
do $$ begin
  create policy "Bookmarks select own" on public.bookmarks for select
    using (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "Bookmarks insert own" on public.bookmarks for insert
    with check (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "Bookmarks delete own" on public.bookmarks for delete
    using (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

-- 4c. comments — read if campaign accessible, authenticated insert, owner/DM delete
do $$ begin
  create policy "Comments select accessible" on public.comments for select
    using (
      exists (select 1 from public.campaigns where id = campaign_id and is_public = true)
      or auth.uid() in (
        select user_id from public.campaign_players where campaign_id = comments.campaign_id
        union
        select dm_id from public.campaigns where id = comments.campaign_id
      )
    );
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "Comments insert auth" on public.comments for insert
    with check (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "Comments update own" on public.comments for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "Comments delete own or dm" on public.comments for delete
    using (
      auth.uid() = user_id
      or exists (select 1 from public.campaigns where id = campaign_id and dm_id = auth.uid())
    );
exception when duplicate_object then null;
end $$;

-- 4d. activity_feed — user sees own activity + activity of people they follow
do $$ begin
  create policy "Activity feed select own and followed" on public.activity_feed for select
    using (
      auth.uid() = user_id
      or auth.uid() in (select follower_id from public.follows where following_id = activity_feed.user_id)
    );
exception when duplicate_object then null;
end $$;

-- 4e. groups — public visible to all, private to members, DM manages
do $$ begin
  create policy "Groups select visible" on public.groups for select
    using (
      is_public = true
      or auth.uid() in (select user_id from public.group_members where group_id = groups.id)
      or auth.uid() = dm_id
    );
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "Groups insert auth" on public.groups for insert
    with check (auth.uid() = dm_id);
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "Groups update dm" on public.groups for update
    using (auth.uid() = dm_id)
    with check (auth.uid() = dm_id);
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "Groups delete dm" on public.groups for delete
    using (auth.uid() = dm_id);
exception when duplicate_object then null;
end $$;

-- 4f. group_members — members see roster, self-join, self-leave, DM manages
do $$ begin
  create policy "Group members select for visible groups" on public.group_members for select
    using (
      exists (select 1 from public.groups where id = group_id and is_public = true)
      or auth.uid() in (select user_id from public.group_members where group_id = group_members.group_id)
      or auth.uid() in (select dm_id from public.groups where id = group_id)
    );
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "Group members insert self" on public.group_members for insert
    with check (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "Group members delete self or dm" on public.group_members for delete
    using (
      auth.uid() = user_id
      or auth.uid() in (select dm_id from public.groups where id = group_id)
    );
exception when duplicate_object then null;
end $$;

-- 4g. user_xp — user sees and manages own
do $$ begin
  create policy "User xp select own" on public.user_xp for select
    using (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "User xp insert own" on public.user_xp for insert
    with check (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "User xp update own" on public.user_xp for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

-- 4h. achievements — user sees own, system inserts
do $$ begin
  create policy "Achievements select own" on public.achievements for select
    using (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "Achievements insert service" on public.achievements for insert
    with check (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

-- ════════════════════════════════════════════
-- 5. INDEXES
-- ════════════════════════════════════════════

create index if not exists idx_follows_follower on public.follows(follower_id);
create index if not exists idx_follows_following on public.follows(following_id);
create index if not exists idx_bookmarks_user on public.bookmarks(user_id);
create index if not exists idx_bookmarks_target on public.bookmarks(target_type, target_id);
create index if not exists idx_comments_campaign on public.comments(campaign_id);
create index if not exists idx_comments_user on public.comments(user_id);
create index if not exists idx_activity_feed_user on public.activity_feed(user_id);
create index if not exists idx_activity_feed_created on public.activity_feed(created_at desc);
create index if not exists idx_groups_dm on public.groups(dm_id);
create index if not exists idx_group_members_group on public.group_members(group_id);
create index if not exists idx_group_members_user on public.group_members(user_id);
create index if not exists idx_achievements_user on public.achievements(user_id);

-- ════════════════════════════════════════════
-- 6. TRIGGERS — auto activity_feed
-- ════════════════════════════════════════════

create or replace function public.handle_character_created()
returns trigger as $$
begin
  insert into public.activity_feed (user_id, type, target_id, target_type)
  values (new.user_id, 'character_created', new.id, 'character');
  return new;
end;
$$ language plpgsql security definer;

create or replace function public.handle_campaign_created()
returns trigger as $$
begin
  insert into public.activity_feed (user_id, type, target_id, target_type)
  values (new.dm_id, 'campaign_created', new.id, 'campaign');
  return new;
end;
$$ language plpgsql security definer;

create or replace function public.handle_session_created()
returns trigger as $$
begin
  insert into public.activity_feed (user_id, type, target_id, target_type)
  values (
    (select dm_id from public.campaigns where id = new.campaign_id),
    'session_played',
    new.id,
    'session'
  );
  return new;
end;
$$ language plpgsql security definer;

do $$ begin
  create trigger on_character_created
    after insert on public.characters
    for each row execute function public.handle_character_created();
exception when duplicate_object then null;
end $$;

do $$ begin
  create trigger on_campaign_created
    after insert on public.campaigns
    for each row execute function public.handle_campaign_created();
exception when duplicate_object then null;
end $$;

do $$ begin
  create trigger on_session_created
    after insert on public.sessions
    for each row execute function public.handle_session_created();
exception when duplicate_object then null;
end $$;
