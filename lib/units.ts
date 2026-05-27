export function mToFeet(meters: number): number {
  return Math.round(meters / 0.3048 / 5) * 5;
}

export function formatSpeed(meters: number): string {
  return `${mToFeet(meters)} ft`;
}
