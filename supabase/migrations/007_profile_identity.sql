-- LVL ONE — Migration 007: identidad de perfil (sync, unicidad, visibilidad)
--
-- Corrige cuatro fallos que rompían el camino invitación → cuenta usable:
--   1. /account leía y escribía profiles.is_public, una columna que nunca existió.
--   2. El username elegido en /setup se quedaba en auth.users.raw_user_meta_data
--      y nunca llegaba a public.profiles (handle_new_user sólo corre en INSERT).
--   3. profiles.username no era único: dos cuentas podían quedar con el mismo.
--   4. RLS de profiles era "sólo fila propia": /api/users/[username] y los
--      miembros de un grupo nunca podían leer el perfil de otro usuario.
-- Además cierra el hueco de 006: un REVOKE por columna no resta nada cuando el
-- rol tiene el privilegio a nivel tabla, así que `plan` seguía siendo editable
-- por el propio usuario.

-- ════════════════════════════════════════════
-- 1. Columna que la app ya daba por hecha
-- ════════════════════════════════════════════

alter table public.profiles add column if not exists is_public boolean not null default false;

-- ════════════════════════════════════════════
-- 2. Sincronizar profiles cuando cambia auth.users
-- ════════════════════════════════════════════

create or replace function public.handle_user_update()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.profiles
     set username   = coalesce(nullif(trim(new.raw_user_meta_data ->> 'username'), ''), username),
         email      = new.email,
         updated_at = now()
   where id = new.id;
  return new;
end;
$$;

-- El WHEN es importante: auth.users se actualiza en cada login
-- (last_sign_in_at) y no queremos escribir en profiles por eso.
create or replace trigger on_auth_user_updated
  after update on auth.users
  for each row
  when (
    old.raw_user_meta_data is distinct from new.raw_user_meta_data
    or old.email is distinct from new.email
  )
  execute function public.handle_user_update();

-- ════════════════════════════════════════════
-- 3. Username único (case-insensitive)
-- ════════════════════════════════════════════

-- Los usernames existentes salen del prefijo del email, así que puede haber
-- duplicados ya creados. Se desempatan antes de crear el índice.
with dups as (
  select id,
         row_number() over (partition by lower(username) order by created_at, id) as rn
  from public.profiles
)
update public.profiles p
   set username = p.username || '-' || substr(p.id::text, 1, 4)
  from dups d
 where p.id = d.id
   and d.rn > 1;

create unique index if not exists profiles_username_lower_key
  on public.profiles (lower(username));

-- Comprobar disponibilidad sin exponer la tabla: RLS deja ver perfiles ajenos
-- sólo por columnas, y un select directo no sirve para decir "ya está tomado".
create or replace function public.username_available(name text)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select not exists (
    select 1 from public.profiles
     where lower(username) = lower(trim(name))
       and id is distinct from auth.uid()
  );
$$;

grant execute on function public.username_available(text) to authenticated;

-- ════════════════════════════════════════════
-- 4. Visibilidad: identidad legible, email no
-- ════════════════════════════════════════════

-- La app es social (perfiles, follows, grupos, comentarios): username y avatar
-- tienen que ser legibles por cualquier autenticado. Qué contenido se ve lo
-- siguen decidiendo characters.is_public / campaigns.is_public.
do $$ begin
  create policy "Profiles readable by authenticated"
    on public.profiles for select
    to authenticated
    using (true);
exception when duplicate_object then null; end $$;

-- El email sí es privado: se quita del privilegio de tabla y se conceden
-- explícitamente el resto de columnas.
revoke select on public.profiles from authenticated;
grant select (id, username, plan, avatar_url, is_public, created_at, updated_at)
  on public.profiles to authenticated;

-- Mismo motivo para UPDATE: sin esto, `plan` sigue siendo editable por el
-- propio usuario (lo que 006 pretendía evitar y no lograba).
revoke update on public.profiles from authenticated;
grant update (username, avatar_url, is_public) on public.profiles to authenticated;
