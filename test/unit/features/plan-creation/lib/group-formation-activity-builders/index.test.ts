import { createAutomaticGroupFormationExecutionInput } from "@test/support/factories/group-formation-execution";
import { createInterest, createUser } from "@test/support/factories/user";
import { describe, expect, it } from "vitest";
import {
  buildCreateActivityInput,
  buildGroupFormationActivityInput,
} from "@/features/plan-creation/lib/group-formation-activity-builders";
import {
  createActivityInputSchema,
  groupFormationActivityInputSchema,
} from "@/shared/schemas";

describe("planCreation activity builders", () => {
  const longText = "x".repeat(1200);

  it("builds backend-valid create activity input with bounded plan coordinates", () => {
    const input = createAutomaticGroupFormationExecutionInput({
      selectedActivity: "TECH",
      visibility: "PUBLIC",
    });
    const user = createUser({
      city: " London ",
      interests: [
        createInterest("Coding", ["AI"], { id: "coding" }),
        createInterest("Restaurants", [], { id: "restaurants" }),
      ],
      locationLat: 40,
      locationLng: -73,
    });

    const activityInput = buildCreateActivityInput(user, input, "AUTO");

    expect(createActivityInputSchema.safeParse(activityInput).success).toBe(
      true,
    );
    expect(activityInput).toMatchObject({
      access: "OPEN",
      city: "London",
      groupFormationMode: "AUTO",
      interestIds: ["coding"],
      locationLat: 51.5072,
      locationLng: -0.1276,
      title: "TECH",
      visibility: "PUBLIC",
    });
  });

  it("falls back to user coordinates when plan coordinates are missing or invalid", () => {
    const user = createUser({
      interests: [createInterest("Coding", [], { id: "coding" })],
      locationLat: 40,
      locationLng: -73,
    });

    expect(
      buildCreateActivityInput(
        user,
        createAutomaticGroupFormationExecutionInput({
          planLocationLat: 91,
          planLocationLng: -0.1276,
          selectedActivity: "Coding",
        }),
        "MANUAL",
      ),
    ).toMatchObject({
      groupFormationMode: "MANUAL",
      locationLat: 40,
      locationLng: -73,
    });
  });

  it("builds backend-valid planCreation payloads with normalized category, location, cost, and group size", () => {
    const input = createAutomaticGroupFormationExecutionInput({
      autoMaxSize: 7,
      autoMinSize: 4,
      groupDescription: "  Useful people only  ",
      groupName: "  Tool crew  ",
      planCost: "PAID",
      planCostAmount: "£12.50",
      planCostDetails: "  Ticket at the door  ",
      selectedActivity: "tech",
    });

    const planCreationInput = buildGroupFormationActivityInput(input);

    expect(
      groupFormationActivityInputSchema.safeParse(planCreationInput).success,
    ).toBe(true);
    expect(planCreationInput.plan).not.toHaveProperty("scheduleMode");
    expect(planCreationInput).toMatchObject({
      groupDescription: "Useful people only",
      groupName: "Tool crew",
      matchingPreferences: {
        freshPerspectives: 50,
        maxDistanceKm: 40,
        networkReach: 40,
        sharedGround: 70,
      },
      groupSize: 6,
      plan: {
        category: "TECH",
        cost: "PAID",
        costAmount: 12.5,
        costDetails: "Ticket at the door",
        dateTime: new Date("2099-01-02T18:30").toISOString(),
        location: "Makers Cafe",
        locationLat: 51.5072,
        locationLng: -0.1276,
        locationMode: "IN_PERSON",
      },
    });
  });

  it("sends three group balance preferences for online plans", () => {
    const planCreationInput = buildGroupFormationActivityInput(
      createAutomaticGroupFormationExecutionInput({
        compatibilityWeight: 85,
        diversityWeight: 35,
        locationType: "ONLINE",
        maxDistanceKm: 80,
        networkReachWeight: 60,
        planLocation: "Findafew video room",
      }),
    );

    expect(
      groupFormationActivityInputSchema.safeParse(planCreationInput).success,
    ).toBe(true);
    expect(planCreationInput.matchingPreferences).toEqual({
      freshPerspectives: 35,
      networkReach: 60,
      sharedGround: 85,
    });
  });

  it("omits location and coordinates for TBD plans", () => {
    const planCreationInput = buildGroupFormationActivityInput(
      createAutomaticGroupFormationExecutionInput({
        locationType: "TBD",
        planLocation: "",
        planLocationLat: 51.5072,
        planLocationLng: -0.1276,
      }),
    );

    expect(
      groupFormationActivityInputSchema.safeParse(planCreationInput).success,
    ).toBe(true);
    expect(planCreationInput.plan.location).toBeNull();
    expect(planCreationInput.plan.locationLat).toBeUndefined();
    expect(planCreationInput.plan.locationLng).toBeUndefined();
  });

  it("bounds create activity text fields to backend schema limits", () => {
    const user = createUser({
      city: `  ${longText}  `,
      interests: [createInterest("Coding", [], { id: "coding" })],
    });
    const input = createAutomaticGroupFormationExecutionInput({
      groupDescription: `  ${longText}  `,
      selectedActivity: `  ${longText}  `,
    });

    const activityInput = buildCreateActivityInput(user, input, "AUTO");

    expect(createActivityInputSchema.safeParse(activityInput).success).toBe(
      true,
    );
    expect(activityInput.title).toHaveLength(140);
    expect(activityInput.description).toHaveLength(1000);
    expect(activityInput.city).toHaveLength(100);
  });

  it("bounds planCreation payload text and sanitizes persisted media refs", () => {
    const overlongManagedUpload = `https://assets.findafew.test/uploads/groups/${"a".repeat(2100)}`;
    const planCreationInput = buildGroupFormationActivityInput(
      createAutomaticGroupFormationExecutionInput({
        avatarImage: overlongManagedUpload,
        coverImage: overlongManagedUpload,
        groupDescription: `  ${longText}  `,
        groupName: `  ${longText}  `,
        planCost: "PAID",
        planCostAmount: "8",
        planCostDetails: `  ${longText}  `,
        planDescription: `  ${longText}  `,
        planLocation: `  ${longText}  `,
        planName: `  ${longText}  `,
      }),
    );

    expect(
      groupFormationActivityInputSchema.safeParse(planCreationInput).success,
    ).toBe(true);
    expect(planCreationInput.groupAvatar).toBeNull();
    expect(planCreationInput.groupDescription).toHaveLength(1000);
    expect(planCreationInput.groupName).toHaveLength(120);
    expect(planCreationInput.plan.coverImage).toBeNull();
    expect(planCreationInput.plan.costDetails).toHaveLength(250);
    expect(planCreationInput.plan.description).toHaveLength(1000);
    expect(planCreationInput.plan.location).toHaveLength(200);
    expect(planCreationInput.plan.title).toHaveLength(140);
  });

  it("preserves valid managed plan cover and avatar references", () => {
    const avatarImage =
      "https://assets.findafew.test/uploads/groups/avatar.png";
    const planCreationInput = buildGroupFormationActivityInput(
      createAutomaticGroupFormationExecutionInput({
        avatarImage,
        coverImage: "clay-tokens",
      }),
    );

    expect(
      groupFormationActivityInputSchema.safeParse(planCreationInput).success,
    ).toBe(true);
    expect(planCreationInput.groupAvatar).toBe(avatarImage);
    expect(planCreationInput.plan.coverImage).toBe("clay-tokens");
  });
});
