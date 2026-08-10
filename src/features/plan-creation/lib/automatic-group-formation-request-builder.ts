import { resolvePlanCategory } from "@/features/plan-creation/lib/group-formation-activity-builders/activity-option-resolution";
import {
  buildDateTime,
  getCoordinatePair,
  parseCostAmount,
} from "@/features/plan-creation/lib/group-formation-activity-builders/plan-value-parsers";
import type { AutomaticGroupFormationExecutionInput } from "@/features/plan-creation/lib/group-formation-execution-schema";
import {
  AUTOMATIC_GROUP_FORMATION_RECOVERY_DISCLOSURE_VERSION,
  AUTOMATIC_GROUP_FORMATION_REQUEST_POLICY_VERSION,
  type CreateAutomaticGroupFormationRequestInput,
} from "@/features/plan-creation/schemas/automatic-group-formation-request.schema";
import { isManagedAssetReference } from "@/shared/validators/url.validator";

export function buildAutomaticGroupFormationRequestInput(
  input: AutomaticGroupFormationExecutionInput,
): CreateAutomaticGroupFormationRequestInput {
  const coordinates =
    input.locationType === "IN_PERSON"
      ? getCoordinatePair(input.planLocationLat, input.planLocationLng)
      : null;

  return {
    minimumGroupSize: input.autoMinSize,
    maximumGroupSize: input.autoMaxSize,
    recoveryDisclosureVersion:
      AUTOMATIC_GROUP_FORMATION_RECOVERY_DISCLOSURE_VERSION,
    scope: input.groupFormationScope,
    maxDistanceKm:
      input.groupFormationScope === "LOCAL" ? input.maxDistanceKm : null,
    plan: {
      title: input.planName.trim(),
      description: optionalText(input.planDescription),
      coverImage: managedAssetOrNull(input.coverImage),
      category:
        input.planCategory ?? resolvePlanCategory(input.selectedActivity),
      scheduleMode: input.planScheduleMode,
      dateTime:
        input.planScheduleMode === "FIXED"
          ? buildDateTime(input.planDate, input.planTime)
          : null,
      locationMode: input.locationType,
      location:
        input.locationType === "TBD" ? null : optionalText(input.planLocation),
      locationLat: coordinates?.lat ?? null,
      locationLng: coordinates?.lng ?? null,
      cost: input.planCost,
      costAmount: parseCostAmount(input),
      costDetails: optionalText(input.planCostDetails),
    },
    policyVersion: AUTOMATIC_GROUP_FORMATION_REQUEST_POLICY_VERSION,
  };
}

function optionalText(value: string) {
  return value.trim() || null;
}

function managedAssetOrNull(value: string | null) {
  return value && isManagedAssetReference(value) ? value : null;
}
