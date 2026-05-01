import type {
  ActivityAccess,
  CreateActivityInput,
  ForgeActivityInput,
  PlanCategory,
  User,
} from "@/shared/schemas";

import { ACTIVITIES, RECENT } from "@/features/forge/constants/forge.constants";
import type { AutoForgeExecutionInput } from "@/features/forge/api/forge-types";
import type {
  GroupSizeMode,
  Visibility,
} from "@/features/forge/lib/forge-contract";
import { normalizeFixedGroupSize } from "@/features/forge/lib/forge-size";

function findActivityOption(selectedActivity: string | null) {
  if (!selectedActivity) {
    return null;
  }

  const directMatch = ACTIVITIES.find(
    (activity) => activity.label === selectedActivity,
  );

  if (directMatch) {
    return directMatch;
  }

  const recentMatch = RECENT.find(
    (activity) => activity.label === selectedActivity,
  );

  if (!recentMatch) {
    return null;
  }

  return ACTIVITIES.find((activity) => activity.id === recentMatch.id) ?? null;
}

function resolveGroupSize(input: {
  groupSizeMode: GroupSizeMode;
  fixedSize: number;
  autoMinSize: number;
  autoMaxSize: number;
}) {
  if (input.groupSizeMode === "FIXED") {
    return normalizeFixedGroupSize(input.fixedSize);
  }

  return normalizeFixedGroupSize((input.autoMinSize + input.autoMaxSize) / 2);
}

function resolvePlanCategory(selectedActivity: string | null): PlanCategory {
  const match = findActivityOption(selectedActivity);

  return (match?.id as PlanCategory | undefined) ?? "OTHER";
}

function resolveActivityAccess(visibility: Visibility): ActivityAccess {
  if (visibility === "PUBLIC") {
    return "OPEN";
  }

  return "BY_REQUEST";
}

function buildDateTime(planDate: string, planTime: string) {
  if (!planDate || !planTime) {
    return null;
  }

  const timestamp = new Date(`${planDate}T${planTime}`);

  return Number.isNaN(timestamp.getTime()) ? null : timestamp.toISOString();
}

function getCoordinatePair(
  lat: number | null | undefined,
  lng: number | null | undefined,
) {
  return typeof lat === "number" &&
    Number.isFinite(lat) &&
    typeof lng === "number" &&
    Number.isFinite(lng)
    ? { lat, lng }
    : null;
}

function parseCostAmount(input: AutoForgeExecutionInput) {
  if (input.planCost !== "PAID") {
    return null;
  }

  const amount = Number(input.planCostAmount);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

function selectInterestIds(user: User, selectedActivity: string | null) {
  const interests = user.interests ?? [];

  if (interests.length === 0) {
    return [];
  }

  const match = findActivityOption(selectedActivity);
  const keywords = new Set(
    [selectedActivity, match?.label, match?.description, match?.id]
      .filter(Boolean)
      .flatMap((value) =>
        String(value)
          .toLowerCase()
          .split(/[^a-z0-9]+/)
          .filter((part) => part.length >= 3),
      ),
  );

  const matchingInterests = interests.filter((interest) => {
    const haystack =
      `${interest.name} ${interest.slug} ${interest.aliases.join(" ")}`.toLowerCase();
    return [...keywords].some((keyword) => haystack.includes(keyword));
  });

  const source = matchingInterests.length > 0 ? matchingInterests : interests;

  return source.slice(0, 10).map((interest) => interest.id);
}

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
    city: user.city ?? null,
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
        input.locationType === "IN_PERSON"
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
