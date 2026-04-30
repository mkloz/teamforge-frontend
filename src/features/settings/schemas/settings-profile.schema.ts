import { z } from "zod";

import { genderSchema } from "@/shared/schemas/enums";

const agePattern = /^\d+$/;
export const unspecifiedGenderValue = "UNSPECIFIED" as const;

export const settingsProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter your full name.")
    .max(80, "Keep your name under 80 characters."),
  age: z
    .string()
    .trim()
    .refine(
      (value) => value.length === 0 || agePattern.test(value),
      "Age must be a whole number.",
    )
    .refine((value) => {
      if (!value) {
        return true;
      }

      const age = Number(value);
      return age >= 18 && age <= 99;
    }, "Age must be between 18 and 99."),
  gender: z.union([
    genderSchema,
    z.literal(""),
    z.literal(unspecifiedGenderValue),
  ]),
  city: z.string().trim().max(120, "Keep your city under 120 characters."),
  bio: z.string().trim().max(280, "Keep your bio under 280 characters."),
});

export type SettingsProfileValues = z.infer<typeof settingsProfileSchema>;
