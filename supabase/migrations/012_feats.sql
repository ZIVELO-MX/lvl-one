-- LVL ONE — Migration 012: dotes del personaje
--
-- La tabla `feats` del catálogo existe desde la migración 001, pero
-- `characters` nunca tuvo dónde guardar cuáles había elegido el personaje.
-- El humano variante recibe una dote a nivel 1 (regla opcional del PHB) y
-- hasta ahora la elección no tenía columna, ni asistente, ni ficha.
--
--   · feats: los ids elegidos. Array porque a partir del nivel 4 se puede
--     cambiar un aumento de característica por otra dote.
--   · feat_bonuses: el +1 de las medias dotes (Atleta, Resiliente, Observador…).
--     Va aparte de asi_bonuses porque ese campo lo consume el reparto racial:
--     mezclarlos haría que la raza creyera ya repartido lo que puso la dote.

alter table public.characters
  add column if not exists feats text[] not null default '{}',
  add column if not exists feat_bonuses jsonb not null default '{}'::jsonb;
