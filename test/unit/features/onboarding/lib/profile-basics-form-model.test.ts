import { describe, expect, it } from "vitest";

import {
  getProfileBasicsProgress,
  requiresProfileBasicsDateOfBirth,
  toProfileBasicsDto,
} from "@/features/onboarding/lib/profile-basics-form-model";
import type { ProfileBasicsValues } from "@/features/onboarding/schemas/profile-basics.schema";

const COMPLETE_VALUES: ProfileBasicsValues = {
  city: "London",
  dateOfBirth: "1999-04-12",
  gender: "FEMALE",
  locationLat: 51.5074,
  locationLng: -0.1278,
};

describe("profile basics form model", () => {
  it("only requires a date of birth when eligibility is missing or unknown", () => {
    expect(requiresProfileBasicsDateOfBirth()).toBe(true);
    expect(
      requiresProfileBasicsDateOfBirth({
        accessVersion: 1,
        status: "UNKNOWN",
      }),
    ).toBe(true);
    expect(
      requiresProfileBasicsDateOfBirth({
        accessVersion: 2,
        status: "ELIGIBLE",
      }),
    ).toBe(false);
    expect(
      requiresProfileBasicsDateOfBirth({
        accessVersion: 2,
        status: "REVIEW_REQUIRED",
      }),
    ).toBe(false);
  });

  it("derives age from date of birth and omits both for existing eligibility", () => {
    expect(
      toProfileBasicsDto(COMPLETE_VALUES, {
        today: new Date("2026-07-27T12:00:00.000Z"),
      }),
    ).toEqual({
      age: 27,
      city: "London",
      dateOfBirth: "1999-04-12",
      gender: "FEMALE",
      locationLat: 51.5074,
      locationLng: -0.1278,
    });

    expect(
      toProfileBasicsDto(COMPLETE_VALUES, {
        includeDateOfBirth: false,
      }),
    ).toEqual({
      city: "London",
      gender: "FEMALE",
      locationLat: 51.5074,
      locationLng: -0.1278,
    });
  });

  it("does not count an unnecessary date of birth in profile progress", () => {
    expect(
      getProfileBasicsProgress(
        {
          ...COMPLETE_VALUES,
          dateOfBirth: "",
        },
        false,
      ),
    ).toBe(1);
  });
});
