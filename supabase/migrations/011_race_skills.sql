-- LVL ONE — Migration 011: habilidades elegidas por la raza
--
-- El semielfo elige dos habilidades cualesquiera (Versatilidad). Iban aparte
-- de selected_skills, que son las de clase, porque si compartieran lista el
-- jugador gastaría sus huecos de clase en ellas y perdería competencias.

alter table public.characters
  add column if not exists race_skills text[] not null default '{}';
