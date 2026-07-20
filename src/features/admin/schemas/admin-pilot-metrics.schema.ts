import { z } from "zod";

import { planCategorySchema } from "@/shared/schemas";

const metricDefinitionSchema = z
  .object({
    version: z.string().trim().min(1),
    authoritativeSource: z.string().trim().min(1),
    numerator: z.string().trim().min(1),
    denominator: z.string().trim().min(1),
    timeWindow: z.string().trim().min(1),
    exclusions: z.array(z.string().trim().min(1)),
  })
  .strict();

function createMetricDefinitionSchema<DefinitionVersion extends string>(
  definitionVersion: DefinitionVersion,
) {
  return metricDefinitionSchema.extend({
    version: z.literal(definitionVersion),
  });
}

const activityActivationDefinitionSchema = createMetricDefinitionSchema(
  "activity-activation-requester-rate.v1",
);
const candidateWillingnessDefinitionSchema = createMetricDefinitionSchema(
  "candidate-willingness-first-response-rate.v1",
);

const scopedActivityActivationSchema = z
  .object({
    requestingMemberCount: z.number().int().nonnegative().nullable(),
    activatedRequesterCount: z.number().int().nonnegative().nullable(),
    activationRatePercent: z.number().min(0).max(100).nullable(),
    recordedActivityCount: z.number().int().nonnegative().nullable(),
  })
  .strict();

const activityActivationSchema = z
  .object({
    definition: activityActivationDefinitionSchema,
    definitionVersion: z.literal("activity-activation-requester-rate.v1"),
    measurementState: z.enum(["PROVISIONAL", "FINAL"]),
    dataCompleteness: z.enum(["COMPLETE", "RETENTION_PURGED"]),
    requestingMemberCount: z.number().int().nonnegative().nullable(),
    activatedRequesterCount: z.number().int().nonnegative().nullable(),
    recordedActivityCount: z.number().int().nonnegative().nullable(),
    local: scopedActivityActivationSchema,
    online: scopedActivityActivationSchema,
  })
  .strict()
  .superRefine((activation, context) => {
    if (activation.dataCompleteness === "RETENTION_PURGED") {
      validatePurgedMetrics(activation, context);
      return;
    }

    validateCompleteMetrics(activation, context);
  });

type ActivityActivation = z.infer<typeof activityActivationSchema>;
type ScopedActivityActivation = z.infer<typeof scopedActivityActivationSchema>;

const scopedRequestConversionSchema = z
  .object({
    eligibleRequestCount: z.number().int().nonnegative().nullable(),
    convertedRequestCount: z.number().int().nonnegative().nullable(),
    conversionRatePercent: z.number().min(0).max(100).nullable(),
  })
  .strict();

function createRequestConversionSchema<DefinitionVersion extends string>(
  definitionVersion: DefinitionVersion,
) {
  return z
    .object({
      definition: createMetricDefinitionSchema(definitionVersion),
      definitionVersion: z.literal(definitionVersion),
      measurementState: z.enum(["PROVISIONAL", "FINAL"]),
      dataCompleteness: z.enum(["COMPLETE", "RETENTION_PURGED"]),
      eligibleRequestCount: z.number().int().nonnegative().nullable(),
      convertedRequestCount: z.number().int().nonnegative().nullable(),
      conversionRatePercent: z.number().min(0).max(100).nullable(),
      local: scopedRequestConversionSchema,
      online: scopedRequestConversionSchema,
    })
    .strict()
    .superRefine((conversion, context) => {
      validateRequestRateMetric(
        {
          dataCompleteness: conversion.dataCompleteness,
          local: {
            denominator: conversion.local.eligibleRequestCount,
            numerator: conversion.local.convertedRequestCount,
            ratePercent: conversion.local.conversionRatePercent,
          },
          online: {
            denominator: conversion.online.eligibleRequestCount,
            numerator: conversion.online.convertedRequestCount,
            ratePercent: conversion.online.conversionRatePercent,
          },
          overall: {
            denominator: conversion.eligibleRequestCount,
            numerator: conversion.convertedRequestCount,
            ratePercent: conversion.conversionRatePercent,
          },
        },
        {
          denominator: "eligibleRequestCount",
          numerator: "convertedRequestCount",
          rate: "conversionRatePercent",
        },
        context,
      );
    });
}

const proposalCoverageSchema = createRequestConversionSchema(
  "proposal-coverage-request-rate.v1",
);
const formationConversionSchema = createRequestConversionSchema(
  "formation-conversion-request-rate.v1",
);

