import { z } from "zod";

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

const adminPilotMetricsCohortSchema = z
  .object({
    code: z.string().trim().min(1),
    memberCount: z.number().int().nonnegative(),
    activityActivation: activityActivationSchema,
  })
  .strict();

export const adminPilotMetricsSchema = z
  .object({
    evaluatedAt: z.string().datetime(),
    activeCohort: adminPilotMetricsCohortSchema.nullable(),
  })
  .strict();

export type AdminPilotMetrics = z.infer<typeof adminPilotMetricsSchema>;
