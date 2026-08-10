import { describe, expect, it } from "vitest";

import { registerSchema } from "@/features/auth/schemas/auth-schemas";
import { profileBasicsSchema } from "@/features/onboarding/schemas/profile-basics.schema";
import { adultEligibilityFormSchema } from "@/features/settings/schemas/adult-eligibility.schema";
import {
  FINDAFEW_LAUNCH_MAXIMUM_AGE,
  FINDAFEW_LAUNCH_MINIMUM_AGE,
  FindafewLaunchDateOfBirthValidator,
} from "@/shared/validators/date-of-birth.validator";

describe("Findafew launch eligibility", () => {
  it("accepts adults aged 18 through 28 across registration, onboarding, and settings", () => {
    for (const age of [
      FINDAFEW_LAUNCH_MINIMUM_AGE,
      FINDAFEW_LAUNCH_MAXIMUM_AGE,
    ]) {
      const dateOfBirth = birthdayForAge(age);

      expect(
        registerSchema.safeParse({
          city: "London",
          dateOfBirth,
          email: "alex@example.test",
          gender: "NON_BINARY",
          name: "Alex",
          otp: "123456",
          password: "A-safe-password-123",
        }).success,
      ).toBe(true);
      expect(
        profileBasicsSchema.safeParse({
          city: "London",
          dateOfBirth,
          gender: "NON_BINARY",
          locationLat: null,
          locationLng: null,
        }).success,
      ).toBe(true);
      expect(
        adultEligibilityFormSchema.safeParse({ dateOfBirth }).success,
      ).toBe(true);
    }
  });

  it("rejects people below 18 or above 28 with the exact launch-cohort message", () => {
    for (const age of [
      FINDAFEW_LAUNCH_MINIMUM_AGE - 1,
      FINDAFEW_LAUNCH_MAXIMUM_AGE + 1,
    ]) {
      const result = FindafewLaunchDateOfBirthValidator.safeParse(
        birthdayForAge(age),
      );

      expect(result.success).toBe(false);
      if (result.success) {
        throw new Error("Out-of-range launch age unexpectedly passed.");
      }
      expect(result.error.issues[0]?.message).toBe(
        "Findafew is currently for adults aged 18 to 28.",
      );
    }
  });
});

function birthdayForAge(age: number) {
  const today = new Date();
  const birthday = new Date(
    Date.UTC(
      today.getUTCFullYear() - age,
      today.getUTCMonth(),
      today.getUTCDate(),
    ),
  );

  if (birthday.getUTCMonth() !== today.getUTCMonth()) {
    birthday.setUTCDate(0);
  }

  return birthday.toISOString().slice(0, 10);
}