const candidateDeclineReasonSchema = z.enum([
  "ACTIVITY_NOT_FOR_ME",
  "FIXED_TIME_DOES_NOT_WORK",
  "AREA_DOES_NOT_WORK",
  "NOT_THIS_GROUP",
  "TAKING_A_BREAK",
  "PREFER_NOT_TO_SAY",
]);

const candidateDeclineReasonCountSchema = z
  .object({
    reason: candidateDeclineReasonSchema,
    count: z.number().int().nonnegative(),
  })
  .strict();

const scopedCandidateWillingnessSchema = z
  .object({
    eligibleExposureCount: z.number().int().nonnegative().nullable(),
    acceptedExposureCount: z.number().int().nonnegative().nullable(),
    declinedExposureCount: z.number().int().nonnegative().nullable(),
    unansweredExposureCount: z.number().int().nonnegative().nullable(),
    cancelledBeforeResponseCount: z.number().int().nonnegative().nullable(),
    acceptanceRatePercent: z.number().min(0).max(100).nullable(),
  })
  .strict();

const candidateWillingnessActivityScopeSchema = z
  .object({
    activityCategory: planCategorySchema,
    scope: z.enum(["LOCAL", "ONLINE"]),
    eligibleExposureCount: z.number().int().nonnegative(),
    acceptedExposureCount: z.number().int().nonnegative(),
    declinedExposureCount: z.number().int().nonnegative(),
    unansweredExposureCount: z.number().int().nonnegative(),
    cancelledBeforeResponseCount: z.number().int().nonnegative(),
    acceptanceRatePercent: z.number().min(0).max(100).nullable(),
    declineReasons: z.array(candidateDeclineReasonCountSchema),
  })
  .strict();

const candidateWillingnessSchema = z
  .object({
    definition: candidateWillingnessDefinitionSchema,
    definitionVersion: z.literal(
      "candidate-willingness-first-response-rate.v1",
    ),
    measurementState: z.enum(["PROVISIONAL", "FINAL"]),
    dataCompleteness: z.enum([
      "COMPLETE",
      "RETENTION_PURGED",
      "SOURCE_INCOMPLETE",
    ]),
    eligibleExposureCount: z.number().int().nonnegative().nullable(),
    acceptedExposureCount: z.number().int().nonnegative().nullable(),
    declinedExposureCount: z.number().int().nonnegative().nullable(),
    unansweredExposureCount: z.number().int().nonnegative().nullable(),
    cancelledBeforeResponseCount: z.number().int().nonnegative().nullable(),
    acceptanceRatePercent: z.number().min(0).max(100).nullable(),
    local: scopedCandidateWillingnessSchema,
    online: scopedCandidateWillingnessSchema,
    declineReasons: z.array(candidateDeclineReasonCountSchema).nullable(),
    byActivityScope: z
      .array(candidateWillingnessActivityScopeSchema)
      .nullable(),
  })
  .strict()
  .superRefine((metric, context) => {
    validateCandidateWillingness(metric, context);
  });

type CandidateWillingness = z.infer<typeof candidateWillingnessSchema>;
type CandidateWillingnessValues = z.infer<
  typeof scopedCandidateWillingnessSchema
>;
type CandidateDeclineReasonCount = z.infer<
  typeof candidateDeclineReasonCountSchema
>;

const CANDIDATE_COUNT_FIELDS = [
  "eligibleExposureCount",
  "acceptedExposureCount",
  "declinedExposureCount",
  "unansweredExposureCount",
  "cancelledBeforeResponseCount",
] as const;

type RateMetricValues = {
  denominator: number | null;
  numerator: number | null;
  ratePercent: number | null;
};

type RequestRateMetric = {
  dataCompleteness: "COMPLETE" | "RETENTION_PURGED";
  local: RateMetricValues;
  online: RateMetricValues;
  overall: RateMetricValues;
};

type RequestRateMetricFields = {
  denominator: string;
  numerator: string;
  rate: string;
};

function validatePurgedMetrics(
  activation: ActivityActivation,
  context: z.RefinementCtx,
) {
  requirePurgedValue(
    activation.requestingMemberCount,
    ["requestingMemberCount"],
    context,
  );
  requirePurgedValue(
    activation.activatedRequesterCount,
    ["activatedRequesterCount"],
    context,
  );
  requirePurgedValue(
    activation.recordedActivityCount,
    ["recordedActivityCount"],
    context,
  );
  requirePurgedScope("local", activation.local, context);
  requirePurgedScope("online", activation.online, context);
}

