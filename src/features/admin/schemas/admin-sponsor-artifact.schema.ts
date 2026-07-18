import { z } from "zod";

const countValueSchema = z
  .object({
    kind: z.literal("COUNT"),
    count: z.number().int().nonnegative(),
  })
  .strict()
  .superRefine(({ count }, context) => {
    if (count > 0 && count < 5) {
      context.addIssue({
        code: "custom",
        message: "Small count cells must be suppressed by the server.",
        path: ["count"],
      });
    }
  });

const rateValueSchema = z
  .object({
    kind: z.literal("RATE"),
    numerator: z.number().int().nonnegative(),
    denominator: z.number().int().min(20),
    ratePercent: z.number().min(0).max(100),
  })
  .strict()
  .superRefine(({ denominator, numerator, ratePercent }, context) => {
    if (numerator > denominator) {
      context.addIssue({
        code: "custom",
        message: "The numerator cannot exceed the denominator.",
        path: ["numerator"],
      });
    }

    if (numerator > 0 && numerator < 5) {
      context.addIssue({
        code: "custom",
        message: "Small rate numerators must be suppressed by the server.",
        path: ["numerator"],
      });
    }

    const complement = denominator - numerator;
    if (complement > 0 && complement < 5) {
      context.addIssue({
        code: "custom",
        message: "Small complementary cells must be suppressed by the server.",
        path: ["numerator"],
      });
    }

    const expectedRatePercent =
      Math.round((numerator / denominator) * 1000) / 10;
    if (ratePercent !== expectedRatePercent) {
      context.addIssue({
        code: "custom",
        message: "The displayed rate must use the fixed one-decimal rule.",
        path: ["ratePercent"],
      });
    }
  });

const valueMeasureSchema = z
  .object({
    state: z.literal("VALUE"),
    value: z.union([countValueSchema, rateValueSchema]),
  })
  .strict();

const suppressedMeasureSchema = z
  .object({
    state: z.literal("SUPPRESSED"),
    reason: z.enum([
      "DENOMINATOR_TOO_SMALL",
      "SMALL_CELL",
      "COMPLEMENTARY_CELL",
    ]),
  })
  .strict();

const notCollectedMeasureSchema = z
  .object({
    state: z.literal("NOT_COLLECTED"),
    reason: z.literal("NOT_IN_FROZEN_DEFINITION"),
  })
  .strict();

const sourceIncompleteMeasureSchema = z
  .object({
    state: z.literal("SOURCE_INCOMPLETE"),
    reason: z.literal("RETENTION_PURGED"),
  })
  .strict();

const rateValueMeasureSchema = z
  .object({
    state: z.literal("VALUE"),
    value: rateValueSchema,
  })
  .strict();

const publishedRateMeasureSchema = z.discriminatedUnion("state", [
  rateValueMeasureSchema,
  suppressedMeasureSchema,
  sourceIncompleteMeasureSchema,
]);

export const adminSponsorArtifactMeasureSchema = z.discriminatedUnion("state", [
  valueMeasureSchema,
  suppressedMeasureSchema,
  notCollectedMeasureSchema,
  sourceIncompleteMeasureSchema,
]);

const measuresSchema = z
  .object({
    cohortSize: adminSponsorArtifactMeasureSchema,
    sponsorDirectRecruitment: adminSponsorArtifactMeasureSchema,
    referralRecruitment: adminSponsorArtifactMeasureSchema,
    requestCreation: adminSponsorArtifactMeasureSchema,
    activityActivation: adminSponsorArtifactMeasureSchema,
    proposalCoverage: publishedRateMeasureSchema,
    formedGroups: publishedRateMeasureSchema,
    scheduledPlans: adminSponsorArtifactMeasureSchema,
    completedActivities: adminSponsorArtifactMeasureSchema,
    continuingGroups: adminSponsorArtifactMeasureSchema,
    coarseSafetyWorkload: adminSponsorArtifactMeasureSchema,
  })
  .strict()
  .superRefine((measures, context) => {
    for (const key of [
      "sponsorDirectRecruitment",
      "referralRecruitment",
    ] as const) {
      const measure = measures[key];
      if (
        measure.state === "VALUE" &&
        (measure.value.kind !== "COUNT" ||
          (measure.value.count > 0 && measure.value.count < 20))
      ) {
        context.addIssue({
          code: "custom",
          message:
            "Recruitment source values must be counts of zero or at least 20.",
          path: [key, "value"],
        });
      }
    }

    const cohortSize = measures.cohortSize;
    if (
      cohortSize.state !== "VALUE" ||
      cohortSize.value.kind !== "COUNT" ||
      cohortSize.value.count < 20
    ) {
      context.addIssue({
        code: "custom",
        message: "The published cohort size must meet the privacy minimum.",
        path: ["cohortSize"],
      });
    }

    for (const key of ["requestCreation", "activityActivation"] as const) {
      const measure = measures[key];
      if (measure.state === "VALUE" && measure.value.kind !== "RATE") {
        context.addIssue({
          code: "custom",
          message: "Published outcome measures must use a rate value.",
          path: [key],
        });
      }
    }

    for (const key of [
      "scheduledPlans",
      "completedActivities",
      "continuingGroups",
      "coarseSafetyWorkload",
    ] as const) {
      if (measures[key].state !== "NOT_COLLECTED") {
        context.addIssue({
          code: "custom",
          message: "This measure is not part of the frozen definition.",
          path: [key],
        });
      }
    }
  });

const adminSponsorArtifactSchema = z
  .object({
    id: z.string(),
    referenceCode: z.string().min(1),
    generatedAt: z.string().datetime(),
    definitionVersion: z.literal("pilot-fixed-window-summary.v2"),
    privacyRuleVersion: z.literal("minimum-cell-privacy.v2"),
    roundingRuleVersion: z.literal("one-decimal-percent.v1"),
    payloadHash: z.string().regex(/^[0-9a-f]{64}$/),
    measures: measuresSchema,
  })
  .strict();

export const adminSponsorArtifactStatusSchema = z
  .object({
    evaluatedAt: z.string().datetime(),
    targetCohort: z
      .object({
        code: z.string(),
        memberCount: z.number().int().nonnegative(),
        scope: z.literal("LOCAL"),
        startsAt: z.string().datetime(),
        endsAt: z.string().datetime(),
        outcomeWindowEndsAt: z.string().datetime(),
      })
      .strict()
      .nullable(),
    eligibility: z
      .object({
        eligible: z.boolean(),
        blockers: z.array(
          z.enum([
            "NO_CONFIGURED_COHORT",
            "OUTCOME_WINDOW_OPEN",
            "DENOMINATOR_BELOW_MINIMUM",
            "ARTIFACT_ALREADY_EXISTS",
          ]),
        ),
      })
      .strict(),
    viewer: z
      .object({
        canGenerate: z.boolean(),
      })
      .strict(),
    artifact: adminSponsorArtifactSchema.nullable(),
  })
  .strict();

export type AdminSponsorArtifactMeasure = z.infer<
  typeof adminSponsorArtifactMeasureSchema
>;
export type AdminSponsorArtifactStatus = z.infer<
  typeof adminSponsorArtifactStatusSchema
>;
