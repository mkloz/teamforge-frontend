import { z } from "zod";

import { FindafewLaunchDateOfBirthValidator } from "@/shared/validators/date-of-birth.validator";

export const adultEligibilityFormSchema = z.object({
  dateOfBirth: FindafewLaunchDateOfBirthValidator,
});

export type AdultEligibilityFormValues = z.infer<
  typeof adultEligibilityFormSchema
>;