function requirePurgedScope(
  scopeName: "local" | "online",
  scope: ScopedActivityActivation,
  context: z.RefinementCtx,
) {
  requirePurgedValue(
    scope.requestingMemberCount,
    [scopeName, "requestingMemberCount"],
    context,
  );
  requirePurgedValue(
    scope.activatedRequesterCount,
    [scopeName, "activatedRequesterCount"],
    context,
  );
  requirePurgedValue(
    scope.activationRatePercent,
    [scopeName, "activationRatePercent"],
    context,
  );
  requirePurgedValue(
    scope.recordedActivityCount,
    [scopeName, "recordedActivityCount"],
    context,
  );
}

function requirePurgedValue(
  value: number | null,
  path: Array<string | number>,
  context: z.RefinementCtx,
) {
  if (value !== null) {
    context.addIssue({
      code: "custom",
      message: "Outcome values must be null after retention purging",
      path,
    });
  }
}

function validateCompleteMetrics(
  activation: ActivityActivation,
  context: z.RefinementCtx,
) {
  requireCompleteCount(
    activation.requestingMemberCount,
    ["requestingMemberCount"],
    context,
  );
  requireCompleteCount(
    activation.activatedRequesterCount,
    ["activatedRequesterCount"],
    context,
  );
  requireCompleteCount(
    activation.recordedActivityCount,
    ["recordedActivityCount"],
    context,
  );
  validateCompleteScope("local", activation.local, context);
  validateCompleteScope("online", activation.online, context);

  if (
    activation.activatedRequesterCount !== null &&
    activation.requestingMemberCount !== null &&
    activation.activatedRequesterCount > activation.requestingMemberCount
  ) {
    context.addIssue({
      code: "custom",
      message:
        "Activated requester count cannot exceed requesting member count",
      path: ["activatedRequesterCount"],
    });
  }

  if (
    activation.recordedActivityCount !== null &&
    activation.local.recordedActivityCount !== null &&
    activation.online.recordedActivityCount !== null &&
    activation.recordedActivityCount !==
      activation.local.recordedActivityCount +
        activation.online.recordedActivityCount
  ) {
    context.addIssue({
      code: "custom",
      message:
        "Local and online activity counts must equal the recorded activity count",
      path: ["recordedActivityCount"],
    });
  }
}

function validateCompleteScope(
  scopeName: "local" | "online",
  scope: ScopedActivityActivation,
  context: z.RefinementCtx,
) {
  requireCompleteCount(
    scope.requestingMemberCount,
    [scopeName, "requestingMemberCount"],
    context,
  );
  requireCompleteCount(
    scope.activatedRequesterCount,
    [scopeName, "activatedRequesterCount"],
    context,
  );
  requireCompleteCount(
    scope.recordedActivityCount,
    [scopeName, "recordedActivityCount"],
    context,
  );

  if (
    scope.activatedRequesterCount !== null &&
    scope.requestingMemberCount !== null &&
    scope.activatedRequesterCount > scope.requestingMemberCount
  ) {
    context.addIssue({
      code: "custom",
      message:
        "Activated requester count cannot exceed requesting member count",
      path: [scopeName, "activatedRequesterCount"],
    });
  }

  validateRate(scopeName, scope, context);
}

function validateRate(
  scopeName: "local" | "online",
  scope: ScopedActivityActivation,
  context: z.RefinementCtx,
) {
  if (scope.requestingMemberCount === null) {
    return;
  }

  if (scope.requestingMemberCount === 0) {
    if (scope.activationRatePercent !== null) {
      context.addIssue({
        code: "custom",
        message: "Activation rate must be null when there are no requesters",
        path: [scopeName, "activationRatePercent"],
      });
    }
    return;
  }

  if (scope.activationRatePercent === null) {
    context.addIssue({
      code: "custom",
      message: "Activation rate is required when requesters are recorded",
      path: [scopeName, "activationRatePercent"],
    });
    return;
  }

  if (scope.activatedRequesterCount === null) {
    return;
  }

  const expectedRate =
    Math.round(
      (scope.activatedRequesterCount / scope.requestingMemberCount) * 1_000,
    ) / 10;

  if (scope.activationRatePercent !== expectedRate) {
    context.addIssue({
      code: "custom",
      message: "Activation rate must match the counts to one decimal",
      path: [scopeName, "activationRatePercent"],
    });
  }
}

function requireCompleteCount(
  value: number | null,
  path: Array<string | number>,
  context: z.RefinementCtx,
) {
  if (value === null) {
    context.addIssue({
      code: "custom",
      message: "Outcome count is required when metric data is complete",
      path,
    });
  }
}

