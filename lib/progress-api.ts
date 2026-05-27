import type { Progress } from "@/types/learning";

const BASE = "/api/progress";

export async function fetchProgress(): Promise<Progress> {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error("Failed to fetch progress");
  return res.json();
}

export async function syncModuleProgress(
  moduleId: string,
  completedLessons: string[],
  pct: number,
): Promise<void> {
  const res = await fetch(BASE, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ moduleId, completedLessons, pct }),
  });
  if (!res.ok) throw new Error(`Failed to sync progress for ${moduleId}`);
}
