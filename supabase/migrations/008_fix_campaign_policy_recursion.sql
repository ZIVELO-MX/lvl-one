-- LVL ONE — Migration 008: romper la recursión de policies en campañas
--
-- Síntoma: cualquier consulta a campaigns o campaign_players devolvía
--   42P17 "infinite recursion detected in policy for relation campaigns"
-- y con ella /api/campaigns respondía 500. Con las campañas caídas se caen
-- también sesiones, NPCs, quests, localizaciones y facciones: casi toda la
-- parte de DM de la app.
--
-- Causa: dos policies que se llamaban entre sí.
--   campaigns."Player select"        → consulta campaign_players
--   campaign_players."DM manage players" → consulta campaigns
-- Evaluar una obligaba a evaluar la otra, sin fondo.
--
-- Arreglo: las dos comprobaciones pasan por funciones SECURITY DEFINER, que
-- no vuelven a aplicar RLS al mirar la otra tabla. Basta cortar este ciclo:
-- el resto de policies (sessions, npcs, quests, world_locations, factions)
-- dejan de recursar solas, porque ya nadie cierra el círculo.
--
-- De paso corrige un segundo fallo de "Player select": el subselect decía
-- `where campaign_id = id`, y como campaign_players tiene su propia columna
-- `id`, comparaba dos columnas de la misma tabla — siempre falso. Ningún
-- jugador veía nunca una campaña ajena, aunque estuviera invitado.

create or replace function public.is_campaign_dm(cid uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.campaigns
     where id = cid and dm_id = auth.uid()
  );
$$;

create or replace function public.is_campaign_player(cid uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.campaign_players
     where campaign_id = cid and user_id = auth.uid()
  );
$$;

grant execute on function public.is_campaign_dm(uuid) to authenticated;
grant execute on function public.is_campaign_player(uuid) to authenticated;

drop policy if exists "Player select" on public.campaigns;
create policy "Player select"
  on public.campaigns for select
  using (
    auth.uid() = dm_id
    or public.is_campaign_player(id)
  );

drop policy if exists "DM manage players" on public.campaign_players;
create policy "DM manage players"
  on public.campaign_players for all
  using (public.is_campaign_dm(campaign_id))
  with check (public.is_campaign_dm(campaign_id));
