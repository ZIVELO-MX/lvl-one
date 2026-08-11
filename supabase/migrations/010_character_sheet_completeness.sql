-- LVL ONE — Migration 010: campos que la hoja oficial tiene y la nuestra no
--
-- Auditoría de la ficha contra la hoja de personaje del Manual del Jugador
-- (5e). El modelo cubría bien lo mecánico —características, competencias,
-- salvaciones, PG, conjuros, equipo, monedas— pero faltaban casillas que en
-- la hoja de papel el jugador SÍ rellena y aquí no tenían dónde vivir.
--
-- Cara 1 de la hoja:
--   · Rasgos de personalidad. La hoja tiene cuatro recuadros (rasgos,
--     ideales, vínculos, defectos) y nosotros guardábamos tres.
--   · Inspiración: la marca el DM y el jugador la gasta.
--   · Dados de golpe gastados: el total se deduce de clase y nivel, pero sin
--     saber cuántos se han usado no se puede resolver un descanso corto.
--   · Salvaciones de muerte: existían sólo en el rastreador de combate, que
--     es efímero; al recargar se perdían.
--   · Electro (EP): la hoja lleva cinco monedas y guardábamos cuatro.
--   · Puntos de experiencia: quien no juega por hitos los apunta aquí.
--   · Otras competencias e idiomas: los idiomas salen de la raza, pero las
--     herramientas del trasfondo y lo que dé el DM no tenían sitio.
-- Cara 2:
--   · Apariencia: altura, peso, ojos, piel y pelo. Sólo teníamos edad y sexo.
--   · Aliados y organizaciones.
--   · Tesoro, que la hoja separa del equipo.

alter table public.characters
  add column if not exists personality_traits text,
  add column if not exists inspiration boolean not null default false,
  add column if not exists hit_dice_used integer not null default 0,
  add column if not exists death_saves jsonb not null default '{"successes": 0, "failures": 0}'::jsonb,
  add column if not exists electrum integer not null default 0,
  add column if not exists xp integer not null default 0,
  add column if not exists other_proficiencies text,
  add column if not exists height text,
  add column if not exists weight text,
  add column if not exists eyes text,
  add column if not exists skin text,
  add column if not exists hair text,
  add column if not exists allies text,
  add column if not exists treasure text;

-- Mismos límites que el resto de contadores de la ficha (migración 003).
alter table public.characters
  add constraint characters_electrum_check check (electrum >= 0),
  add constraint characters_xp_check check (xp >= 0),
  add constraint characters_hit_dice_used_check check (hit_dice_used >= 0);