function validateRequestRateMetric(
  metric: RequestRateMetric,
  fields: RequestRateMetricFields,
  context: z.RefinementCtx,
) {
  const scopes = [
    [[], metric.overall],
    [["local"], metric.local],
    [["online"], metric.online],
  ] as const;

  if (metric.dataCompleteness === "RETENTION_PURGED") {
    for (const [prefix, values] of scopes) {
      requirePurgedValue(
        values.denominator,
        [...prefix, fields.denominator],
        context,
      );
      requirePurgedValue(
        values.numerator,
        [...prefix, fields.numerator],
        context,
      );
      requirePurgedValue(values.ratePercent, [...prefix, fields.rate], context);
    }
    return;
  }

  for (const [prefix, values] of scopes) {
    requireCompleteCount(
      values.denominator,
      [...prefix, fields.denominator],
      context,
    );
    requireCompleteCount(
      values.numerator,
      [...prefix, fields.numerator],
      context,
    );
    validateRequestRateValues(values, prefix, fields, context);
  }

  validateScopeTotals(metric, fields, context);
}

function validateRequestRateValues(
  values: RateMetricValues,
  prefix: readonly string[],
  fields: RequestRateMetricFields,
  context: z.RefinementCtx,
) {
  if (values.denominator === null || values.numerator === null) {
    return;
  }

  if (values.numerator > values.denominator) {
    context.addIssue({
      code: "custom",
      message: "The outcome count cannot exceed the measured request count",
      path: [...prefix, fields.numerator],
    });
  }

  if (values.denominator === 0) {
    if (values.ratePercent !== null) {
      context.addIssue({
        code: "custom",
        message: "The rate must be null when no requests are measured",
        path: [...prefix, fields.rate],
      });
    }
    return;
  }

  if (values.ratePercent === null) {
    context.addIssue({
      code: "custom",
      message: "The rate is required when requests are measured",
      path: [...prefix, fields.rate],
    });
    return;
  }

  const expectedRate =
    Math.round((values.numerator / values.denominator) * 1_000) / 10;
  if (values.ratePercent !== expectedRate) {
    context.addIssue({
      code: "custom",
      message: "The rate must match the counts to one decimal",
      path: [...prefix, fields.rate],
    });
  }
}

function validateScopeTotals(
  metric: RequestRateMetric,
  fields: RequestRateMetricFields,
  context: z.RefinementCtx,
) {
  if (
    metric.overall.denominator !== null &&
    metric.local.denominator !== null &&
    metric.online.denominator !== null &&
    metric.overall.denominator !==
      metric.local.denominator + metric.online.denominator
  ) {
    context.addIssue({
      code: "custom",
      message: "Local and online request counts must equal the overall count",
      path: [fields.denominator],
    });
  }

  if (
    metric.overall.numerator !== null &&
    metric.local.numerator !== null &&
    metric.online.numerator !== null &&
    metric.overall.numerator !==
      metric.local.numerator + metric.online.numerator
  ) {
    context.addIssue({
      code: "custom",
      message: "Local and online outcome counts must equal the overall count",
      path: [fields.numerator],
    });
  }
}

function validateCandidateWillingness(
  metric: CandidateWillingness,
  context: z.RefinementCtx,
) {
  const overall = candidateWillingnessOverall(metric);

  if (metric.dataCompleteness !== "COMPLETE") {
    validateUnavailableCandidateValues(overall, [], context);
    validateUnavailableCandidateValues(metric.local, ["local"], context);
    validateUnavailableCandidateValues(metric.online, ["online"], context);

    if (metric.declineReasons !== null) {
      context.addIssue({
        code: "custom",
        message: "Decline reasons must be unavailable when data is incomplete",
        path: ["declineReasons"],
      });
    }
    if (metric.byActivityScope !== null) {
      context.addIssue({
        code: "custom",
        message:
          "Activity and scope totals must be unavailable when data is incomplete",
        path: ["byActivityScope"],
      });
    }
    return;
  }

  validateCompleteCandidateValues(overall, [], context);
  validateCompleteCandidateValues(metric.local, ["local"], context);
  validateCompleteCandidateValues(metric.online, ["online"], context);
  validateCandidateScopeSums(metric, overall, context);

  if (metric.declineReasons === null) {
    context.addIssue({
      code: "custom",
      message: "Decline reasons are required when metric data is complete",
      path: ["declineReasons"],
    });
  } else {
    validateDeclineReasonCounts(
      metric.declineReasons,
      overall.declinedExposureCount,
      ["declineReasons"],
      context,
    );
  }

  if (metric.byActivityScope === null) {
    context.addIssue({
      code: "custom",
      message:
        "Activity and scope totals are required when metric data is complete",
      path: ["byActivityScope"],
    });
    return;
  }

  validateCandidateActivityScopeRows(metric, overall, context);
}

