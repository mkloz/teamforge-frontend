import { createUser } from "@test/support/factories/user";
import { describe, expect, it } from "vitest";
import { getHomeViewer } from "@/features/home/lib/home-viewer";
import {
  type OnboardingProductState,
  onboardingProductStateSchema,
  productCapabilityValues,
} from "@/shared/schemas/onboarding-product-state";

const COMPLETE_MILESTONES: OnboardingProductState["milestones"] = {
  activeFullAttempt: false,
  basicsComplete: true,
  compatibilityCurrent: true,
  fullAssessmentAccepted: true,
  interestsComplete: true,
  reviewableAssessmentResult: false,
  starterAnswersRetained: true,
  starterSatisfied: true,
};

describe("getHomeViewer", () => {
  it("returns every unfinished setup task with specific instructions", () => {
    const viewer = getHomeViewer(
      createUser({
        age: null,
        city: null,
        emailVerified: false,
        gender: null,
      }),
      createProductState({
        basicsComplete: false,
        compatibilityCurrent: false,
        fullAssessmentAccepted: false,
        interestsComplete: false,
        starterAnswersRetained: false,
        starterSatisfied: false,
      }),
    );

    expect(viewer.setupSteps.map(({ id }) => id)).toEqual([
      "email",
      "basics",
      "bio",
      "avatar",
      "assessment",
      "interests",
    ]);
    expect(viewer.setupSteps[1]?.body).toContain("age, gender, and city");
    expect(viewer.setupSteps[4]?.body).toContain("10 starter questions");
    expect(viewer.setupSteps[5]?.body).toContain("10 interests across 2 areas");
    expect(viewer.setupCompletedCount).toBe(0);
  });

  it("turns the assessment task into a continuation after the starter", () => {
    const viewer = getHomeViewer(
      createUser({
        avatar: "/avatar.jpg",
        bio: "A short introduction",
        emailVerified: true,
        gender: "OTHER",
      }),
      createProductState({
        compatibilityCurrent: false,
        fullAssessmentAccepted: false,
      }),
    );

    expect(viewer.setupSteps).toHaveLength(1);
    expect(viewer.setupSteps[0]).toMatchObject({
      kind: "personality",
      label: "Continue assessment",
      title: "Finish your matching assessment",
    });
    expect(viewer.setupCompletedCount).toBe(5);
  });

  it("hides setup guidance once every requirement is ready", () => {
    const viewer = getHomeViewer(
      createUser({
        avatar: "/avatar.jpg",
        bio: "A short introduction",
        emailVerified: true,
        gender: "OTHER",
      }),
      createProductState(),
    );

    expect(viewer.setupSteps).toEqual([]);
    expect(viewer.nextStep).toBeNull();
    expect(viewer.setupCompletedCount).toBe(6);
  });
});

function createProductState(
  milestones: Partial<OnboardingProductState["milestones"]> = {},
): OnboardingProductState {
  const capabilities = Object.fromEntries(
    productCapabilityValues.map((capability) => [
      capability,
      { allowed: true as const, policyVersion: "test-v1" },
    ]),
  );

  return onboardingProductStateSchema.parse({
    authorizationPolicyVersion: "test-v1",
    capabilities,
    clientPolicy: {
      category: "COMPATIBLE",
      declaredVersion: "test-v1",
      treatmentEligible: true,
    },
    milestones: { ...COMPLETE_MILESTONES, ...milestones },
    minimumCompatibleClientPolicyVersion: "test-v1",
    policyVersion: "test-v1",
    recommendedAction: {
      code: "NONE",
      routeCode: "HOME",
    },
    requirements: {
      fullFormVersion: "IPIP_30_V1",
      minimumInterestCategoryCount: 2,
      minimumInterestCount: 10,
    },
    rollout: {
      education: "education-v1",
      introductoryAccess: "introductory-v1",
      recovery: "recovery-v1",
      starter: "starter-v1",
      stitchedScoring: "stitched-v1",
    },
    safeDefaultDestination: "HOME",
    stage: "MATCHING_READY",
  });
}
