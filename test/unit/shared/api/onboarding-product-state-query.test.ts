import { apiRoute } from "@test/support/msw/api";
import { server } from "@test/support/msw/server";
import { HttpResponse, http } from "msw";
import { afterEach, describe, expect, it } from "vitest";

import {
  clearProjectionSensitiveCaches,
  ensureOnboardingProductState,
  getOnboardingProjectionScope,
} from "@/shared/api/onboarding-product-state-query";
import { appQueryClient } from "@/shared/api/query-client";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import {
  onboardingProductStateSchema,
  productCapabilityValues,
} from "@/shared/schemas/onboarding-product-state";

describe("onboarding projection cache boundary", () => {
  afterEach(() => {
    appQueryClient.clear();
  });

  it("changes scope across stage, rollout, and authorization decisions", () => {
    const baseline = createProductState();
    const stageChanged = createProductState({ stage: "MATCHING_READY" });
    const rolloutChanged = createProductState({
      introductoryAccess: "intro-v2",
    });
    const accessRevoked = createProductState({ browseAllowed: false });

    expect(getOnboardingProjectionScope(baseline)).not.toBe(
      getOnboardingProjectionScope(stageChanged),
    );
    expect(getOnboardingProjectionScope(baseline)).not.toBe(
      getOnboardingProjectionScope(rolloutChanged),
    );
    expect(getOnboardingProjectionScope(baseline)).not.toBe(
      getOnboardingProjectionScope(accessRevoked),
    );
  });

  it("purges every projection-sensitive surface without clearing unrelated data", () => {
    appQueryClient.setQueryData(["explore-feed", "session-a", "rich"], {
      pages: ["rich-feed"],
    });
    appQueryClient.setQueryData(["explore-groups", "session-a", "rich"], {
      pages: ["rich-groups"],
    });
    appQueryClient.setQueryData(
      ["home", "recommendations", "session-a", "rich"],
      ["rich-recommendation"],
    );
    appQueryClient.setQueryData(
      ["group-plan-detail", "group-a", "detail", "session-a", "rich"],
      { type: "RICH_GROUP_DETAIL" },
    );
    appQueryClient.setQueryData(APP_QUERY_KEYS.notifications.unreadCount, 3);

    clearProjectionSensitiveCaches();

    expect(
      appQueryClient.getQueriesData({ queryKey: APP_QUERY_KEYS.explore.feed }),
    ).toEqual([]);
    expect(
      appQueryClient.getQueriesData({
        queryKey: APP_QUERY_KEYS.explore.groups,
      }),
    ).toEqual([]);
    expect(
      appQueryClient.getQueriesData({
        queryKey: APP_QUERY_KEYS.home.recommendations,
      }),
    ).toEqual([]);
    expect(
      appQueryClient.getQueriesData({
        queryKey: APP_QUERY_KEYS.groupPlanDetail.all,
      }),
    ).toEqual([]);
    expect(
      appQueryClient.getQueryData(APP_QUERY_KEYS.notifications.unreadCount),
    ).toBe(3);
  });

  it("can preserve the failing surface while purging other projections", () => {
    const exploreKey = ["explore-feed", "session-a", "rich"];
    const recommendationsKey = ["home", "recommendations", "session-a", "rich"];
    appQueryClient.setQueryData(exploreKey, { pages: ["rich-feed"] });
    appQueryClient.setQueryData(recommendationsKey, ["rich-recommendation"]);

    clearProjectionSensitiveCaches({
      preserveHomeRecommendations: true,
    });

    expect(appQueryClient.getQueryData(exploreKey)).toBeUndefined();
    expect(appQueryClient.getQueryData(recommendationsKey)).toEqual([
      "rich-recommendation",
    ]);
  });

  it("waits for fresh product state after profile basics invalidate the cache", async () => {
    let productState = createProductState({
      safeDefaultDestination: "ONBOARDING_PROFILE",
    });
    let requestCount = 0;

    server.use(
      http.get(apiRoute("onboarding/product-state"), () => {
        requestCount += 1;
        return HttpResponse.json(productState);
      }),
    );

    await expect(ensureOnboardingProductState()).resolves.toMatchObject({
      safeDefaultDestination: "ONBOARDING_PROFILE",
    });

    productState = createProductState({
      safeDefaultDestination: "ONBOARDING_INTENT",
    });
    await appQueryClient.invalidateQueries({
      queryKey: APP_QUERY_KEYS.onboarding.productState,
    });

    await expect(ensureOnboardingProductState()).resolves.toMatchObject({
      safeDefaultDestination: "ONBOARDING_INTENT",
    });
    expect(requestCount).toBe(2);
  });
});

function createProductState({
  browseAllowed = true,
  introductoryAccess = "intro-v1",
  safeDefaultDestination,
  stage = "INTRODUCTORY",
}: {
  browseAllowed?: boolean;
  introductoryAccess?: string;
  safeDefaultDestination?:
    | "EXPLORE"
    | "HOME"
    | "ONBOARDING_INTENT"
    | "ONBOARDING_PROFILE";
  stage?: "INTRODUCTORY" | "MATCHING_READY";
} = {}) {
  const capabilities = Object.fromEntries(
    productCapabilityValues.map((capability) => [
      capability,
      {
        allowed: true,
        policyVersion: `${capability.toLowerCase()}-v1`,
      },
    ]),
  );
  capabilities.BROWSE_PUBLIC_CONTENT = {
    allowed: browseAllowed,
    policyVersion: "browse-v1",
    ...(browseAllowed ? {} : { reasonCode: "FULL_ASSESSMENT_REQUIRED" }),
  };

  return onboardingProductStateSchema.parse({
    authorizationPolicyVersion: "authorization-v1",
    capabilities,
    clientPolicy: {
      category: "COMPATIBLE",
      declaredVersion: "client-v1",
      treatmentEligible: true,
    },
    minimumCompatibleClientPolicyVersion: "client-v1",
    milestones: {
      activeFullAttempt: false,
      basicsComplete: true,
      compatibilityCurrent: stage === "MATCHING_READY",
      fullAssessmentAccepted: stage === "MATCHING_READY",
      interestsComplete: true,
      reviewableAssessmentResult: false,
      starterAnswersRetained: false,
      starterSatisfied: true,
    },
    policyVersion: "product-v1",
    recommendedAction: {
      code: stage === "MATCHING_READY" ? "NONE" : "COMPLETE_FULL_ASSESSMENT",
      routeCode: stage === "MATCHING_READY" ? "HOME" : "ONBOARDING_PERSONALITY",
    },
    requirements: {
      fullFormVersion: "IPIP_30_V1",
      minimumInterestCategoryCount: 2,
      minimumInterestCount: 10,
    },
    rollout: {
      education: "education-v1",
      introductoryAccess,
      recovery: "recovery-v1",
      starter: "starter-v1",
      stitchedScoring: "scoring-v1",
    },
    safeDefaultDestination:
      safeDefaultDestination ??
      (stage === "MATCHING_READY" ? "HOME" : "EXPLORE"),
    stage,
  });
}