function candidateWillingnessOverall(
  metric: CandidateWillingness,
): CandidateWillingnessValues {
  return {
    eligibleExposureCount: metric.eligibleExposureCount,
    acceptedExposureCount: metric.acceptedExposureCount,
    declinedExposureCount: metric.declinedExposureCount,
    unansweredExposureCount: metric.unansweredExposureCount,
    cancelledBeforeResponseCount: metric.cancelledBeforeResponseCount,
    acceptanceRatePercent: metric.acceptanceRatePercent,
  };
}

function validateUnavailableCandidateValues(
  values: CandidateWillingnessValues,
  prefix: Array<string | number>,
  context: z.RefinementCtx,
) {
  for (const field of CANDIDATE_COUNT_FIELDS) {
    requireIncompleteCandidateValue(values[field], [...prefix, field], context);
  }
  requireIncompleteCandidateValue(
    values.acceptanceRatePercent,
    [...prefix, "acceptanceRatePercent"],
    context,
  );
}

function requireIncompleteCandidateValue(
  value: number | null,
  path: Array<string | number>,
  context: z.RefinementCtx,
) {
  if (value !== null) {
    context.addIssue({
      code: "custom",
      message: "Candidate response values must be null when data is incomplete",
      path,
    });
  }
}

function validateCompleteCandidateValues(
  values: CandidateWillingnessValues,
  prefix: Array<string | number>,
  context: z.RefinementCtx,
) {
  for (const field of CANDIDATE_COUNT_FIELDS) {
    requireCompleteCount(values[field], [...prefix, field], context);
  }

  const {
    acceptedExposureCount,
    declinedExposureCount,
    eligibleExposureCount,
    unansweredExposureCount,
  } = values;
  if (
    eligibleExposureCount === null ||
    acceptedExposureCount === null ||
    declinedExposureCount === null ||
    unansweredExposureCount === null
  ) {
    return;
  }

  if (
    eligibleExposureCount !==
    acceptedExposureCount + declinedExposureCount + unansweredExposureCount
  ) {
    context.addIssue({
      code: "custom",
      message:
        "Measured candidate invitations must equal accepted, declined, and unanswered candidate invitations",
      path: [...prefix, "eligibleExposureCount"],
    });
  }

  validateCandidateAcceptanceRate(values, prefix, context);
}

function validateCandidateAcceptanceRate(
  values: CandidateWillingnessValues,
  prefix: Array<string | number>,
  context: z.RefinementCtx,
) {
  const denominator = values.eligibleExposureCount;
  const numerator = values.acceptedExposureCount;
  if (denominator === null || numerator === null) {
    return;
  }

  if (denominator === 0) {
    if (values.acceptanceRatePercent !== null) {
      context.addIssue({
        code: "custom",
        message: "Acceptance rate must be null when no responses are measured",
        path: [...prefix, "acceptanceRatePercent"],
      });
    }
    return;
  }

  if (values.acceptanceRatePercent === null) {
    context.addIssue({
      code: "custom",
      message: "Acceptance rate is required when responses are measured",
      path: [...prefix, "acceptanceRatePercent"],
    });
    return;
  }

  const expectedRate = Math.round((numerator / denominator) * 1_000) / 10;
  if (values.acceptanceRatePercent !== expectedRate) {
    context.addIssue({
      code: "custom",
      message: "Acceptance rate must equal the rate calculated from the counts",
      path: [...prefix, "acceptanceRatePercent"],
    });
  }
}

function validateCandidateScopeSums(
  metric: CandidateWillingness,
  overall: CandidateWillingnessValues,
  context: z.RefinementCtx,
) {
  for (const field of CANDIDATE_COUNT_FIELDS) {
    const overallValue = overall[field];
    const localValue = metric.local[field];
    const onlineValue = metric.online[field];
    if (
      overallValue !== null &&
      localValue !== null &&
      onlineValue !== null &&
      overallValue !== localValue + onlineValue
    ) {
      context.addIssue({
        code: "custom",
        message:
          "Local and online candidate invitation counts must equal the overall count",
        path: [field],
      });
    }
  }
}

