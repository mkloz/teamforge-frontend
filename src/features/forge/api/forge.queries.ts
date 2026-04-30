import { queryOptions } from "@tanstack/react-query";

import { AuthQueries } from "@/features/auth/api/auth.queries";
import { appQueryClient } from "@/shared/api/query-client";
import type {
  ActivityAccess,
  CreateActivityInput,
  ForgeActivityInput,
  GroupApi,
  LocationMode,
  PlanCategory,
  User,
} from "@/shared/schemas";

import { ACTIVITIES, RECENT } from "../constants/forge.constants";
import type {
  FixedGroupSize,
  ForgeParticipant,
  ForgeResult,
  GroupSizeMode,
  Visibility,
} from "../lib/forge-contract";
import { ForgeApi } from "./forge.api";

const MIN_GROUP_SIZE = 2;
const MAX_GROUP_SIZE = 8;
const DEFAULT_GROUP_SIZE = 6;
const FORGE_FRIENDS_QUERY_KEY = ["forge", "friends"] as const;
const FIXED_GROUP_SIZES = [2, 3, 4, 5, 6, 7, 8] as const;

export interface ForgeExecutionResult {
  forgeResult: ForgeResult;
  participants: ForgeParticipant[];
  activityId: string | null;
  groupId: string | null;
  chatId: string | null;
  planId: string | null;
  requestIds: {
    createActivity: string | null;
    forgeActivity: string | null;
  };
}

export interface AutoForgeExecutionInput {
  selectedActivity: string | null;
  planName: string;
  planDate: string;
  planTime: string;
  planLocation: string;
  locationType: LocationMode;
  groupSizeMode: GroupSizeMode;
  fixedSize: FixedGroupSize;
  autoMinSize: number;
  autoMaxSize: number;
  visibility: Visibility;
  groupDescription: string;
}

function normalizeTrustScore(score: number) {
  return score > 0 && score <= 1 ? Math.round(score * 100) : Math.round(score);
}

function normalizeFixedGroupSize(value: number): FixedGroupSize {
  const normalized = Math.round(value);
  const clamped = Math.min(
    MAX_GROUP_SIZE,
    Math.max(MIN_GROUP_SIZE, normalized),
  );

  return FIXED_GROUP_SIZES[clamped - MIN_GROUP_SIZE];
}

function resolveGroupSize(input: {
  groupSizeMode: GroupSizeMode;
  fixedSize: FixedGroupSize;
  autoMinSize: number;
  autoMaxSize: number;
}) {
  if (input.groupSizeMode === "FIXED") {
    return input.fixedSize;
  }

  return normalizeFixedGroupSize((input.autoMinSize + input.autoMaxSize) / 2);
}

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
  if (!planDate) {
    return null;
  }

  if (!planTime) {
    return null;
  }

  const timestamp = new Date(`${planDate}T${planTime}`);

  return Number.isNaN(timestamp.getTime()) ? null : timestamp.toISOString();
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

function buildCreateActivityInput(
  user: User,
  input: AutoForgeExecutionInput,
  forgeMode: "AUTO" | "MANUAL",
): CreateActivityInput {
  const title = input.selectedActivity?.trim() || input.planName.trim();

  return {
    title,
    description: input.groupDescription.trim() || input.planName.trim() || null,
    city: user.city ?? null,
    locationLat: null,
    locationLng: null,
    visibility: input.visibility,
    access: resolveActivityAccess(input.visibility),
    forgeMode,
    interestIds: selectInterestIds(user, input.selectedActivity),
  };
}

function buildForgeActivityInput(
  input: AutoForgeExecutionInput,
): ForgeActivityInput {
  return {
    groupSize: resolveGroupSize(input),
    plan: {
      title: input.planName.trim(),
      description: null,
      category: resolvePlanCategory(input.selectedActivity),
      dateTime: buildDateTime(input.planDate, input.planTime),
      locationMode: input.locationType,
      location:
        input.locationType === "IN_PERSON"
          ? input.planLocation.trim() || null
          : null,
      locationLat: null,
      locationLng: null,
      cost: "FREE",
      costAmount: null,
      costDetails: null,
    },
  };
}

