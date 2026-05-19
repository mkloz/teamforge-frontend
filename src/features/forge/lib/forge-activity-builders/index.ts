import type { AutoForgeExecutionInput } from "@/features/forge/lib/forge-execution-schema";
import type {
  CreateActivityInput,
  ForgeActivityInput,
  User,
} from "@/shared/schemas";
import {
  isManagedAssetReference,
  isManagedUploadUrl,
} from "@/shared/validators/url.validator";

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

const MAX_ACTIVITY_TITLE_LENGTH = 140;
const MAX_ACTIVITY_DESCRIPTION_LENGTH = 1000;
const MAX_CITY_LENGTH = 100;
const MAX_GROUP_NAME_LENGTH = 120;
const MAX_GROUP_DESCRIPTION_LENGTH = 1000;
const MAX_PLAN_TITLE_LENGTH = 140;
const MAX_PLAN_DESCRIPTION_LENGTH = 1000;
const MAX_PLAN_LOCATION_LENGTH = 200;
const MAX_COST_DETAILS_LENGTH = 250;
const MAX_MEDIA_REFERENCE_LENGTH = 2048;

export function buildCreateActivityInput(
  user: User,
  input: AutoForgeExecutionInput,
  forgeMode: "AUTO" | "MANUAL",
): CreateActivityInput {
  const title = firstNonEmptyRequiredText(
    [input.selectedActivity, input.planName],
    MAX_ACTIVITY_TITLE_LENGTH,
  );
  const planCoordinates =
    input.locationType === "IN_PERSON"
      ? getCoordinatePair(input.planLocationLat, input.planLocationLng)
      : null;
  const userCoordinates = getCoordinatePair(user.locationLat, user.locationLng);
  const coordinates = planCoordinates ?? userCoordinates;

  return {
    title,
    description: firstNonEmptyOptionalText(
      [input.groupDescription, input.planName],
      MAX_ACTIVITY_DESCRIPTION_LENGTH,
    ),
    city: optionalText(user.city, MAX_CITY_LENGTH),
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
  options: { includeMatchingPreferences?: boolean } = {},
): ForgeActivityInput {
  const includeMatchingPreferences = options.includeMatchingPreferences ?? true;
  const planCoordinates =
    input.locationType === "IN_PERSON"
      ? getCoordinatePair(input.planLocationLat, input.planLocationLng)
      : null;
  const matchingPreferences = includeMatchingPreferences
    ? buildMatchingPreferences(input)
    : undefined;

  return {
    groupSize: resolveGroupSize(input),
    groupName: optionalText(input.groupName, MAX_GROUP_NAME_LENGTH),
    groupDescription: optionalText(
      input.groupDescription,
      MAX_GROUP_DESCRIPTION_LENGTH,
    ),
    groupAvatar: managedUploadOrNull(input.avatarImage),
    ...(matchingPreferences ? { matchingPreferences } : {}),
    plan: {
      title: requiredText(input.planName, MAX_PLAN_TITLE_LENGTH),
      description: optionalText(
        input.planDescription,
        MAX_PLAN_DESCRIPTION_LENGTH,
      ),
      coverImage: managedAssetReferenceOrNull(input.coverImage),
      category: resolvePlanCategory(input.selectedActivity),
      dateTime: buildDateTime(input.planDate, input.planTime),
      locationMode: input.locationType,
      location:
        input.locationType === "IN_PERSON" || input.locationType === "ONLINE"
          ? optionalText(input.planLocation, MAX_PLAN_LOCATION_LENGTH)
          : null,
      locationLat: planCoordinates?.lat,
      locationLng: planCoordinates?.lng,
      cost: input.planCost,
      costAmount: parseCostAmount(input),
      costDetails: optionalText(input.planCostDetails, MAX_COST_DETAILS_LENGTH),
    },
  };
}

function buildMatchingPreferences(
  input: AutoForgeExecutionInput,
): ForgeActivityInput["matchingPreferences"] {
  return {
    sharedGround: input.compatibilityWeight,
    freshPerspectives: input.diversityWeight,
    networkReach: input.networkReachWeight,
    ...(input.locationType === "IN_PERSON"
      ? { maxDistanceKm: input.maxDistanceKm }
      : {}),
  };
}

function firstNonEmptyRequiredText(
  values: Array<null | string>,
  maxLength: number,
) {
  for (const value of values) {
    const text = optionalText(value, maxLength);

    if (text) {
      return text;
    }
  }

  return "";
}

function firstNonEmptyOptionalText(
  values: Array<null | string>,
  maxLength: number,
) {
  return firstNonEmptyRequiredText(values, maxLength) || null;
}

function optionalText(value: null | string | undefined, maxLength: number) {
  const text = requiredText(value ?? "", maxLength);

  return text || null;
}

function requiredText(value: string, maxLength: number) {
  return value.trim().slice(0, maxLength).trimEnd();
}

function managedAssetReferenceOrNull(value: null | string | undefined) {
  const text = mediaTextOrNull(value);

  return text && isManagedAssetReference(text) ? text : null;
}

function managedUploadOrNull(value: null | string | undefined) {
  const text = mediaTextOrNull(value);

  return text && isManagedUploadUrl(text) ? text : null;
}

function mediaTextOrNull(value: null | string | undefined) {
  const text = value?.trim();

  return text && text.length <= MAX_MEDIA_REFERENCE_LENGTH ? text : null;
}
