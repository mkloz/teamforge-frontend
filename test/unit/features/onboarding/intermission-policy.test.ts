import { describe, expect, it } from "vitest";

import { canExtendIntermission } from "@/features/onboarding/components/personality/personality-screen-renderer/intermission-page/constants";
import { getNextQuestionStep } from "@/features/onboarding/lib/personality-test-flow";

describe("personality intermission length policy", () => {
  it("does not offer an extension during the fixed first assessment", () => {
    expect(canExtendIntermission(30, false)).toBe(false);
  });

  it("allows a later retake to extend from 30 to 50 questions", () => {
    expect(canExtendIntermission(30, true)).toBe(true);
  });

  it("does not offer an extension once the longest supported retake is selected", () => {
    expect(canExtendIntermission(50, true)).toBe(false);
  });

  it("offers the starter choice after exactly ten first-run answers", () => {
    expect(
      getNextQuestionStep({
        currentPage: 2,
        isReviewMode: false,
        starterCheckpointEnabled: true,
        testLength: 30,
        totalPages: 6,
      }),
    ).toEqual({
      screen: { id: "intermission", nextPageIndex: 3, type: 0 },
      type: "intermission",
    });
  });

  it("continues past ten answers when the starter rollout is not active", () => {
    expect(
      getNextQuestionStep({
        currentPage: 2,
        isReviewMode: false,
        starterCheckpointEnabled: false,
        testLength: 30,
        totalPages: 6,
      }),
    ).toEqual({
      screen: { id: "questions", currentPage: 3 },
      type: "questions",
    });
  });
});
