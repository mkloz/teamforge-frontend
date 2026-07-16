import { resolvePlanCategory } from "@/features/forge/lib/forge-activity-builders/activity-option-resolution";
import { resolveGroupSize } from "@/features/forge/lib/forge-activity-builders/group-size";
import {
  buildDateTime,
  getCoordinatePair,
  parseCostAmount,
} from "@/features/forge/lib/forge-activity-builders/plan-value-parsers";
import type { AutoForgeExecutionInput } from "@/features/forge/lib/forge-execution-schema";
import {
  AUTO_FORGE_REQUEST_POLICY_VERSION,
  type CreateAutoForgeRequestInput,
} from "@/features/forge/schemas/auto-forge-request.schema";
import { isManagedAssetReference } from "@/shared/validators/url.validator";

export function buildAutoForgeRequestInput(
  input: AutoForgeExecutionInput,
): CreateAutoForgeRequestInput {
  const coordinates =
    input.locationType === "IN_PERSON"
      ? getCoordinatePair(input.planLocationLat, input.planLocationLng)
      : null;

  return {
    groupSize: resolveGroupSize(input),
    scope: input.forgeScope,
    maxDistanceKm: input.forgeScope === "LOCAL" ? input.maxDistanceKm : null,
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
    policyVersion: AUTO_FORGE_REQUEST_POLICY_VERSION,
  };
}

function optionalText(value: string) {
  return value.trim() || null;
}

function managedAssetOrNull(value: string | null) {
  return value && isManagedAssetReference(value) ? value : null;
}
