import { LESSONS } from "@/data/modules";
import type { Progress } from "@/types/learning";

export function completeLessonProgress(
  progress: Progress,
  moduleId: string,
  lessonId: string,
): Progress {
  const moduleLessons = LESSONS[moduleId] ?? [];
  if (!moduleLessons.some((lesson) => lesson.id === lessonId)) return progress;

  const current = progress[moduleId] ?? { pct: 0, completedLessons: [] };
  if (current.completedLessons.includes(lessonId)) return progress;

  const completedLessons = [...current.completedLessons, lessonId];
  const pct = Math.round((completedLessons.length / moduleLessons.length) * 100);

  return {
    ...progress,
    [moduleId]: { pct, completedLessons },
  };
}

export function resetModuleProgress(progress: Progress, moduleId: string): Progress {
  return {
    ...progress,
    [moduleId]: { pct: 0, completedLessons: [] },
  };
}
