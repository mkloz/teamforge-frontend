import { z } from "zod";

export const adminCapabilitiesSchema = z.object({
  viewCases: z.boolean(),
  revealEvidence: z.boolean(),
  decideCases: z.boolean(),
  reverseActions: z.boolean(),
  manageWorkers: z.boolean(),
  manageConfiguration: z.boolean(),
  manageSponsorArtifacts: z.boolean(),
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

export type AdminSession = z.infer<typeof adminSessionSchema>;
