import { z } from "zod";

import { genderSchema } from "@/shared/schemas/enums";
import {
  DateOfBirthValidator,
  getAgeFromDateOfBirth,
} from "@/shared/validators/date-of-birth.validator";

const MINIMUM_PROFILE_AGE = 18;
const MAXIMUM_PROFILE_AGE = 100;
const ProfileBasicsDateOfBirthValidator = DateOfBirthValidator.refine(
  (value) => {
    const age = getAgeFromDateOfBirth(value);
    return (
      value.length === 0 ||
      (age !== null && age >= MINIMUM_PROFILE_AGE && age <= MAXIMUM_PROFILE_AGE)
    );
  },
  "Enter a date of birth for someone aged 18 to 100.",
);

export const profileBasicsSchema = z.object({
  dateOfBirth: ProfileBasicsDateOfBirthValidator,
  gender: z
    .union([genderSchema, z.literal("")])
    .refine((value) => value !== "", "Tell us your gender."),
  city: z
    .string()
    .trim()
    .min(1, "Where are you based?")
    .max(100, "Keep your city under 100 characters."),
  locationLat: z.number().nullable(),
  locationLng: z.number().nullable(),
});

export const profileBasicsWithExistingEligibilitySchema =
  profileBasicsSchema.extend({
    dateOfBirth: ProfileBasicsDateOfBirthValidator.or(z.literal("")),
  });

export type ProfileBasicsValues = z.input<typeof profileBasicsSchema>;