function validateCandidateActivityScopeRows(
  metric: CandidateWillingness,
  overall: CandidateWillingnessValues,
  context: z.RefinementCtx,
) {
  const rows = metric.byActivityScope;
  if (rows === null) {
    return;
  }

  const seenRows = new Set<string>();
  rows.forEach((row, index) => {
    const rowKey = `${row.activityCategory}:${row.scope}`;
    if (seenRows.has(rowKey)) {
      context.addIssue({
        code: "custom",
        message: "Activity and scope rows must be unique",
        path: ["byActivityScope", index],
      });
    }
    seenRows.add(rowKey);

    validateCompleteCandidateValues(row, ["byActivityScope", index], context);
    validateDeclineReasonCounts(
      row.declineReasons,
      row.declinedExposureCount,
      ["byActivityScope", index, "declineReasons"],
      context,
    );
  });

  for (const field of CANDIDATE_COUNT_FIELDS) {
    const rowTotal = rows.reduce((sum, row) => sum + row[field], 0);
    if (overall[field] !== null && overall[field] !== rowTotal) {
      context.addIssue({
        code: "custom",
        message:
          "Activity and scope rows must equal the overall candidate invitation count",
        path: ["byActivityScope"],
      });
    }

    for (const scope of ["LOCAL", "ONLINE"] as const) {
      const scopeTotal = rows
        .filter((row) => row.scope === scope)
        .reduce((sum, row) => sum + row[field], 0);
      const expected =
        scope === "LOCAL" ? metric.local[field] : metric.online[field];
      if (expected !== null && expected !== scopeTotal) {
        context.addIssue({
          code: "custom",
          message: "Activity rows must equal their scope total",
          path: ["byActivityScope"],
        });
      }
    }
  }

  if (metric.declineReasons !== null) {
    for (const { reason, count } of metric.declineReasons) {
      const rowCount = rows.reduce(
        (sum, row) =>
          sum +
          (row.declineReasons.find((item) => item.reason === reason)?.count ??
            0),
        0,
      );
      if (rowCount !== count) {
        context.addIssue({
          code: "custom",
          message:
            "Activity decline reasons must equal the overall reason count",
          path: ["byActivityScope"],
        });
      }
    }
  }
}

function validateDeclineReasonCounts(
  reasons: CandidateDeclineReasonCount[],
  declinedCount: number | null,
  path: Array<string | number>,
  context: z.RefinementCtx,
) {
  const seenReasons = new Set<string>();
  reasons.forEach((item, index) => {
    if (seenReasons.has(item.reason)) {
      context.addIssue({
        code: "custom",
        message: "Decline reasons must be unique",
        path: [...path, index, "reason"],
      });
    }
    seenReasons.add(item.reason);
  });

  const reasonTotal = reasons.reduce((sum, item) => sum + item.count, 0);
  if (declinedCount !== null && reasonTotal !== declinedCount) {
    context.addIssue({
      code: "custom",
      message:
        "Decline reason counts must equal the declined candidate invitation count",
      path,
    });
  }
}

const internalMeasurementStateSchema = z.enum(["PROVISIONAL", "FINAL"]);
const internalDataCompletenessSchema = z.enum([
  "COMPLETE",
  "RETENTION_PURGED",
  "SOURCE_INCOMPLETE",
]);
const nullableCountSchema = z.number().int().nonnegative().nullable();
const nullableMetricNumberSchema = z.number().nonnegative().nullable();
const nullablePercentSchema = z.number().min(0).max(100).nullable();

function internalMetricShape<DefinitionVersion extends string>(
  definitionVersion: DefinitionVersion,
) {
  return {
    definition: createMetricDefinitionSchema(definitionVersion),
    definitionVersion: z.literal(definitionVersion),
    measurementState: internalMeasurementStateSchema,
    dataCompleteness: internalDataCompletenessSchema,
  };
}

function createUnavailableMetricSchema<DefinitionVersion extends string>(
  definitionVersion: DefinitionVersion,
) {
  return z
    .object({
      definition: createMetricDefinitionSchema(definitionVersion),
      definitionVersion: z.literal(definitionVersion),
      dataCompleteness: z.literal("SOURCE_INCOMPLETE"),
      unavailableReason: z.literal("NOT_INSTRUMENTED"),
      numerator: z.null(),
      denominator: z.null(),
    })
    .strict();
}

const candidatePoolActivationSchema = z
  .object({
    ...coveredInternalMetricShape("candidate-pool-activation-member-rate.v1"),
    eligibleMemberCount: nullableCountSchema,
    activatedMemberCount: nullableCountSchema,
    activationRatePercent: nullablePercentSchema,
    sourceIncompleteMemberCount: z.number().int().nonnegative(),
  })
  .strict();

