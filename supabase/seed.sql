-- LVL ONE — Seed data
-- Run after 001_initial.sql
-- Reference data seed. Full seed: run `npx tsx scripts/generate-seed.ts`

-- Profiles (sample for local dev — real profiles created via auth trigger)
insert into public.profiles (id, username, email, plan) values
  ('00000000-0000-0000-0000-000000000001', 'dev', 'dev@lvlone.app', 'free')
on conflict (id) do nothing;
