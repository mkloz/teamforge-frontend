import { describe, expect, it } from "vitest";
import { ScenarioController } from "@/dev/scenarios/runtime/scenario-controller";
import { handleScenarioRequest } from "@/dev/scenarios/runtime/scenario-handler";
import { resolveScenarioMediaUrl } from "@/dev/scenarios/runtime/scenario-media";
import { buildScenarioWorld } from "@/dev/scenarios/world/build-scenario-world";
import { groupPlanDetailSchema } from "@/features/group-plan-detail/schemas/group-plan-detail.schema";
import { homeGroupSchema } from "@/features/home/schemas/home-group.schema";
import { operatorQueueHealthSchema } from "@/features/operator/schemas/operator-queue-health.schemas";
import {
  createPaginatedSchema,
  exploreFeedItemSchema,
  exploreViewInsightSchema,
  friendshipApiSchema,
  fullUserResponseSchema,
  notificationPreferencesSchema,
  publicFriendSummaryApiSchema,
  viewerProfileSchema,
} from "@/shared/schemas";
import { onboardingProductStateSchema } from "@/shared/schemas/onboarding-product-state";
import {
  personalityAssessmentCapabilitiesSchema,
  personalityAssessmentStateSchema,
} from "@/shared/schemas/personality-assessment";
import {
  containmentContestSchema,
  containmentSchema,
  enforcementNoticeSchema,
  moderationAppealSchema,
  outcomeReviewRequestSchema,
  paginatedContainmentsSchema,
  paginatedEnforcementNoticesSchema,
  paginatedReportsSchema,
  reportSummarySchema,
} from "@/shared/schemas/safety";

function createController(id = "standard", overlays: readonly string[] = []) {
  return new ScenarioController({ id, overlays, persona: null });
}

function apiRequest(path: string, init?: RequestInit) {
  return new Request(`http://localhost:6969/api/v1/${path}`, init);
}