const integerDistributionBucketSchema = z
  .object({
    value: z.number().int().nonnegative(),
    count: z.number().int().nonnegative(),
  })
  .strict();

const formationProvenanceBucketSchema = z
  .object({
    provenance: z.enum(["DIRECT", "RECOVERED"]),
    count: z.number().int().nonnegative(),
  })
  .strict();

const formationDistributionSchema = z
  .object({
    ...internalMetricShape("formation-size-distribution.v1"),
    formedRequestCount: nullableCountSchema,
    requestedMinimumGroupSize: z
      .array(integerDistributionBucketSchema)
      .nullable(),
    requestedMaximumGroupSize: z
      .array(integerDistributionBucketSchema)
      .nullable(),
    selectedRosterSize: z.array(integerDistributionBucketSchema).nullable(),
    finalFormedSize: z.array(integerDistributionBucketSchema).nullable(),
    provenance: z.array(formationProvenanceBucketSchema).nullable(),
    sourceIncompleteFormedRequestCount: z.number().int().nonnegative(),
  })
  .strict();

const recoveryLifecycleSchema = z
  .object({
    ...internalMetricShape("recovery-opening-lifecycle.v1"),
    completedOpeningCount: nullableCountSchema,
    applicationCount: nullableCountSchema,
    appliedOpeningCount: nullableCountSchema,
    convertedOpeningCount: nullableCountSchema,
    filledOpeningCount: nullableCountSchema,
    closedOpeningCount: nullableCountSchema,
    expiredOpeningCount: nullableCountSchema,
    withdrawnApplicationCount: nullableCountSchema,
    recoveredFormationCount: nullableCountSchema,
  })
  .strict();

function createGroupOutcomeRateSchema<DefinitionVersion extends string>(
  definitionVersion: DefinitionVersion,
) {
  return z
    .object({
      ...internalMetricShape(definitionVersion),
      eligibleGroupCount: nullableCountSchema,
      achievedGroupCount: nullableCountSchema,
      ratePercent: nullablePercentSchema,
      sourceIncompleteGroupCount: z.number().int().nonnegative(),
    })
    .strict();
}

function createPlanYieldSchema<DefinitionVersion extends string>(
  definitionVersion: DefinitionVersion,
) {
  return z
    .object({
      ...internalMetricShape(definitionVersion),
      formedGroupCount: nullableCountSchema,
      planCount: nullableCountSchema,
      yieldPerFormedGroup: nullableMetricNumberSchema,
    })
    .strict();
}

const continuationSchema = z
  .object({
    ...internalMetricShape("group-continuation-window-rate.v1"),
    eligibleWindowCount: nullableCountSchema,
    continuedWindowCount: nullableCountSchema,
    continuationRatePercent: nullablePercentSchema,
    sourceIncompleteWindowCount: z.number().int().nonnegative(),
  })
  .strict();

const timeToFirstProposalSchema = z
  .object({
    ...internalMetricShape("mean-time-to-first-proposal.v1"),
    eligibleRequestCount: nullableCountSchema,
    coveredRequestCount: nullableCountSchema,
    uncoveredRequestCount: nullableCountSchema,
    totalLatencyMilliseconds: nullableMetricNumberSchema,
    meanLatencyMilliseconds: nullableMetricNumberSchema,
  })
  .strict();

const nonresponseOrdinalBucketSchema = z
  .object({
    bucket: z.enum(["1", "2", "3", "4+"]),
    eligibleExposureCount: z.number().int().nonnegative(),
    unansweredExposureCount: z.number().int().nonnegative(),
    nonresponseRatePercent: nullablePercentSchema,
  })
  .strict();

const nonresponseFatigueSchema = z
  .object({
    ...internalMetricShape("candidate-nonresponse-by-exposure-ordinal.v1"),
    byExposureOrdinal: z
      .array(nonresponseOrdinalBucketSchema)
      .length(4)
      .nullable(),
  })
  .strict();

function coveredInternalMetricShape<DefinitionVersion extends string>(
  definitionVersion: DefinitionVersion,
) {
  return {
    ...internalMetricShape(definitionVersion),
    sourceCoverageStartsAt: z.string().datetime().nullable(),
    sourceDefinitionVersion: z.string().trim().min(1).nullable(),
  };
}

const requestPoolStateBucketSchema = z
  .object({
    poolState: z.enum(["OPEN", "CLOSED"]),
    requestingMemberCount: z.number().int().nonnegative(),
    requestCount: z.number().int().nonnegative(),
    requestCreationRatePercent: nullablePercentSchema,
  })
  .strict();

