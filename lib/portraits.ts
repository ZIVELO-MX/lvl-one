export type Gender = "male" | "female";

const RACE_SLUG: Record<string, string> = {
  "half-elf": "halfelf",
  "half-orc": "halforc",
};

// Subrace IDs use underscores in data, filenames use hyphens
// e.g. high_elf → high-elf, lightfoot_halfling → lightfoot-halfling
const SUBRACE_NO_IMAGE = new Set(["human_variant"]);

export function subracePortrait(subraceId: string, gender: Gender = "male"): string | null {
  if (SUBRACE_NO_IMAGE.has(subraceId)) return null;
  const slug = subraceId.replace(/_/g, "-");
  return `/images/subraces/${slug}-${gender}.png`;
}

export function racePortrait(raceId: string, gender: Gender = "male"): string {
  const slug = RACE_SLUG[raceId] ?? raceId;
  if (slug === "dragonborn") return "/images/races/dragonborn.png";
  return `/images/races/${slug}-${gender}.png`;
}

export function classPortrait(classId: string, gender: Gender = "male"): string {
  return `/images/classes/${classId}-${gender}.png`;
}

const SCHOOL_SLUG: Record<string, string> = {
  "Evocación":     "evocation",
  "Abjuración":    "abjuration",
  "Conjuración":   "conjuration",
  "Encantamiento": "enchantment",
  "Ilusión":       "illusion",
  "Nigromancia":   "necromancy",
  "Transmutación": "transmutation",
  "Adivinación":   "divination",
};

export function schoolBanner(school: string): string {
  return `/images/schools/${SCHOOL_SLUG[school] ?? school.toLowerCase()}.png`;
}

export function spellImage(spellId: string): string {
  return `/images/spells/${spellId}.png`;
}
