// Script to generate complete seed SQL from TS data files
// Usage: npx tsx scripts/generate-seed.ts > supabase/seed-full.sql

import { RACES } from "@/data/races";
import { SUBRACES } from "@/data/subraces";
import { CLASSES } from "@/data/classes";
import { SUBCLASSES } from "@/data/subclasses";
import { SPELLS } from "@/data/spells";
import { FEATS } from "@/data/feats";
import { MONSTERS } from "@/data/monsters";
import { BACKGROUNDS } from "@/data/backgrounds";
import { EQUIPMENT_ITEMS } from "@/data/equipment";

function esc(val: unknown): string {
  if (val === null || val === undefined) return "null";
  if (typeof val === "boolean") return val ? "true" : "false";
  if (typeof val === "number") return String(val);
  if (Array.isArray(val)) return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
  if (typeof val === "object") return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
  return `'${String(val).replace(/'/g, "''")}'`;
}

function arr(val: string[] | undefined | null): string {
  if (!val || val.length === 0) return "'{}'";
  return `'{${val.map(v => `"${v.replace(/"/g, '\\"')}"`).join(",")}}'`;
}

let sql = "-- LVL ONE — Full seed (auto-generated)\n-- Run: psql ... -f seed-full.sql\n\n";

// Races
for (const r of RACES) {
  sql += `insert into public.races (id,name,short,tags,glyph,description,speed,size,languages,fantasy,traits,category,source_tag,requires_dm_approval,complexity,recommended_for,subrace_ids,age,alignment_hint,trait_details,skill_proficiencies,weapon_proficiencies,armor_proficiencies,tool_proficiencies,language_choices) values (${esc(r.id)},${esc(r.name)},${esc(r.short)},${arr(r.tags)},${esc(r.glyph)},${esc(r.desc)},${r.speed},${esc(r.size)},${arr(r.languages)},${esc(r.fantasy)},${arr(r.traits)},${esc(r.category ?? "common")},${esc(r.sourceTag ?? "PHB")},${r.requiresDMApproval ? "true" : "false"},${esc(r.complexity ?? "Baja")},${arr(r.recommendedFor)},${arr(r.subraceIds)},${esc(r.age ?? null)},${esc(r.alignmentHint ?? null)},${esc(JSON.stringify(r.traitDetails ?? []))},${arr(r.skillProficiencies)},${arr(r.weaponProficiencies)},${arr(r.armorProficiencies)},${arr(r.toolProficiencies)},${esc(JSON.stringify(r.languageChoices ?? []))}) on conflict (id) do nothing;\n`;
}

// Subraces
for (const s of SUBRACES) {
  sql += `insert into public.subraces (id,race_id,name,short,source_tag,requires_dm_approval,asi,speed,languages,language_choices,skill_proficiencies,weapon_proficiencies,armor_proficiencies,tool_proficiencies,spellcasting_ability,traits,spells,beginner_summary,tags) values (${esc(s.id)},${esc(s.raceId)},${esc(s.name)},${esc(s.short)},${esc(s.sourceTag)},${s.requiresDMApproval ? "true" : "false"},${esc(JSON.stringify(s.asi))},${s.speed ?? "null"},${arr(s.languages)},${esc(JSON.stringify(s.languageChoices ?? []))},${arr(s.skillProficiencies)},${arr(s.weaponProficiencies)},${arr(s.armorProficiencies)},${arr(s.toolProficiencies)},${esc(s.spellcastingAbility ?? null)},${esc(JSON.stringify(s.traits))},${arr(s.spells)},${esc(s.beginnerSummary)},${arr(s.tags)}) on conflict (id) do nothing;\n`;
}

// Classes
for (const c of CLASSES) {
  sql += `insert into public.classes (id,name,short,tags,glyph,description,role,hit,saves,profs,spellcaster,skill_choices,primary_stats,complexity,combat,outside,spellcasting,spellcasting_progression,subclass_level,armor_proficiencies,weapon_proficiencies,tool_proficiencies,class_features,recommended_for,starting_equipment_id) values (${esc(c.id)},${esc(c.name)},${esc(c.short)},${arr(c.tags)},${esc(c.glyph)},${esc(c.desc)},${esc(c.role)},${esc(c.hit)},${arr(c.saves)},${arr(c.profs)},${c.spellcaster ? "true" : "false"},${esc(JSON.stringify(c.skillChoices))},${arr(c.primary)},${esc(c.complexity ?? "Media")},${esc(c.combat ?? null)},${esc(c.outside ?? null)},${esc(c.spellcasting ?? null)},${esc(JSON.stringify(c.spellcastingProgression ?? null))},${c.subclassLevel ?? 3},${arr(c.armorProficiencies)},${arr(c.weaponProficiencies)},${arr(c.toolProficiencies)},${esc(JSON.stringify(c.classFeatures ?? []))},${arr(c.recommendedFor)},${esc(c.startingEquipmentId ?? null)}) on conflict (id) do nothing;\n`;
}

