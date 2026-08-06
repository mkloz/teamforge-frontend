// @vitest-environment jsdom

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import {
  ONBOARDING_PRACTICE_TASKS,
  ONBOARDING_PRACTICE_VERSION,
  onboardingPracticeTaskIds,
} from "@/features/onboarding/practice/practice-model";
import { readPracticeProgress } from "@/features/onboarding/practice/practice-progress";

const POLICY_ID = "ONB-POL-005";
const PRACTICE_ROOT = join(
  process.cwd(),
  "src",
  "features",
  "onboarding",
  "practice",
);
const TEST_STORAGE_KEY = "test:onboarding-practice";

afterEach(() => {
  sessionStorage.clear();
});

describe(`${POLICY_ID} local onboarding practice boundary`, () => {
  it("keeps the task manifest immutable and internally consistent", () => {
    expect(Object.isFrozen(ONBOARDING_PRACTICE_TASKS)).toBe(true);
    expect(ONBOARDING_PRACTICE_TASKS.map((task) => task.id)).toEqual(
      onboardingPracticeTaskIds,
    );

    for (const task of ONBOARDING_PRACTICE_TASKS) {
      expect(Object.isFrozen(task)).toBe(true);
      expect(Object.isFrozen(task.choices)).toBe(true);
      expect(
        task.choices.some((choice) => choice.id === task.correctChoiceId),
      ).toBe(true);
    }
  });

  it("rejects progress from another tutorial version", () => {
    sessionStorage.setItem(
      TEST_STORAGE_KEY,
      JSON.stringify({
        version: "education-v0",
        completedTaskIds: ["navigation"],
      }),
    );

    expect(readPracticeProgress(TEST_STORAGE_KEY)).toEqual({
      version: ONBOARDING_PRACTICE_VERSION,
      completedTaskIds: [],
    });
    expect(sessionStorage.getItem(TEST_STORAGE_KEY)).toBeNull();
  });

  it("rejects unknown task identifiers", () => {
    sessionStorage.setItem(
      TEST_STORAGE_KEY,
      JSON.stringify({
        version: ONBOARDING_PRACTICE_VERSION,
        completedTaskIds: ["navigation", "server-created-task"],
      }),
    );

    expect(readPracticeProgress(TEST_STORAGE_KEY).completedTaskIds).toEqual([]);
  });

  it("has no production API, query, realtime, capability, device, analytics or scenario dependency", () => {
    const source = readPracticeSources(PRACTICE_ROOT).join("\n");
    const forbiddenPatterns = [
      /@\/shared\/api\//,
      /@\/dev\/scenarios/,
      /apiClient/,
      /queryClient/,
      /useQuery/,
      /fetch\s*\(/,
      /WebSocket/,
      /socket\.io/,
      /navigator\.geolocation/,
      /\bNotification\b/,
      /analytics/i,
      /telemetry/i,
      /Scenario Mode/i,
    ];

    for (const pattern of forbiddenPatterns) {
      expect(source, `Unexpected practice dependency: ${pattern}`).not.toMatch(
        pattern,
      );
    }
  });
});

function readPracticeSources(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) return readPracticeSources(path);
    return /\.(ts|tsx)$/.test(entry.name) ? [readFileSync(path, "utf8")] : [];
  });
}
