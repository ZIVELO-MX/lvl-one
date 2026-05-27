import { describe, expect, it } from "vitest";
import { CORE_LESSON_SEQUENCE, LESSONS, MODULES, MODULE_REQ } from "@/data/modules";

describe("Learn MVP content", () => {
  it("exposes all roadmap lessons (m00–m06)", () => {
    expect(CORE_LESSON_SEQUENCE.length).toBeGreaterThan(0);

    CORE_LESSON_SEQUENCE.forEach(({ moduleId, lessonId }) => {
      const lesson = LESSONS[moduleId]?.find((entry) => entry.id === lessonId);
      expect(lesson, `${moduleId}/${lessonId}`).toBeDefined();
      expect(lesson?.core.length).toBeGreaterThan(40);
      expect(lesson?.example.length).toBeGreaterThan(40);
      expect(lesson?.characterApplication?.length).toBeGreaterThan(40);
      expect(lesson?.unlockedSummary?.length).toBeGreaterThan(40);
    });
  });

  it("keeps module lesson ids aligned with LESSONS", () => {
    MODULES.forEach((module) => {
      expect(MODULE_REQ[module.id], module.id).toBeDefined();
      expect(LESSONS[module.id]?.map((lesson) => lesson.id)).toEqual(module.lessons);
    });
  });
});
