-- LVL ONE — Migration 003: invite_code unique constraint + table-level fixes
-- Addresses audit findings: UNIQUE invite_code, non-negative constraints

alter table public.campaigns
  add constraint campaigns_invite_code_key unique (invite_code);

-- Non-negative checks for characters currency and HP
alter table public.characters
  add constraint characters_hp_current_check check (hp_current >= 0),
  add constraint characters_hp_temp_check check (hp_temp >= 0),
  add constraint characters_gold_check check (gold >= 0),
  add constraint characters_silver_check check (silver >= 0),
  add constraint characters_copper_check check (copper >= 0),
  add constraint characters_platinum_check check (platinum >= 0);

-- Non-negative checks for monsters
alter table public.monsters
  add constraint monsters_cr_check check (cr >= 0),
  add constraint monsters_xp_check check (xp >= 0),
  add constraint monsters_ac_check check (ac >= 0),
  add constraint monsters_hp_check check (hp >= 0);