// Subclasses
for (const s of SUBCLASSES) {
  sql += `insert into public.subclasses (id,class_id,name,level,source_tag,complexity,role,summary,traits,spells,tags) values (${esc(s.id)},${esc(s.classId)},${esc(s.name)},${s.level},${esc(s.sourceTag)},${esc(s.complexity)},${esc(s.role)},${esc(s.summary)},${esc(JSON.stringify(s.traits))},${arr(s.spells)},${arr(s.tags)}) on conflict (id) do nothing;\n`;
}

// Spells
for (const s of SPELLS) {
  sql += `insert into public.spells (id,name,level,school,casting_time,range,duration,classes,description,components,damage,heal,save,saving_throw,concentration,ritual,tags,beginner_summary,source_tag) values (${esc(s.id)},${esc(s.name)},${s.level},${esc(s.school)},${esc(s.castingTime ?? s.castTime ?? "1 acción")},${esc(s.range)},${esc(s.duration)},${arr(s.classes)},${esc(s.desc ?? null)},${arr(s.components)},${esc(s.damage ?? null)},${esc(s.heal ?? null)},${esc(s.save ?? null)},${esc(s.savingThrow ?? null)},${s.concentration ? "true" : "false"},${s.ritual ? "true" : "false"},${arr(s.tags)},${esc(s.beginnerSummary)},${esc(s.sourceTag)}) on conflict (id) do nothing;\n`;
}

// Feats
for (const f of FEATS) {
  sql += `insert into public.feats (id,name,description,prerequisite,type,source_tag) values (${esc(f.id)},${esc(f.name)},${esc(f.description)},${esc(JSON.stringify(f.prerequisite ?? null))},${esc(f.type)},${esc(f.sourceTag ?? "PHB")}) on conflict (id) do nothing;\n`;
}

// Monsters
for (const m of MONSTERS) {
  sql += `insert into public.monsters (id,name,short,cr,xp,type,size,alignment,ac,hp,speed,stats,senses,languages,traits,actions,reactions,legendary_actions,legendary_actions_per_round,spellcasting,tags,environment,portrait_prompt) values (${esc(m.id)},${esc(m.name)},${esc(m.short)},${m.cr},${m.xp},${esc(m.type)},${esc(m.size)},${esc(m.alignment)},${m.ac},${m.hp},${esc(m.speed)},${esc(JSON.stringify(m.stats))},${esc(m.senses ?? null)},${esc(m.languages ?? null)},${esc(JSON.stringify(m.traits ?? []))},${esc(JSON.stringify(m.actions))},${esc(JSON.stringify(m.reactions ?? []))},${esc(JSON.stringify(m.legendaryActions ?? []))},${m.legendaryActionsPerRound ?? 3},${esc(JSON.stringify(m.spellcasting ?? null))},${arr(m.tags)},${arr(m.environment)},${esc(m.portraitPrompt ?? null)}) on conflict (id) do nothing;\n`;
}

// Items (equipment)
for (const i of EQUIPMENT_ITEMS) {
  sql += `insert into public.items (id,name,category,cost,weight_kg,armor_class,strength_requirement,stealth_disadvantage,damage,damage_type,properties,summary) values (${esc(i.id)},${esc(i.name)},${esc(i.category)},${esc(i.cost ?? null)},${i.weightKg ?? "null"},${esc(i.armorClass ?? null)},${i.strengthRequirement ?? "null"},${i.stealthDisadvantage ? "true" : "false"},${esc(i.damage ?? null)},${esc(i.damageType ?? null)},${arr(i.properties)},${esc(i.summary ?? null)}) on conflict (id) do nothing;\n`;
}

// Backgrounds
for (const b of BACKGROUNDS) {
  sql += `insert into public.backgrounds (id,name,short,tags,skills,tools,equipment,feature) values (${esc(b.id)},${esc(b.name)},${esc(b.short)},${arr(b.tags)},${arr(b.skills)},${arr(b.tools)},${esc(b.equipment)},${esc(b.feature)}) on conflict (id) do nothing;\n`;
}

console.log(sql);
