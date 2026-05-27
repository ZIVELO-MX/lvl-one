export function cleanList(values: string[] | undefined): string[] {
  return Array.from(new Set((values ?? []).map(v => v.trim()).filter(Boolean)));
}
