import type { AutoForgeExecutionInput } from "@/features/forge/lib/forge-execution-schema";
import type {
  CreateActivityInput,
  ForgeActivityInput,
  User,
} from "@/shared/schemas";

import {
  resolveActivityAccess,
  resolvePlanCategory,
} from "./activity-option-resolution";
import { resolveGroupSize } from "./group-size";
import { selectInterestIds } from "./interest-selection";
import {
  buildDateTime,
  getCoordinatePair,
  parseCostAmount,
} from "./plan-value-parsers";

export function buildCreateActivityInput(
  user: User,
  input: AutoForgeExecutionInput,
  forgeMode: "AUTO" | "MANUAL",
): CreateActivityInput {
  const title = input.selectedActivity?.trim() || input.planName.trim();
  const planCoordinates =
    input.locationType === "IN_PERSON"
      ? getCoordinatePair(input.planLocationLat, input.planLocationLng)
      : null;
  const userCoordinates = getCoordinatePair(user.locationLat, user.locationLng);
  const coordinates = planCoordinates ?? userCoordinates;

  return {
    title,
    description: input.groupDescription.trim() || input.planName.trim() || null,
    city: user.city?.trim() || null,
    locationLat: coordinates?.lat,
    locationLng: coordinates?.lng,
    visibility: input.visibility,
    access: resolveActivityAccess(input.visibility),
    forgeMode,
    interestIds: selectInterestIds(user, input.selectedActivity),
  };
}

export function buildForgeActivityInput(
  input: AutoForgeExecutionInput,
): ForgeActivityInput {
  const planCoordinates =
    input.locationType === "IN_PERSON"
      ? getCoordinatePair(input.planLocationLat, input.planLocationLng)
      : null;

  return {
    groupSize: resolveGroupSize(input),
    groupName: input.groupName.trim() || null,
    groupDescription: input.groupDescription.trim() || null,
    groupAvatar: input.avatarImage,
    plan: {
      title: input.planName.trim(),
      description: input.planDescription.trim() || null,
      coverImage: input.coverImage,
      category: resolvePlanCategory(input.selectedActivity),
      dateTime: buildDateTime(input.planDate, input.planTime),
      locationMode: input.locationType,
      location:
        input.locationType === "IN_PERSON" || input.locationType === "ONLINE"
          ? input.planLocation.trim() || null
          : null,
      locationLat: planCoordinates?.lat,
      locationLng: planCoordinates?.lng,
      cost: input.planCost,
      costAmount: parseCostAmount(input),
      costDetails: input.planCostDetails.trim() || null,
    },
  };
}
