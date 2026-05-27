function normalizeSeed(seed: number): number {
  if (!Number.isFinite(seed)) return 1;
  const normalized = Math.trunc(seed) >>> 0;
  return normalized || 1;
}

export function seededRandom(seed: number): number {
  let value = normalizeSeed(seed) + 0x6D2B79F5;
  value = Math.imul(value ^ (value >>> 15), value | 1);
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
  return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
}

export function randomInt(min: number, max: number, seed?: number): number {
  const low = Math.ceil(Math.min(min, max));
  const high = Math.floor(Math.max(min, max));
  const random = seed === undefined ? Math.random() : seededRandom(seed);
  return Math.floor(random * (high - low + 1)) + low;
}

export function pickRandom<T>(arr: readonly T[], seed?: number): T {
  if (arr.length === 0) throw new RangeError("pickRandom requires a non-empty array.");
  const random = seed === undefined ? Math.random() : seededRandom(seed);
  const index = Math.min(arr.length - 1, Math.floor(random * arr.length));
  return arr[index];
}

export function rollDice(faces: number, count = 1, mod = 0, seed?: number): {
  rolls: number[];
  total: number;
  formula: string;
} {
  const safeFaces = Math.max(2, Math.floor(faces));
  const safeCount = Math.max(1, Math.floor(count));
  const safeMod = Math.trunc(mod);
  const rolls = Array.from({ length: safeCount }, (_, index) =>
    randomInt(1, safeFaces, seed === undefined ? undefined : seed + index),
  );
  const total = rolls.reduce((sum, roll) => sum + roll, safeMod);
  const modText = safeMod === 0 ? "" : safeMod > 0 ? `+${safeMod}` : String(safeMod);

  return {
    rolls,
    total,
    formula: `${safeCount}d${safeFaces}${modText}`,
  };
}
