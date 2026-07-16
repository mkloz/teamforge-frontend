import { z } from "zod";

import { userCoreFields } from "./entity-fragments";
import { interestSchema, userSchema } from "./user";

export const adultEligibilitySchema = z.object({
  status: z.enum(["ELIGIBLE", "NOT_ELIGIBLE", "REVIEW_REQUIRED", "UNKNOWN"]),
  accessVersion: z.number().int().nonnegative(),
});

export type AdultEligibility = z.infer<typeof adultEligibilitySchema>;

const fullUserResponseInputSchema = z.object({
  ...userCoreFields,
  trustScore: userCoreFields.trustScore.default(0),
  profileComplete: userCoreFields.profileComplete.default(false),
  adultEligibility: adultEligibilitySchema.optional(),
  interests: z.array(interestSchema).optional(),
});

export const fullUserResponseSchema = fullUserResponseInputSchema.transform(
  (user) => ({
    ...userSchema.parse(user),
    adultEligibility: user.adultEligibility,
  }),
);
