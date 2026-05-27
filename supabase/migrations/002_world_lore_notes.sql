-- LVL ONE — Migration 002: world_lore + campaign_notes tables

create table if not exists public.world_lore (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  title text not null,
  content text not null default '',
  category text not null check (category in ('history', 'geography', 'religion', 'faction', 'character', 'event', 'other')),
  tags text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.campaign_notes (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  title text not null,
  content text not null default '',
  is_dm_only boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.world_lore enable row level security;
alter table public.campaign_notes enable row level security;

-- DM all access
do $$ begin
  create policy "DM lore all" on public.world_lore for all
    using (exists (select 1 from public.campaigns where id = campaign_id and dm_id = auth.uid()))
    with check (exists (select 1 from public.campaigns where id = campaign_id and dm_id = auth.uid()));
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "DM notes all" on public.campaign_notes for all
    using (exists (select 1 from public.campaigns where id = campaign_id and dm_id = auth.uid()))
    with check (exists (select 1 from public.campaigns where id = campaign_id and dm_id = auth.uid()));
exception when duplicate_object then null;
end $$;

-- Player read
do $$ begin
  create policy "Player lore select" on public.world_lore for select
    using (
      auth.uid() in (select user_id from public.campaign_players where campaign_id = world_lore.campaign_id)
      or exists (select 1 from public.campaigns where id = campaign_id and dm_id = auth.uid())
    );
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "Player notes select" on public.campaign_notes for select
    using (
      (is_dm_only = false and auth.uid() in (select user_id from public.campaign_players where campaign_id = campaign_notes.campaign_id))
      or exists (select 1 from public.campaigns where id = campaign_id and dm_id = auth.uid())
    );
exception when duplicate_object then null;
end $$;

create index if not exists idx_world_lore_campaign on public.world_lore(campaign_id);
create index if not exists idx_campaign_notes_campaign on public.campaign_notes(campaign_id);