function mapGroupMemberToParticipant(
  groupId: string,
  member: GroupApi["members"][number],
  index: number,
): ForgeParticipant {
  return {
    userId: member.userId,
    groupId,
    role: member.role,
    joinedAt: member.joinedAt,
    leftAt: member.leftAt,
    compatibilityScore: member.compatibilityScore,
    sortOrder: index,
    user: {
      id: member.user.id,
      name: member.user.name,
      avatar: member.user.avatar ?? member.user.name.slice(0, 2).toUpperCase(),
      trustScore: normalizeTrustScore(member.user.trustScore),
    },
  };
}

function mapGroupToParticipants(group: GroupApi, currentUserId: string) {
  return group.members
    .filter((member) => member.userId !== currentUserId)
    .map((member, index) =>
      mapGroupMemberToParticipant(group.id, member, index),
    );
}

async function getCurrentUser() {
  return appQueryClient.ensureQueryData(AuthQueries.currentUser());
}

export class ForgeQueries {
  static friendCandidates() {
    return queryOptions({
      queryKey: FORGE_FRIENDS_QUERY_KEY,
      queryFn: () => ForgeApi.getFriends(),
      staleTime: 60_000,
    });
  }

  static getInitialParticipants() {
    return [] as ForgeParticipant[];
  }

  static normalizeFixedGroupSize(value: number) {
    return normalizeFixedGroupSize(value);
  }

  static async executeManualForge(
    input: AutoForgeExecutionInput,
  ): Promise<ForgeExecutionResult> {
    const currentUser = await getCurrentUser();
    const createActivityInput = buildCreateActivityInput(
      currentUser,
      input,
      "MANUAL",
    );

    if (createActivityInput.interestIds.length === 0) {
      return {
        forgeResult: "FAILED",
        participants: [],
        activityId: null,
        groupId: null,
        chatId: null,
        planId: null,
        requestIds: {
          createActivity: null,
          forgeActivity: null,
        },
      };
    }

    const activityResult = await ForgeApi.createActivity(createActivityInput);
    const forgeResult = await ForgeApi.forgeActivity(
      activityResult.data.id,
      buildForgeActivityInput(input),
    );
    const group = await ForgeApi.getGroup(forgeResult.data.group.id);

    return {
      forgeResult: "SUCCESS",
      participants: mapGroupToParticipants(group, currentUser.id),
      activityId: forgeResult.data.activityId,
      groupId: group.id,
      chatId: forgeResult.data.chat.id,
      planId: forgeResult.data.plan.id,
      requestIds: {
        createActivity: activityResult.requestId,
        forgeActivity: forgeResult.requestId,
      },
    };
  }

  static async executeAutoForge(
    input: AutoForgeExecutionInput,
  ): Promise<ForgeExecutionResult> {
    const currentUser = await getCurrentUser();
    const createActivityInput = buildCreateActivityInput(
      currentUser,
      input,
      "AUTO",
    );

    if (createActivityInput.interestIds.length === 0) {
      return {
        forgeResult: "FAILED",
        participants: [],
        activityId: null,
        groupId: null,
        chatId: null,
        planId: null,
        requestIds: {
          createActivity: null,
          forgeActivity: null,
        },
      };
    }

    const activityResult = await ForgeApi.createActivity(createActivityInput);
    const forgeResult = await ForgeApi.forgeActivity(
      activityResult.data.id,
      buildForgeActivityInput(input),
    );
    const group = await ForgeApi.getGroup(forgeResult.data.group.id);

    return {
      forgeResult: "SUCCESS",
      participants: mapGroupToParticipants(group, currentUser.id),
      activityId: forgeResult.data.activityId,
      groupId: group.id,
      chatId: forgeResult.data.chat.id,
      planId: forgeResult.data.plan.id,
      requestIds: {
        createActivity: activityResult.requestId,
        forgeActivity: forgeResult.requestId,
      },
    };
  }

  static getDefaultGroupSize() {
    return DEFAULT_GROUP_SIZE;
  }
}
