-- LVL ONE — Migration 005: Character limit enforcement for free users
-- Prevents free-plan users from exceeding MAX_FREE_CHARACTERS (2) at DB level

-- 1. Helper function to enforce the limit
create or replace function public.check_character_limit()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  user_plan text;
  char_count integer;
begin
  select plan into user_plan from public.profiles where id = new.user_id;

  if user_plan = 'free' then
    select count(*) into char_count
    from public.characters
    where user_id = new.user_id;

    if char_count >= 2 then
      raise exception 'Límite de personajes alcanzado. Actualiza a Pro para crear más personajes.'
        using hint = 'Upgrade to pro plan to create more characters';
    end if;
  end if;

  return new;
end;
$$;

-- 2. Trigger: run before every INSERT on characters
create trigger trg_check_character_limit
  before insert on public.characters
  for each row
  execute function public.check_character_limit();
