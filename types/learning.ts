export type ModuleStatus = "not_started" | "in_progress" | "completed" | "locked";
export type LessonStatus = "not_started" | "in_progress" | "completed";
export type ModuleLevel = "principiante" | "intermedio" | "veterano";

export interface Module {
  id: string;
  title: string;
  short: string;
  icon: string;
  time: string;
  level: ModuleLevel;
  lessons: string[];
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  time?: string;
  hook?: string;
  core: string;
  explanation?: string;
  example: string;
  characterApplication?: string;
  activity: string;
  activityType: "quiz" | "input" | "match" | "reveal";
  activityOptions?: string[];
  activityAnswer?: number | string;
  unlockedSummary?: string;
  relatedTerms?: string[];
}

export interface GlossaryTerm {
  id: string;
  t: string;
  cat: string;
  def: string;
  ex: string;
  relates: string[];
}

export interface ModuleProgress {
  pct: number;
  completedLessons: string[];
}

export type Progress = Record<string, ModuleProgress>;
