import { z } from "zod";

const adminCapabilitiesSchema = z.object({
  manageAccountRights: z.boolean(),
  viewCases: z.boolean(),
  revealEvidence: z.boolean(),
  decideCases: z.boolean(),
  reverseActions: z.boolean(),
  manageWorkers: z.boolean(),
  manageConfiguration: z.boolean(),
});

export const adminSessionSchema = z.object({
  userId: z.string(),
  operatorAccountId: z.string(),
  displayName: z.string(),
  role: z.literal("ADMIN"),
  capabilities: adminCapabilitiesSchema,
  breakGlass: z.literal(false),
  stepUpExpiresAt: z.string().datetime().nullable(),
});
