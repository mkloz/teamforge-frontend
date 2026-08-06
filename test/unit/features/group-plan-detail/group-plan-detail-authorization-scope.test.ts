import { describe, expect, it } from "vitest";

import { buildGroupPlanDetailAuthorizationScope } from "@/features/group-plan-detail/hooks/use-group-plan-detail";
import {
  onboardingProductStateSchema,
  productCapabilityValues,
} from "@/shared/schemas/onboarding-product-state";

describe("group-plan detail authorization scope", () => {
  it("changes when preview rollout or capability decisions change", () => {
    const allowed = createProductState({
      introductoryAccess: "intro-v1",
      requestPlaceAllowed: false,
      viewPreviewAllowed: true,
    });
    const rolloutChanged = createProductState({
      introductoryAccess: "intro-v2",
      requestPlaceAllowed: false,
      viewPreviewAllowed: true,
    });
    const accessRevoked = createProductState({
      introductoryAccess: "intro-v1",
      requestPlaceAllowed: false,
      viewPreviewAllowed: false,
    });

    expect(buildGroupPlanDetailAuthorizationScope(allowed)).not.toBe(
      buildGroupPlanDetailAuthorizationScope(rolloutChanged),
    );
    expect(buildGroupPlanDetailAuthorizationScope(allowed)).not.toBe(
      buildGroupPlanDetailAuthorizationScope(accessRevoked),
    );
  });
});

function createProductState({
  introductoryAccess,
  requestPlaceAllowed,
  viewPreviewAllowed,
}: {
  introductoryAccess: string;
  requestPlaceAllowed: boolean;
  viewPreviewAllowed: boolean;
}) {
  const capabilities = Object.fromEntries(
    productCapabilityValues.map((capability) => [
      capability,
      {
        allowed: true,
        policyVersion: `${capability.toLowerCase()}-v1`,
      },
    ]),
  );
  capabilities.VIEW_PUBLIC_GROUP_PLAN = {
    allowed: viewPreviewAllowed,
    policyVersion: "preview-capability-v1",
    ...(viewPreviewAllowed ? {} : { reasonCode: "FULL_ASSESSMENT_REQUIRED" }),
  };
  capabilities.REQUEST_PLACE = {
    allowed: requestPlaceAllowed,
    policyVersion: "request-capability-v1",
    ...(requestPlaceAllowed ? {} : { reasonCode: "FULL_ASSESSMENT_REQUIRED" }),
  };

  return onboardingProductStateSchema.parse({
    policyVersion: "product-v1",
    authorizationPolicyVersion: "authorization-v1",
    minimumCompatibleClientPolicyVersion: "client-v1",
    clientPolicy: {
      category: "COMPATIBLE",
      declaredVersion: "client-v1",
      treatmentEligible: true,
    },
    rollout: {
      recovery: "recovery-v1",
      introductoryAccess,
      starter: "starter-v1",
      education: "education-v1",
      stitchedScoring: "scoring-v1",
    },
    requirements: {
      minimumInterestCount: 10,
      minimumInterestCategoryCount: 2,
      fullFormVersion: "IPIP_30_V1",
    },
    milestones: {
      basicsComplete: true,
      interestsComplete: true,
      starterSatisfied: true,
      starterAnswersRetained: false,
      fullAssessmentAccepted: false,
      compatibilityCurrent: false,
      reviewableAssessmentResult: false,
      activeFullAttempt: false,
    },
    stage: "INTRODUCTORY",
    safeDefaultDestination: "EXPLORE",
    recommendedAction: {
      code: "COMPLETE_FULL_ASSESSMENT",
      routeCode: "ONBOARDING_PERSONALITY",
    },
    capabilities,
  });
}
