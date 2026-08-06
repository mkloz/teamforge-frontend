import { describe, expect, it } from "vitest";

import {
  groupPlanDetailResponseSchema,
  isRichGroupPlanDetail,
} from "@/features/group-plan-detail/schemas/group-plan-detail.schema";

const introductoryDetail = {
  type: "INTRODUCTORY_GROUP_DETAIL",
  group: {
    id: "group-1",
    activeMembersCount: 3,
    maxMembers: 6,
  },
  activity: {
    interests: [{ name: "Walking", slug: "walking" }],
  },
  plan: {
    category: "OUTDOORS",
    cost: "FREE",
    locationMode: "IN_PERSON",
    scheduleMode: "FIXED",
  },
  interestFitPercentage: 74,
} as const;

describe("introductory group-plan detail schema", () => {
  it("accepts only the minimized preview projection", () => {
    expect(groupPlanDetailResponseSchema.parse(introductoryDetail)).toEqual(
      introductoryDetail,
    );
    expect(isRichGroupPlanDetail(introductoryDetail)).toBe(false);
  });

  it("rejects member or precise-location leakage", () => {
    expect(() =>
      groupPlanDetailResponseSchema.parse({
        ...introductoryDetail,
        group: {
          ...introductoryDetail.group,
          name: "Saturday walkers",
        },
      }),
    ).toThrow(/Unrecognized key/);

    expect(() =>
      groupPlanDetailResponseSchema.parse({
        ...introductoryDetail,
        members: [{ userId: "user-2" }],
      }),
    ).toThrow(/Unrecognized key/);

    expect(() =>
      groupPlanDetailResponseSchema.parse({
        ...introductoryDetail,
        plan: {
          ...introductoryDetail.plan,
          dateTime: "2026-08-08T10:00:00.000Z",
        },
      }),
    ).toThrow(/Unrecognized key/);
  });
});
