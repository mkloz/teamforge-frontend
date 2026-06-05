import { createAutoForgeExecutionInput } from "@test/support/factories/forge-execution";
import { createInterest, createUser } from "@test/support/factories/user";
import { describe, expect, it } from "vitest";
import {
  buildCreateActivityInput,
  buildForgeActivityInput,
} from "@/features/forge/lib/forge-activity-builders";
import {
  createActivityInputSchema,
  forgeActivityInputSchema,
} from "@/shared/schemas";

describe("forge activity builders", () => {
  const longText = "x".repeat(1200);

  it("builds backend-valid create activity input with bounded plan coordinates", () => {
    const input = createAutoForgeExecutionInput({
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
      forgeMode: "AUTO",
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
        createAutoForgeExecutionInput({
          planLocationLat: 91,
          planLocationLng: -0.1276,
          selectedActivity: "Coding",
        }),
        "MANUAL",
      ),
    ).toMatchObject({
      forgeMode: "MANUAL",
      locationLat: 40,
      locationLng: -73,
    });
  });

  it("builds backend-valid forge payloads with normalized category, location, cost, and group size", () => {
    const input = createAutoForgeExecutionInput({
      autoMaxSize: 7,
      autoMinSize: 4,
      groupDescription: "  Useful people only  ",
      groupName: "  Tool crew  ",
      planCost: "PAID",
      planCostAmount: "£12.50",
      planCostDetails: "  Ticket at the door  ",
      selectedActivity: "tech",
    });

    const forgeInput = buildForgeActivityInput(input);

    expect(forgeActivityInputSchema.safeParse(forgeInput).success).toBe(true);
    expect(forgeInput).toMatchObject({
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
    const forgeInput = buildForgeActivityInput(
      createAutoForgeExecutionInput({
        compatibilityWeight: 85,
        diversityWeight: 35,
        locationType: "ONLINE",
        maxDistanceKm: 80,
        networkReachWeight: 60,
        planLocation: "TeamForge video room",
      }),
    );

    expect(forgeActivityInputSchema.safeParse(forgeInput).success).toBe(true);
    expect(forgeInput.matchingPreferences).toEqual({
      freshPerspectives: 35,
      networkReach: 60,
      sharedGround: 85,
    });
  });

  it("omits location and coordinates for TBD plans", () => {
    const forgeInput = buildForgeActivityInput(
      createAutoForgeExecutionInput({
        locationType: "TBD",
        planLocation: "",
        planLocationLat: 51.5072,
        planLocationLng: -0.1276,
      }),
    );

    expect(forgeActivityInputSchema.safeParse(forgeInput).success).toBe(true);
    expect(forgeInput.plan.location).toBeNull();
    expect(forgeInput.plan.locationLat).toBeUndefined();
    expect(forgeInput.plan.locationLng).toBeUndefined();
  });

  it("bounds create activity text fields to backend schema limits", () => {
    const user = createUser({
      city: `  ${longText}  `,
      interests: [createInterest("Coding", [], { id: "coding" })],
    });
    const input = createAutoForgeExecutionInput({
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

  it("bounds forge payload text and sanitizes persisted media refs", () => {
    const overlongManagedUpload = `https://assets.teamforge.app/uploads/groups/${"a".repeat(2100)}`;
    const forgeInput = buildForgeActivityInput(
      createAutoForgeExecutionInput({
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

    expect(forgeActivityInputSchema.safeParse(forgeInput).success).toBe(true);
    expect(forgeInput.groupAvatar).toBeNull();
    expect(forgeInput.groupDescription).toHaveLength(1000);
    expect(forgeInput.groupName).toHaveLength(120);
    expect(forgeInput.plan.coverImage).toBeNull();
    expect(forgeInput.plan.costDetails).toHaveLength(250);
    expect(forgeInput.plan.description).toHaveLength(1000);
    expect(forgeInput.plan.location).toHaveLength(200);
    expect(forgeInput.plan.title).toHaveLength(140);
  });

  it("preserves valid managed plan cover and avatar references", () => {
    const avatarImage =
      "https://assets.teamforge.app/uploads/groups/avatar.png";
    const forgeInput = buildForgeActivityInput(
      createAutoForgeExecutionInput({
        avatarImage,
        coverImage: "clay-tokens",
      }),
    );

    expect(forgeActivityInputSchema.safeParse(forgeInput).success).toBe(true);
    expect(forgeInput.groupAvatar).toBe(avatarImage);
    expect(forgeInput.plan.coverImage).toBe("clay-tokens");
  });
});
