import { z } from "zod";

import { DateOfBirthValidator } from "@/shared/validators/date-of-birth.validator";

export const adultEligibilityFormSchema = z.object({
  dateOfBirth: DateOfBirthValidator,
});

export type AdultEligibilityFormValues = z.infer<
  typeof adultEligibilityFormSchema
>;
