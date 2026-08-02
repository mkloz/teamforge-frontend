import { describe, expect, it } from "vitest";
import { normalizePlanSchedule } from "@/features/activity/hooks/group-identity/group-identity-form-state/normalizers";
import type { GroupIdentityFormValues } from "@/features/activity/hooks/group-identity/group-identity-form-state/types";
import {
  buildCanonicalPlanScheduleInput,
  resolveLocalPlanScheduleCandidates,
  toPlanLocalDateTimeValue,
} from "@/shared/lib/plan-schedule";

describe("canonical plan schedule", () => {
  it("rejects a DST gap and exposes both sides of a fold", () => {
    expect(
      resolveLocalPlanScheduleCandidates("2026-03-29T01:30", "Europe/London"),
    ).toHaveLength(0);
    expect(
      resolveLocalPlanScheduleCandidates(
        "2026-10-25T01:30",
        "Europe/London",
      ).map((candidate) => candidate.toISOString()),
    ).toEqual(["2026-10-25T00:30:00.000Z", "2026-10-25T01:30:00.000Z"]);
  });

  it("builds an explicitly folded canonical schedule", () => {
    expect(
      buildCanonicalPlanScheduleInput({
        durationMinutes: "90",
        localDateTime: "2026-10-25T01:30",
        scheduleFold: 1,
        timeZoneId: "Europe/London",
      }),
    ).toEqual({
      dateTime: "2026-10-25T01:30:00.000Z",
      durationMinutes: 90,
      localStartDate: "2026-10-25",
      localStartTime: "01:30",
      scheduleFold: 1,
      timeZoneId: "Europe/London",
    });
  });

  it("preserves half-hour and quarter-hour event zones", () => {
    expect(
      buildCanonicalPlanScheduleInput({
        durationMinutes: "60",
        localDateTime: "2026-08-02T15:00",
        scheduleFold: 0,
        timeZoneId: "Asia/Kathmandu",
      })?.dateTime,
    ).toBe("2026-08-02T09:15:00.000Z");
    expect(
      toPlanLocalDateTimeValue(
        "2026-08-02T09:15:00.000Z",
        "Australia/Adelaide",
      ),
    ).toBe("2026-08-02T18:45");
  });

  it("does not migrate a legacy schedule until a schedule field is edited", () => {
    const values: GroupIdentityFormValues = {
      avatar: "",
      coverImage: null,
      description: "",
      name: "Group",
      planCategory: "SPORTS",
      planCost: "FREE",
      planCostAmount: "",
      planCostDetails: "",
      planDateTime: "2026-08-02T19:30",
      planDescription: "",
      planDurationMinutes: "90",
      planLocation: "",
      planLocationLat: null,
      planLocationLng: null,
      planLocationMode: "TBD",
      planScheduleFold: 0,
      planScheduleTouched: false,
      planTimeZoneId: "Europe/London",
      planTitle: "Plan",
    };

    expect(normalizePlanSchedule(values)).toBeNull();
    expect(
      normalizePlanSchedule({ ...values, planScheduleTouched: true }),
    ).toMatchObject({
      durationMinutes: 90,
      localStartDate: "2026-08-02",
      localStartTime: "19:30",
      timeZoneId: "Europe/London",
    });
  });
});
