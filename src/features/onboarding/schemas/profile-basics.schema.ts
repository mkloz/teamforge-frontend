import { z } from "zod";

import { genderSchema } from "@/shared/schemas/enums";

const agePattern = /^\d+$/;

export const profileBasicsSchema = z.object({
  age: z
    .string()
    .trim()
    .min(1, "How old are you?")
    .refine((value) => agePattern.test(value), "Age must be a whole number.")
    .refine((value) => {
      const age = Number(value);
      return age >= 16 && age <= 99;
    }, "Enter your age (we support 16 to 99)."),
  gender: z
    .union([genderSchema, z.literal("")])
    .refine((value) => value !== "", "Tell us your gender."),
  city: z
    .string()
    .trim()
    .min(1, "Where are you based?")
    .max(120, "Keep your city under 120 characters."),
  locationLat: z.number().nullable(),
  locationLng: z.number().nullable(),
});

export type ProfileBasicsValues = z.input<typeof profileBasicsSchema>;
