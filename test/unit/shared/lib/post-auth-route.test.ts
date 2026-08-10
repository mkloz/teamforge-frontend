import { describe, expect, it } from "vitest";

import { getProductStateRedirectPath } from "@/shared/lib/post-auth-route";
import { onboardingProductStateSchema } from "@/shared/schemas/onboarding-product-state";

const destinationPaths = [
  ["HOME", "/home"],
  ["EXPLORE", "/explore"],
  ["START_PLAN", "/plans/new"],
  ["ONBOARDING_PROFILE", "/onboarding/profile"],
  ["ONBOARDING_INTENT", "/onboarding/intent"],
  ["ONBOARDING_INTERESTS", "/onboarding/interests"],
  ["ONBOARDING_PERSONALITY", "/onboarding/personality"],
] as const;

describe("onboarding product-state routing", () => {
  it.each(
    destinationPaths,
  )("maps %s to %s", (safeDefaultDestination, expectedPath) => {
    expect(
      getProductStateRedirectPath({
        safeDefaultDestination,
      }),
    ).toBe(expectedPath);
  });

  it("rejects an incomplete capability projection", () => {
    expect(() =>
      onboardingProductStateSchema.parse({
        policyVersion: "onboarding-product-state-v1",
        authorizationPolicyVersion: "onboarding-authorization-v1",
        minimumCompatibleClientPolicyVersion: "onboarding-authorization-v1",
        rollout: {
          recovery: "recovery-v1:disabled",
          introductoryAccess: "introductory-access-v1:disabled",
          starter: "starter-v1:disabled",
          education: "education-v1:disabled",
          stitchedScoring: "stitched-scoring-v1:disabled",
        },
        requirements: {
          minimumInterestCount: 10,
          minimumInterestCategoryCount: 2,
          fullFormVersion: "IPIP_30_V1",
        },
        milestones: {
          basicsComplete: true,
          interestsComplete: true,
          starterSatisfied: false,
          starterAnswersRetained: false,
          fullAssessmentAccepted: false,
          compatibilityCurrent: false,
          reviewableAssessmentResult: false,
          activeFullAttempt: false,
        },
        stage: "INTRODUCTORY",
        safeDefaultDestination: "ONBOARDING_PERSONALITY",
        recommendedAction: {
          code: "COMPLETE_FULL_ASSESSMENT",
          routeCode: "ONBOARDING_PERSONALITY",
        },
        capabilities: {},
      }),
    ).toThrow(/clientPolicy/);
  });
});