const requestCreationByPoolStateAvailableSchema = z
  .object({
    ...coveredInternalMetricShape(
      "request-creation-by-pool-state-member-rate.v1",
    ),
    eligibleMemberCount: nullableCountSchema,
    requestingMemberCount: nullableCountSchema,
    requestCreationRatePercent: nullablePercentSchema,
    byPoolState: z.array(requestPoolStateBucketSchema).length(2).nullable(),
    sourceIncompleteMemberCount: z.number().int().nonnegative(),
    sourceIncompleteRequestCount: z.number().int().nonnegative(),
  })
  .strict();

const requestCreationByPoolStateSchema = z.union([
  requestCreationByPoolStateAvailableSchema,
  createUnavailableMetricSchema(
    "request-creation-by-pool-state-member-rate.v1",
  ),
]);

const activeSupplyCellSchema = z
  .object({
    scope: z.enum(["LOCAL", "ONLINE"]),
    allocationCell: z.string().trim().min(1),
    observationCount: z.number().int().nonnegative(),
    minimumEligibleCandidateSupply: z.number().nonnegative(),
    medianEligibleCandidateSupply: z.number().nonnegative(),
    maximumEligibleCandidateSupply: z.number().nonnegative(),
    meanEligibleCandidateSupply: z.number().nonnegative(),
  })
  .strict();

const activeCandidateSupplyAvailableSchema = z
  .object({
    ...coveredInternalMetricShape("active-candidate-supply-observation.v1"),
    observationCount: nullableCountSchema,
    byScopeAndCell: z.array(activeSupplyCellSchema).nullable(),
    sourceIncompleteObservationCount: z.number().int().nonnegative(),
  })
  .strict();

const activeCandidateSupplySchema = z.union([
  activeCandidateSupplyAvailableSchema,
  createUnavailableMetricSchema("active-candidate-supply-observation.v1"),
]);

const capacityPressureAvailableSchema = z
  .object({
    ...coveredInternalMetricShape("allocation-capacity-pressure.v1"),
    observationCount: nullableCountSchema,
    belowRequestedMinimumObservationCount: nullableCountSchema,
    belowRequestedMinimumRatePercent: nullablePercentSchema,
    commitAttemptCount: nullableCountSchema,
    capacityConflictCount: nullableCountSchema,
    reservationConflictCount: nullableCountSchema,
    sourceIncompleteObservationCount: z.number().int().nonnegative(),
  })
  .strict();

const capacityPressureSchema = z.union([
  capacityPressureAvailableSchema,
  createUnavailableMetricSchema("allocation-capacity-pressure.v1"),
]);

const internalMetricsSchema = z
  .object({
    candidatePoolActivation: candidatePoolActivationSchema,
    formationDistribution: formationDistributionSchema,
    recoveryLifecycle: recoveryLifecycleSchema,
    scheduleResolution: createGroupOutcomeRateSchema(
      "schedule-resolution-formed-group-rate.v1",
    ),
    firstPlanReadiness: createGroupOutcomeRateSchema(
      "first-plan-readiness-formed-group-rate.v1",
    ),
    scheduledPlans: createPlanYieldSchema(
      "scheduled-plan-yield-per-formed-group.v1",
    ),
    completedActivities: createPlanYieldSchema(
      "completed-activity-yield-per-formed-group.v1",
    ),
    continuation: continuationSchema,
    timeToFirstProposal: timeToFirstProposalSchema,
    nonresponseFatigue: nonresponseFatigueSchema,
    requestCreationByPoolState: requestCreationByPoolStateSchema,
    activeCandidateSupply: activeCandidateSupplySchema,
    capacityPressure: capacityPressureSchema,
  })
  .strict();

const adminPilotMetricsCohortSchema = z
  .object({
    code: z.string().trim().min(1),
    memberCount: z.number().int().nonnegative(),
    proposalCoverage: proposalCoverageSchema,
    formationConversion: formationConversionSchema,
    candidateWillingness: candidateWillingnessSchema,
    activityActivation: activityActivationSchema,
    internal: internalMetricsSchema,
  })
  .strict();

export const adminPilotMetricsSchema = z
  .object({
    evaluatedAt: z.string().datetime(),
    activeCohort: adminPilotMetricsCohortSchema.nullable(),
  })
  .strict();

export type AdminPilotMetrics = z.infer<typeof adminPilotMetricsSchema>;
export type AdminPilotMetricDefinition = z.infer<typeof metricDefinitionSchema>;
