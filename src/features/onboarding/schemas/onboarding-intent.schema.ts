import { z } from "zod";

import { onboardingIntentValues } from "@/shared/schemas/onboarding-product-state";

export const onboardingIntentSchema = z.object({
  onboardingIntent: z.enum(onboardingIntentValues).nullable(),
});

export type OnboardingIntentValues = z.input<typeof onboardingIntentSchema>;
