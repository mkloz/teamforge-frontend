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
    reason: z.enum(["RETENTION_PURGED", "MISSING_AUTHORITY"]),
  })
  .strict();

const rateValueMeasureSchema = z
  .object({
    state: z.literal("VALUE"),
    value: rateValueSchema,
  })
  .strict();

const countValueMeasureSchema = z
  .object({
    state: z.literal("VALUE"),
    value: countValueSchema,
  })
  .strict();

const publishedRateMeasureSchema = z.discriminatedUnion("state", [
  rateValueMeasureSchema,
  suppressedMeasureSchema,
  sourceIncompleteMeasureSchema,
]);

const publishedCountMeasureSchema = z.discriminatedUnion("state", [
  countValueMeasureSchema,
  suppressedMeasureSchema,
  sourceIncompleteMeasureSchema,
]);

export const adminSponsorArtifactMeasureSchema = z.discriminatedUnion("state", [
  valueMeasureSchema,
  suppressedMeasureSchema,
  notCollectedMeasureSchema,
  sourceIncompleteMeasureSchema,
]);

const baseMeasuresSchema = z
  .object({
    cohortSize: adminSponsorArtifactMeasureSchema,
    sponsorDirectRecruitment: adminSponsorArtifactMeasureSchema,
    referralRecruitment: adminSponsorArtifactMeasureSchema,
    requestCreation: adminSponsorArtifactMeasureSchema,
    activityActivation: adminSponsorArtifactMeasureSchema,
    proposalCoverage: adminSponsorArtifactMeasureSchema,
    formedGroups: adminSponsorArtifactMeasureSchema,
    scheduledPlans: adminSponsorArtifactMeasureSchema,
    completedActivities: adminSponsorArtifactMeasureSchema,
    continuingGroups: adminSponsorArtifactMeasureSchema,
    coarseSafetyWorkload: adminSponsorArtifactMeasureSchema,
  })
  .strict();

type SponsorMeasures = z.infer<typeof baseMeasuresSchema>;

function validateCommonMeasures(
  measures: SponsorMeasures,
  context: z.RefinementCtx,
) {
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
}

function requireNotCollectedMeasures(
  measures: SponsorMeasures,
  keys: ReadonlyArray<keyof SponsorMeasures>,
  context: z.RefinementCtx,
) {
  for (const key of keys) {
    if (measures[key].state !== "NOT_COLLECTED") {
      context.addIssue({
        code: "custom",
        message: "This measure is not part of the frozen definition.",
        path: [key],
      });
    }
  }
}

const v1MeasuresSchema = baseMeasuresSchema.superRefine((measures, context) => {
  validateCommonMeasures(measures, context);
  requireNotCollectedMeasures(
    measures,
    [
      "proposalCoverage",
      "formedGroups",
      "scheduledPlans",
      "completedActivities",
      "continuingGroups",
      "coarseSafetyWorkload",
    ],
    context,
  );
});

const v2MeasuresSchema = baseMeasuresSchema
  .extend({
    proposalCoverage: publishedRateMeasureSchema,
    formedGroups: publishedRateMeasureSchema,
  })
  .superRefine((measures, context) => {
    validateCommonMeasures(measures, context);
    requireNotCollectedMeasures(
      measures,
      [
        "scheduledPlans",
        "completedActivities",
        "continuingGroups",
        "coarseSafetyWorkload",
      ],
      context,
    );
  });

const v3MeasuresSchema = baseMeasuresSchema
  .extend({
    proposalCoverage: publishedRateMeasureSchema,
    formedGroups: publishedRateMeasureSchema,
    scheduledPlans: publishedRateMeasureSchema,
    completedActivities: publishedRateMeasureSchema,
    continuingGroups: publishedRateMeasureSchema,
    coarseSafetyWorkload: publishedCountMeasureSchema,
  })
  .superRefine(validateCommonMeasures);

const artifactBaseShape = {
  id: z.string(),
  referenceCode: z.string().min(1),
  generatedAt: z.string().datetime(),
  payloadHash: z.string().regex(/^[0-9a-f]{64}$/),
  roundingRuleVersion: z.literal("one-decimal-percent.v1"),
};

const adminSponsorArtifactV1Schema = z
  .object({
    ...artifactBaseShape,
    definitionVersion: z.literal("pilot-fixed-window-summary.v1"),
    privacyRuleVersion: z.literal("minimum-cell-privacy.v1"),
    measures: v1MeasuresSchema,
  })
  .strict();

const adminSponsorArtifactV2Schema = z
  .object({
    ...artifactBaseShape,
    definitionVersion: z.literal("pilot-fixed-window-summary.v2"),
    privacyRuleVersion: z.literal("minimum-cell-privacy.v2"),
    measures: v2MeasuresSchema,
  })
  .strict();

const adminSponsorArtifactV3Schema = z
  .object({
    ...artifactBaseShape,
    definitionVersion: z.literal("pilot-fixed-window-summary.v3"),
    privacyRuleVersion: z.literal("minimum-cell-privacy.v2"),
    measures: v3MeasuresSchema,
  })
  .strict();

const previousAdminSponsorArtifactSchema = z.discriminatedUnion(
  "definitionVersion",
  [adminSponsorArtifactV1Schema, adminSponsorArtifactV2Schema],
);

export const adminSponsorArtifactSchema = z.discriminatedUnion(
  "definitionVersion",
  [
    adminSponsorArtifactV1Schema,
    adminSponsorArtifactV2Schema,
    adminSponsorArtifactV3Schema,
  ],
);

const sponsorArtifactHistorySchema = z
  .array(previousAdminSponsorArtifactSchema)
  .superRefine((history, context) => {
    for (let index = 1; index < history.length; index += 1) {
      if (
        Date.parse(history[index - 1].generatedAt) <
        Date.parse(history[index].generatedAt)
      ) {
        context.addIssue({
          code: "custom",
          message: "Earlier sponsor summaries must be ordered newest first.",
          path: [index, "generatedAt"],
        });
      }
    }
  });

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
    artifact: adminSponsorArtifactV3Schema.nullable(),
    history: sponsorArtifactHistorySchema,
  })
  .strict();

export type AdminSponsorArtifact = z.infer<typeof adminSponsorArtifactSchema>;
export type AdminSponsorArtifactMeasure = z.infer<
  typeof adminSponsorArtifactMeasureSchema
>;
export type AdminSponsorArtifactStatus = z.infer<
  typeof adminSponsorArtifactStatusSchema
>;
