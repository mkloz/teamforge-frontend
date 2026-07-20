import type { OperatorModerationConfigurationDetail } from "@/features/operator/public/operator-governance";

export function moderationConfigurationPayload(
  configuration: OperatorModerationConfigurationDetail,
) {
  return {
    assessmentModel: configuration.assessmentModel,
    authorityRules: configuration.authorityRules,
    failurePolicy: configuration.failurePolicy,
    moderationModel: configuration.moderationModel,
    moderationThresholds: configuration.moderationThresholds,
    policyVersion: configuration.policyVersion,
    promptVersion: configuration.promptVersion,
    rolloutMode: configuration.rolloutMode,
    schemaVersion: configuration.schemaVersion,
    thresholdVersion: configuration.thresholdVersion,
    workerSettings: configuration.workerSettings,
  };
}
