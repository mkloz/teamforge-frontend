import { z } from "zod";

const adminPilotCohortSchema = z
  .object({
    code: z.string().trim().min(1),
    startsAt: z.string().datetime(),
    endsAt: z.string().datetime(),
    outcomeWindowEndsAt: z.string().datetime(),
    memberCap: z.number().int().min(1).max(100),
    memberCount: z.number().int().nonnegative(),
  })
  .strict()
  .superRefine((cohort, context) => {
    if (cohort.memberCount > cohort.memberCap) {
      context.addIssue({
        code: "custom",
        message: "Cohort member count cannot exceed its member cap",
        path: ["memberCount"],
      });
    }

    if (Date.parse(cohort.startsAt) >= Date.parse(cohort.endsAt)) {
      context.addIssue({
        code: "custom",
        message: "Cohort end time must be after its start time",
        path: ["endsAt"],
      });
    }

    if (Date.parse(cohort.endsAt) > Date.parse(cohort.outcomeWindowEndsAt)) {
      context.addIssue({
        code: "custom",
        message: "Outcome window cannot end before the pilot window",
        path: ["outcomeWindowEndsAt"],
      });
    }
  });

const adminPilotGatesSchema = z
  .object({
    globalSafetyPause: z.boolean(),
    aiTriage: z.boolean(),
    deterministicModerationAutomation: z.boolean(),
    autoRequestIntake: z.boolean(),
    candidateAvailability: z.boolean(),
    proposalAllocation: z.boolean(),
    proposalMaterialization: z.boolean(),
    firstGroupChat: z.boolean(),
    onlineGroups: z.boolean(),
    strangerMedia: z.boolean(),
  })
  .strict();

const adminPilotReadinessSchema = z
  .object({
    cohortConfigured: z.boolean(),
    cohortWithinWindow: z.boolean(),
    cohortWithinCap: z.boolean(),
    minimumCohortSizeMet: z.boolean(),
    newProposalExposureAllowed: z.boolean(),
    materializationAllowed: z.boolean(),
  })
  .strict();

export const adminPilotStatusSchema = z
  .object({
    evaluatedAt: z.string().datetime(),
    activeCohort: adminPilotCohortSchema.nullable(),
    gates: adminPilotGatesSchema,
    readiness: adminPilotReadinessSchema,
  })
  .strict();

export type AdminPilotStatus = z.infer<typeof adminPilotStatusSchema>;
