import type { CharacterDraft } from "@/types/character";
import { RACES } from "@/data/races";
import { SUBRACES } from "@/data/subraces";
import { CLASSES } from "@/data/classes";
import { SUBCLASSES } from "@/data/subclasses";
import { BACKGROUNDS } from "@/data/backgrounds";
import { EQUIPMENT_ITEMS } from "@/data/equipment";
import { FEATS, type Feat } from "@/data/feats";
import { weightCapacity } from "@/data/levelProgression";
import {
  STAT_KEYS, SKILLS_BY_STAT, modOf, hpForLevel, proficiencyBonusForLevel,
  armorClassFrom, type ASI,
} from "@/types/character";

/**
 * Todo lo que la ficha muestra y el borrador no guarda: características con
 * sus bonos, PG, CA, competencias, carga, idiomas.
 *
 * Vive fuera de lib/store.tsx —que es un módulo de cliente— para que también
 * pueda usarlo el mapeo de Supabase. Antes había dos copias de este cálculo y
 * la segunda se había quedado atrás: seguía sacando la CA de una tabla por
 * clase, así que un guerrero sin armadura encima marcaba 18.
 */
export function buildCharacter(draft: CharacterDraft) {
  const race = RACES.find(r => r.id === draft.raceId);
  const subrace = SUBRACES.find(s => s.id === draft.subraceId);
  const cls = CLASSES.find(c => c.id === draft.classId);
  const subclass = SUBCLASSES.find(s => s.id === draft.subclassId);
  const bg = BACKGROUNDS.find(b => b.id === draft.backgroundId);

  // El humano variante cambia el +1 a todo del humano por +1 a dos a
  // elección; no se suman. Antes sí, y salía con seis características por
  // encima de lo que permite el manual.
  const raceAsi = subrace?.replacesRaceAsi ? undefined : race?.asi;

  const stats: Record<string, number> = {};
  const mods: Record<string, number> = {};
  STAT_KEYS.forEach(k => {
    const base = draft.baseStats[k] ?? 10;
    const asi = raceAsi ?? {};
    const subraceAsi = subrace?.asi ?? {};
    stats[k] = base
      + (("all" in asi ? asi.all ?? 0 : 0))
      + ((asi as Record<string, number>)[k] ?? 0)
      + (("all" in subraceAsi ? subraceAsi.all ?? 0 : 0))
      + ((subraceAsi as Record<string, number>)[k] ?? 0)
      + (draft.asiBonuses?.[k] ?? 0)
      + (draft.featBonuses?.[k] ?? 0);
    mods[k] = modOf(stats[k]);
  });

  // Apply racial ASI choices (e.g. Variant Human, Half-Elf) via asiBonuses
  // If asiBonuses has user-set values, use them; otherwise auto-assign to fill choices
  const choiceSources: ASI[] = [raceAsi, subrace?.asi].filter((s): s is ASI => s !== undefined && !!s.choices);
  for (const src of choiceSources) {
    for (const choice of src.choices ?? []) {
      const eligible = choice.from
        ? STAT_KEYS.filter(k => choice.from!.includes(k))
        : [...STAT_KEYS];
      const existing = eligible.filter(k => (draft.asiBonuses?.[k] ?? 0) > 0);
      const toAssign = Math.max(0, choice.choose - existing.length);
      let assigned = 0;
      for (const k of eligible) {
        if (assigned >= toAssign) break;
        if ((draft.asiBonuses?.[k] ?? 0) === 0) {
          stats[k] += choice.amount;
          mods[k] = modOf(stats[k]);
          assigned++;
        }
      }
    }
  }

  // Dotes. La columna existía en la base y nadie la escribía. Aquí sólo se
  // suman los números que van impresos en la hoja; el resto de cada dote es
  // una regla de mesa y vive en su descripción.
  const chosenFeats = (draft.feats ?? [])
    .map(id => FEATS.find(f => f.id === id))
    .filter((f): f is Feat => !!f);
  const featEffects = chosenFeats.reduce((acc, f) => ({
    initiative: acc.initiative + (f.effects?.initiative ?? 0),
    speed: acc.speed + (f.effects?.speed ?? 0),
    hpPerLevel: acc.hpPerLevel + (f.effects?.hpPerLevel ?? 0),
    passivePerception: acc.passivePerception + (f.effects?.passivePerception ?? 0),
  }), { initiative: 0, speed: 0, hpPerLevel: 0, passivePerception: 0 });

  const conMod = modOf(stats.CON ?? 10);
  const dexMod = modOf(stats.DES ?? 10);
  const wisMod = modOf(stats.SAB ?? 10);
  const hitDie = cls ? parseInt(cls.hit.slice(1), 10) : 8;
  const level = Math.max(1, draft.level ?? 1);
  // Duro de matar suma +2 PG por nivel, también por los que aún no tiene.
  const hp = hpForLevel(hitDie, conMod, level) + featEffects.hpPerLevel * level;
  const proficiencyBonus = proficiencyBonusForLevel(level);
  // La CA sale de lo que lleva puesto, no de una tabla por clase. Si no ha
  // equipado nada a mano se mira el inventario: las fichas creadas antes de
  // esto tienen equippedItems vacío y no deben quedarse en 10 + DES.
  const gearIds = (draft.equippedItems ?? []).length ? draft.equippedItems! : (draft.equipment ?? []);
  const equippedGear = gearIds
    .map(id => EQUIPMENT_ITEMS.find(i => i.id === id))
    .filter((i): i is NonNullable<typeof i> => !!i);
  const ac = armorClassFrom(equippedGear, { DES: dexMod, CON: conMod, SAB: wisMod }, cls?.id);

  const inheritedSpells = [...(draft.spells ?? [])];
  if (subrace?.spells) {
    for (const s of subrace.spells) {
      if (!inheritedSpells.includes(s)) inheritedSpells.push(s);
    }
  }
  if (subclass?.spells) {
    for (const s of subclass.spells) {
      if (!inheritedSpells.includes(s)) inheritedSpells.push(s);
    }
  }

  // Competencias de habilidad: las elegidas, las del trasfondo y las que
  // concede la raza. Estas últimas no se aplicaban en ninguna parte, así que
  // un elfo no era competente en Percepción ni un semiorco en Intimidación
  // aunque su ficha lo prometiera.
  const ALL_SKILLS = new Set(Object.values(SKILLS_BY_STAT).flat());
  const skillProficiencies = [...new Set([
    ...(bg?.skills ?? []),
    ...(draft.selectedSkills ?? []),
    ...(draft.raceSkills ?? []),
    // "+2 a elección" del semielfo es un marcador, no una habilidad: se filtra
    // aquí y se elige en el asistente.
    ...(race?.skillProficiencies ?? []).filter(s => ALL_SKILLS.has(s)),
    ...(subrace?.skillProficiencies ?? []).filter(s => ALL_SKILLS.has(s)),
  ])];

  // Carga: lo que pesa todo el inventario frente a lo que aguanta su Fuerza.
  const carriedKg = Math.round(
    (draft.equipment ?? []).reduce((kg, id) => kg + (EQUIPMENT_ITEMS.find(i => i.id === id)?.weightKg ?? 0), 0) * 10,
  ) / 10;
  const carryCapacityKg = weightCapacity(stats.FUE ?? 10);

  // Velocidad e idiomas: los declaraba cada raza y no los leía nadie, así que
  // la hoja no podía mostrarlos. La subraza manda sobre la raza si la cambia.
  const speed = (subrace?.speed ?? race?.speed ?? 9) + featEffects.speed;
  const languages = [...new Set([...(race?.languages ?? []), ...(subrace?.languages ?? [])])];

  // La percepción pasiva la calculaba la hoja sin saber de dotes, así que
  // Observador (+5) no se notaba en ninguna parte.
  const passivePerception = 10 + wisMod
    + (skillProficiencies.includes("Percepción") ? proficiencyBonus : 0)
    + featEffects.passivePerception;

  // Competencias que no son de habilidad: armaduras, armas y herramientas de
  // clase, raza y trasfondo. Se llama "derived" para no pisar
  // otherProficiencies, que es el recuadro de texto libre de la hoja.
  const derivedProficiencies = [...new Set([
    ...(cls?.armorProficiencies ?? []),
    ...(cls?.weaponProficiencies ?? []),
    ...(cls?.toolProficiencies ?? []),
    ...(race?.weaponProficiencies ?? []),
    ...(bg?.tools ?? []),
  ])];

  return { ...draft, race, subrace, class: cls, subclass, background: bg, stats, mods, hp, ac, initiative: dexMod + featEffects.initiative, proficiencyBonus, spells: inheritedSpells, skillProficiencies, speed, languages, derivedProficiencies, carriedKg, carryCapacityKg, passivePerception };
}