describe("scenario runtime", () => {
  it("keeps the standard personality type aligned with its displayed dimensions", () => {
    const world = buildScenarioWorld({
      id: "onboarding-personality-result",
      overlays: [],
      persona: null,
    });
    const viewer = world.entities.users[world.viewerId ?? ""];

    expect(viewer).toBeDefined();
    if (!viewer) return;

    const dimensionScores = [
      100 - (viewer.oceanE ?? 50),
      viewer.oceanO ?? 50,
      viewer.oceanA ?? 50,
      100 - (viewer.oceanC ?? 50),
    ];
    const derivedType = [
      dimensionScores[0] < 50 ? "E" : "I",
      dimensionScores[1] < 50 ? "S" : "N",
      dimensionScores[2] < 50 ? "T" : "F",
      dimensionScores[3] < 50 ? "J" : "P",
    ].join("");

    expect(derivedType).toBe(viewer.personalityType);
    expect(dimensionScores[0]).toBe(44);
  });

  it("holds a scoped loading request until the fault is released", async () => {
    const controller = createController("explore-loading");
    const pendingResponse = handleScenarioRequest(
      controller,
      apiRequest("explore/feed?page=1&limit=24"),
    );

    await Promise.resolve();
    expect(controller.requests).toEqual([
      { method: "GET", pathname: "explore/feed", status: 102 },
    ]);

    expect(
      controller.releaseFaults({ method: "GET", pathname: "explore/feed" }),
    ).toEqual({ releasedFaultCount: 1, releasedRequestCount: 1 });
    const response = await pendingResponse;

    expect(response.status).toBe(200);
    expect(controller.requests).toEqual([
      { method: "GET", pathname: "explore/feed", status: 200 },
    ]);
  });

  it("scopes faults by pathname and query parameters", async () => {
    const controller = createController("explore-pagination-loading");
    const firstPage = await handleScenarioRequest(
      controller,
      apiRequest("explore/feed?page=1&limit=24"),
    );
    const pendingSecondPage = handleScenarioRequest(
      controller,
      apiRequest("explore/feed?page=2&limit=24"),
    );

    expect((await firstPage.json()).meta).toMatchObject({
      currentPage: 1,
      totalPages: 2,
    });
    await Promise.resolve();
    expect(controller.requests.at(-1)).toEqual({
      method: "GET",
      pathname: "explore/feed",
      status: 102,
    });

    controller.releaseFaults({ method: "GET", pathname: "explore/feed" });
    const secondPage = await pendingSecondPage;
    expect((await secondPage.json()).meta).toMatchObject({
      currentPage: 2,
      totalPages: 2,
    });
  });

  it("keeps a partial fault isolated from unrelated requests", async () => {
    const controller = createController("home-recommendations-error");
    const [viewerResponse, exploreResponse] = await Promise.all([
      handleScenarioRequest(controller, apiRequest("users/me")),
      handleScenarioRequest(controller, apiRequest("explore/feed?limit=24")),
    ]);

    expect(viewerResponse.status).toBe(200);
    expect(exploreResponse.status).toBe(403);
  });

  it("can release a scoped failure before a successful retry", async () => {
    const controller = createController("home-recommendations-recovery");
    const failedResponse = await handleScenarioRequest(
      controller,
      apiRequest("explore/feed?limit=24"),
    );

    expect(failedResponse.status).toBe(403);
    controller.releaseFaults({ method: "GET", pathname: "explore/feed" });

    const recoveredResponse = await handleScenarioRequest(
      controller,
      apiRequest("explore/feed?limit=24"),
    );
    expect(recoveredResponse.status).toBe(200);
  });

  it("projects onboarding personality state and capabilities", async () => {
    const controller = createController("onboarding-incomplete");
    const [stateResponse, capabilitiesResponse] = await Promise.all([
      handleScenarioRequest(
        controller,
        apiRequest("users/me/personality-assessment"),
      ),
      handleScenarioRequest(
        controller,
        apiRequest("users/me/personality-assessment/capabilities"),
      ),
    ]);

    expect(
      personalityAssessmentStateSchema.parse(await stateResponse.json()),
    ).toMatchObject({ current: null, draft: null, publicProfile: null });
    expect(
      personalityAssessmentCapabilitiesSchema.parse(
        await capabilitiesResponse.json(),
      ).dynamic,
    ).toMatchObject({ onboardingUse: "ENABLED", pageSize: 5 });
  });

  it.each([
    "onboarding-personality",
    "onboarding-interests",
  ])("keeps %s in the first-run onboarding state", async (scenarioId) => {
    const controller = createController(scenarioId);
    const [viewerResponse, productStateResponse, assessmentResponse] =
      await Promise.all([
        handleScenarioRequest(controller, apiRequest("users/me")),
        handleScenarioRequest(
          controller,
          apiRequest("onboarding/product-state"),
        ),
        handleScenarioRequest(
          controller,
          apiRequest("users/me/personality-assessment"),
        ),
      ]);
    const viewer = fullUserResponseSchema.parse(await viewerResponse.json());
    const productState = onboardingProductStateSchema.parse(
      await productStateResponse.json(),
    );
    const assessment = personalityAssessmentStateSchema.parse(
      await assessmentResponse.json(),
    );

    expect(viewer.interests).toEqual([]);
    expect(viewer.personalitySetupComplete).toBe(false);
    expect(assessment.current).toBeNull();
    expect(productState).toMatchObject({
      safeDefaultDestination: "ONBOARDING_INTERESTS",
      milestones: {
        fullAssessmentAccepted: false,
        interestsComplete: false,
      },
    });
  });

  it.each([
    "onboarding-personality-result",
    "onboarding-interests-edit",
  ])("keeps %s in the established edit state", async (scenarioId) => {
    const controller = createController(scenarioId);
    const [productStateResponse, assessmentResponse] = await Promise.all([
      handleScenarioRequest(controller, apiRequest("onboarding/product-state")),
      handleScenarioRequest(
        controller,
        apiRequest("users/me/personality-assessment"),
      ),
    ]);
    const productState = onboardingProductStateSchema.parse(
      await productStateResponse.json(),
    );
    const assessment = personalityAssessmentStateSchema.parse(
      await assessmentResponse.json(),
    );

    expect(productState.safeDefaultDestination).toBe("HOME");
    expect(assessment.current).not.toBeNull();
  });

  it("moves from profile basics to a persisted intent or skip step", async () => {
    const controller = createController("onboarding-incomplete");
    await handleScenarioRequest(
      controller,
      apiRequest("users/me", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ age: 27, city: "London", gender: "FEMALE" }),
      }),
    );

    const intentStateResponse = await handleScenarioRequest(
      controller,
      apiRequest("onboarding/product-state"),
    );
    const intentState = onboardingProductStateSchema.parse(
      await intentStateResponse.json(),
    );
    expect(intentState.safeDefaultDestination).toBe("ONBOARDING_INTENT");
    expect(intentState.milestones.intentStepComplete).toBe(false);

    await handleScenarioRequest(
      controller,
      apiRequest("users/me", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ onboardingIntent: "BRING_A_PLAN" }),
      }),
    );
    const selectedStateResponse = await handleScenarioRequest(
      controller,
      apiRequest("onboarding/product-state"),
    );
    const selectedState = onboardingProductStateSchema.parse(
      await selectedStateResponse.json(),
    );
    expect(selectedState.presentation.firstMission).toBe(
      "CREATE_INTRODUCTORY_PLAN",
    );

    await handleScenarioRequest(
      controller,
      apiRequest("users/me", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ onboardingIntent: null }),
      }),
    );
    const skippedStateResponse = await handleScenarioRequest(
      controller,
      apiRequest("onboarding/product-state"),
    );
    const skippedState = onboardingProductStateSchema.parse(
      await skippedStateResponse.json(),
    );
    expect(skippedState.safeDefaultDestination).not.toBe("ONBOARDING_INTENT");
    expect(skippedState.milestones.intentStepComplete).toBe(true);
  });

  it("projects an introductory practice treatment without matching access", async () => {
    const controller = createController("onboarding-practice");
    const response = await handleScenarioRequest(
      controller,
      apiRequest("onboarding/product-state"),
    );
    const state = onboardingProductStateSchema.parse(await response.json());

    expect(state).toMatchObject({
      rollout: {
        education: "education-v1",
        introductoryAccess: "introductory-access-v1",
      },
      safeDefaultDestination: "EXPLORE",
      stage: "INTRODUCTORY",
    });
    expect(state.capabilities.BROWSE_PUBLIC_CONTENT.allowed).toBe(true);
    expect(state.capabilities.USE_ONBOARDING_PRACTICE.allowed).toBe(true);
    expect(state.capabilities.CREATE_PLAN).toMatchObject({
      allowed: false,
      reasonCode: "FULL_ASSESSMENT_REQUIRED",
    });
  });

  it("accepts onboarding observations without an unmatched request", async () => {
    const controller = createController("onboarding-practice");
    const [events, exposures] = await Promise.all([
      handleScenarioRequest(
        controller,
        apiRequest("onboarding/events", { method: "POST" }),
      ),
      handleScenarioRequest(
        controller,
        apiRequest("onboarding/exposures", { method: "POST" }),
      ),
    ]);

    expect(events.status).toBe(201);
    expect(exposures.status).toBe(201);
    expect(await events.json()).toEqual({ accepted: 1 });
    expect(await exposures.json()).toEqual({ accepted: 1 });
  });

  it("projects schema-valid mutual and public friends", async () => {
    const controller = createController("profile-public");
    const [commonResponse, publicResponse] = await Promise.all([
      handleScenarioRequest(
        controller,
        apiRequest("friends/common/scenario-user-ava?limit=50"),
      ),
      handleScenarioRequest(
        controller,
        apiRequest("friends/public/scenario-user-ava?limit=50"),
      ),
    ]);

    expect(
      createPaginatedSchema(friendshipApiSchema).parse(
        await commonResponse.json(),
      ).items,
    ).not.toHaveLength(0);
    expect(
      createPaginatedSchema(publicFriendSummaryApiSchema).parse(
        await publicResponse.json(),
      ).items,
    ).not.toHaveLength(0);
  });

  it("records deterministic offline failures without reaching a backend", async () => {
    const controller = createController("network-offline");

    await expect(
      handleScenarioRequest(controller, apiRequest("users/me")),
    ).rejects.toThrow("Scenario Mode simulated a network failure.");
    expect(controller.requests).toEqual([
      { method: "GET", pathname: "users/me", status: 0 },
    ]);
  });

  it("projects a schema-valid current user from the world", async () => {
    const response = await handleScenarioRequest(
      createController(),
      apiRequest("users/me"),
    );

    expect(response.status).toBe(200);
    expect(fullUserResponseSchema.parse(await response.json()).name).toBe(
      "Quinn Hart",
    );
  });

  it("keeps stateful preference mutations across refetches", async () => {
    const controller = createController();

    const mutation = await handleScenarioRequest(
      controller,
      apiRequest("settings/me", {
        body: JSON.stringify({ notifyMessages: false }),
        headers: { "content-type": "application/json" },
        method: "PATCH",
      }),
    );
    expect(
      notificationPreferencesSchema.parse(await mutation.json()),
    ).toMatchObject({
      notifyMessages: false,
    });

    const refetch = await handleScenarioRequest(
      controller,
      apiRequest("settings/me"),
    );
    expect(
      notificationPreferencesSchema.parse(await refetch.json()),
    ).toMatchObject({
      notifyMessages: false,
    });
  });

  it("projects one coherent world across home, explore, group, and profile", async () => {
    const controller = createController();
    const [homeResponse, exploreResponse, groupResponse, profileResponse] =
      await Promise.all([
        handleScenarioRequest(
          controller,
          apiRequest("groups/home-summary?limit=100"),
        ),
        handleScenarioRequest(controller, apiRequest("explore/feed?limit=24")),
        handleScenarioRequest(
          controller,
          apiRequest("groups/scenario-group-basketball/detail"),
        ),
        handleScenarioRequest(
          controller,
          apiRequest("users/scenario-user-quinn"),
        ),
      ]);

    const home = createPaginatedSchema(homeGroupSchema).parse(
      await homeResponse.json(),
    );
    const explore = createPaginatedSchema(exploreFeedItemSchema)
      .extend({ insight: exploreViewInsightSchema })
      .safeParse(await exploreResponse.json());
    const group = groupPlanDetailSchema.parse(await groupResponse.json());
    const profile = viewerProfileSchema.parse(await profileResponse.json());

    expect(home.items.map((item) => item.id)).toContain(group.group.id);
    expect(explore.success).toBe(true);
    expect(profile.id).toBe(group.viewer.userId);
    expect(group.members).toHaveLength(3);
  });

  it("removes direct relationships from the activity-empty world", async () => {
    const response = await handleScenarioRequest(
      createController("activity-empty"),
      apiRequest("friends?limit=50"),
    );

    expect(response.status).toBe(200);
    expect((await response.json()).items).toEqual([]);
  });

  it("projects privacy-limited Explore cards for every introductory intent", async () => {
    const payloads = await Promise.all(
      [
        "onboarding-intent-create",
        "onboarding-intent-explore",
        "onboarding-intent-skipped",
      ].map(async (scenarioId) => {
        const controller = createController(scenarioId);
        const response = await handleScenarioRequest(
          controller,
          apiRequest("explore/feed?limit=24"),
        );
        return createPaginatedSchema(exploreFeedItemSchema)
          .extend({ insight: exploreViewInsightSchema })
          .parse(await response.json());
      }),
    );

    for (const payload of payloads) {
      expect(payload.items.length).toBeGreaterThan(0);
      expect(
        payload.items.every(({ type }) => type === "INTRODUCTORY_GROUP"),
      ).toBe(true);
      expect(
        payload.items.some(
          (item) =>
            item.type === "INTRODUCTORY_GROUP" &&
            item.group.interestFitPercentage > 0,
        ),
      ).toBe(true);
    }
  });

  it("fails closed for an unhandled request", async () => {
    const controller = createController();
    const response = await handleScenarioRequest(
      controller,
      apiRequest("unknown/endpoint"),
    );

    expect(response.status).toBe(501);
    expect(await response.json()).toMatchObject({
      error: "SCENARIO_UNMATCHED_REQUEST",
    });
    expect(controller.requests).toEqual([
      { method: "GET", pathname: "unknown/endpoint", status: 501 },
    ]);
  });

  it("projects versioned queue-health standard, empty, and partial states", async () => {
    const responses = await Promise.all(
      [
        "admin-queue-health-standard",
        "admin-queue-health-empty",
        "admin-queue-health-partial",
      ].map(async (scenarioId) => {
        const response = await handleScenarioRequest(
          createController(scenarioId),
          apiRequest("operator/moderation/queue-health"),
        );
        return operatorQueueHealthSchema.parse(await response.json());
      }),
    );

    expect(responses[0]).toMatchObject({
      backlog: 27,
      dataQuality: "COMPLETE",
    });
    expect(responses[1]).toMatchObject({
      backlog: 0,
      oldestCaseAgeSeconds: null,
    });
    expect(responses[2]).toMatchObject({ backlog: 27, dataQuality: "PARTIAL" });
  });

  it("fails queue health closed for restricted and unavailable scenarios", async () => {
    const [restricted, unavailable] = await Promise.all([
      handleScenarioRequest(
        createController("admin-queue-health-restricted"),
        apiRequest("operator/moderation/queue-health"),
      ),
      handleScenarioRequest(
        createController("admin-queue-health-error"),
        apiRequest("operator/moderation/queue-health"),
      ),
    ]);

    expect(restricted.status).toBe(403);
    expect(unavailable.status).toBe(503);
  });

  it("projects schema-valid safety collections", async () => {
    const controller = createController("safety-active");
    const [reportsResponse, noticesResponse, containmentsResponse] =
      await Promise.all([
        handleScenarioRequest(controller, apiRequest("reports?limit=50")),
        handleScenarioRequest(
          controller,
          apiRequest("safety/enforcement-notices?limit=50"),
        ),
        handleScenarioRequest(
          controller,
          apiRequest("safety/containments?limit=50"),
        ),
      ]);

    expect(
      paginatedReportsSchema.parse(await reportsResponse.json()).items,
    ).toHaveLength(1);
    expect(
      paginatedEnforcementNoticesSchema.parse(await noticesResponse.json())
        .items,
    ).toHaveLength(1);
    expect(
      paginatedContainmentsSchema.parse(await containmentsResponse.json())
        .items,
    ).toHaveLength(1);
  });

  it("projects schema-valid safety details without unmatched requests", async () => {
    const controller = createController("safety-active");
    const [
      reportResponse,
      reviewsResponse,
      noticeResponse,
      containmentResponse,
    ] = await Promise.all([
      handleScenarioRequest(
        controller,
        apiRequest("reports/scenario-report-one"),
      ),
      handleScenarioRequest(
        controller,
        apiRequest("reports/scenario-report-one/outcome-review-requests"),
      ),
      handleScenarioRequest(
        controller,
        apiRequest("safety/enforcement-notices/scenario-enforcement-one"),
      ),
      handleScenarioRequest(
        controller,
        apiRequest("safety/containments/scenario-containment-one"),
      ),
    ]);

    expect(reportSummarySchema.parse(await reportResponse.json()).id).toBe(
      "scenario-report-one",
    );
    expect(
      outcomeReviewRequestSchema.array().parse(await reviewsResponse.json()),
    ).toEqual([]);
    expect(enforcementNoticeSchema.parse(await noticeResponse.json()).id).toBe(
      "scenario-enforcement-one",
    );
    expect(containmentSchema.parse(await containmentResponse.json()).id).toBe(
      "scenario-containment-one",
    );
    expect(controller.requests.every(({ status }) => status !== 501)).toBe(
      true,
    );
  });

  it("persists safety review mutations in the synthetic world", async () => {
    const controller = createController("safety-active");
    const request = (path: string) =>
      apiRequest(path, {
        body: JSON.stringify({
          reason: "Please review this scenario decision.",
        }),
        headers: { "content-type": "application/json" },
        method: "POST",
      });

    const review = outcomeReviewRequestSchema.parse(
      await (
        await handleScenarioRequest(
          controller,
          request("reports/scenario-report-one/outcome-review-requests"),
        )
      ).json(),
    );
    const appeal = moderationAppealSchema.parse(
      await (
        await handleScenarioRequest(
          controller,
          request(
            "safety/enforcement-notices/scenario-enforcement-one/appeals",
          ),
        )
      ).json(),
    );
    const contest = containmentContestSchema.parse(
      await (
        await handleScenarioRequest(
          controller,
          request("safety/containments/scenario-containment-one/contests"),
        )
      ).json(),
    );

    expect(review.status).toBe("RECEIVED");
    expect(appeal.status).toBe("RECEIVED");
    expect(contest.status).toBe("RECEIVED");

    const [reviewsResponse, noticeResponse, containmentResponse] =
      await Promise.all([
        handleScenarioRequest(
          controller,
          apiRequest("reports/scenario-report-one/outcome-review-requests"),
        ),
        handleScenarioRequest(
          controller,
          apiRequest("safety/enforcement-notices/scenario-enforcement-one"),
        ),
        handleScenarioRequest(
          controller,
          apiRequest("safety/containments/scenario-containment-one"),
        ),
      ]);

    expect(
      outcomeReviewRequestSchema.array().parse(await reviewsResponse.json()),
    ).toHaveLength(1);
    expect(
      enforcementNoticeSchema.parse(await noticeResponse.json()).appeal,
    ).toMatchObject({ status: "RECEIVED" });
    expect(
      containmentSchema.parse(await containmentResponse.json()).contest,
    ).toMatchObject({ status: "RECEIVED" });
  });

  it("keeps scenario-owned seed media deterministic and offline", () => {
    const path =
      "/uploads/seed-media/template-covers/sports/pickup/card-384.webp";
    const first = resolveScenarioMediaUrl(path);

    expect(first).toBe(resolveScenarioMediaUrl(path));
    expect(first).toMatch(/^data:image\/svg\+xml,/u);
    expect(resolveScenarioMediaUrl("/avatars/avatar-2.jpg")).toBeNull();
  });

  it("does not create a viewer for signed-out scenarios", async () => {
    const response = await handleScenarioRequest(
      createController("signed-out"),
      apiRequest("users/me"),
    );

    expect(response.status).toBe(401);
  });
});
