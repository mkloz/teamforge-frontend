import { describe, expect, it } from "vitest";

import {
  buildCreateActivityInput,
  buildForgeActivityInput,
} from "@/features/forge/lib/forge-activity-builders";
import {
  createActivityInputSchema,
  forgeActivityInputSchema,
} from "@/shared/schemas";
import { createAutoForgeExecutionInput } from "../../../../factories/forge-execution";
import { createInterest, createUser } from "../../../../factories/user";

describe("forge activity builders", () => {
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
      planCostAmount: "12.50",
      planCostDetails: "  Ticket at the door  ",
      selectedActivity: "tech",
    });

    const forgeInput = buildForgeActivityInput(input);

    expect(forgeActivityInputSchema.safeParse(forgeInput).success).toBe(true);
    expect(forgeInput).toMatchObject({
      groupDescription: "Useful people only",
      groupName: "Tool crew",
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
});
