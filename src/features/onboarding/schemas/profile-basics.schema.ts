import { z } from "zod";

import { genderSchema } from "@/shared/schemas/enums";
import { FindafewLaunchDateOfBirthValidator } from "@/shared/validators/date-of-birth.validator";

export const profileBasicsSchema = z.object({
  dateOfBirth: FindafewLaunchDateOfBirthValidator,
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
    dateOfBirth: FindafewLaunchDateOfBirthValidator.or(z.literal("")),
  });

export type ProfileBasicsValues = z.input<typeof profileBasicsSchema>;
