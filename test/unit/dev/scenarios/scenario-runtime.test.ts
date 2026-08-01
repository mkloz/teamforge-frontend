import { describe, expect, it } from "vitest";
import { ScenarioController } from "@/dev/scenarios/runtime/scenario-controller";
import { handleScenarioRequest } from "@/dev/scenarios/runtime/scenario-handler";
import { resolveScenarioMediaUrl } from "@/dev/scenarios/runtime/scenario-media";
import { groupPlanDetailSchema } from "@/features/group-plan-detail/schemas/group-plan-detail.schema";
import { homeGroupSchema } from "@/features/home/schemas/home-group.schema";
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
import {
  personalityAssessmentCapabilitiesSchema,
  personalityAssessmentStateSchema,
} from "@/shared/schemas/personality-assessment";
import {
  paginatedContainmentsSchema,
  paginatedEnforcementNoticesSchema,
  paginatedReportsSchema,
} from "@/shared/schemas/safety";

function createController(id = "standard") {
  return new ScenarioController({ id, overlays: [], persona: null });
}

function apiRequest(path: string, init?: RequestInit) {
  return new Request(`http://localhost:6969/api/v1/${path}`, init);
}

describe("scenario runtime", () => {
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
