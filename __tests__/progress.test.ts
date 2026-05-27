import { describe, expect, it } from "vitest";
import { completeLessonProgress, resetModuleProgress } from "@/lib/progress";
import type { Progress } from "@/types/learning";

describe("Learn progress helpers", () => {
  it("marks lessons complete and updates module percentage", () => {
    const first = completeLessonProgress({}, "m00", "l1");

    expect(first.m00).toEqual({ pct: 50, completedLessons: ["l1"] });

    const second = completeLessonProgress(first, "m00", "l2");

    expect(second.m00).toEqual({ pct: 100, completedLessons: ["l1", "l2"] });
  });

  it("does not duplicate completed lessons", () => {
    const progress: Progress = { m00: { pct: 50, completedLessons: ["l1"] } };

    expect(completeLessonProgress(progress, "m00", "l1")).toBe(progress);
  });

  it("ignores lessons that do not belong to the module", () => {
    const progress: Progress = {};

    expect(completeLessonProgress(progress, "m00", "missing")).toBe(progress);
  });

  it("resets a module without clearing other progress", () => {
    const progress: Progress = {
      m00: { pct: 100, completedLessons: ["l1", "l2"] },
      m01: { pct: 100, completedLessons: ["l1"] },
    };

    expect(resetModuleProgress(progress, "m00")).toEqual({
      m00: { pct: 0, completedLessons: [] },
      m01: { pct: 100, completedLessons: ["l1"] },
    });
  });
});
