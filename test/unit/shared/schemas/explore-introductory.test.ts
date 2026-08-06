import { describe, expect, it } from "vitest";

import {
  exploreFeedItemSchema,
  introductoryExploreGroupSchema,
} from "@/shared/schemas";

const introductoryGroup = {
  activeMembersCount: 2,
  activity: {
    interests: [{ name: "Photography", slug: "photography" }],
  },
  id: "intro-group",
  interestFitPercentage: 80,
  maxMembers: 6,
  plan: {
    category: "ARTS",
    cost: "FREE",
    locationMode: "IN_PERSON",
    scheduleMode: "FIXED",
  },
};

describe("introductory explore schema", () => {
  it("accepts the minimized introductory feed discriminator", () => {
    expect(
      exploreFeedItemSchema.parse({
        group: introductoryGroup,
        type: "INTRODUCTORY_GROUP",
      }),
    ).toMatchObject({
      group: { id: "intro-group", interestFitPercentage: 80 },
      type: "INTRODUCTORY_GROUP",
    });
  });

  it("rejects rich member and compatibility fields", () => {
    expect(() =>
      introductoryExploreGroupSchema.parse({
        ...introductoryGroup,
        compatibility: { total: 0.8 },
        members: [{ id: "private-member", name: "Private member" }],
      }),
    ).toThrow(/Unrecognized key/);

    expect(() =>
      introductoryExploreGroupSchema.parse({
        ...introductoryGroup,
        description: "A public photography walk.",
        name: "City photographers",
      }),
    ).toThrow(/Unrecognized key/);
  });
});
