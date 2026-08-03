import { mapGroupMember } from "@/features/activity/api/projections/activity-participant-projections";
import { getDefinedActivityParticipants } from "@/features/activity/api/projections/participants/participant-collection-projections";

import type {
  ActivityParticipant,
  Group,
} from "@/features/activity/lib/activity-contract";
import type { ChatApi, GroupApi, PlanProposal } from "@/shared/schemas";

import {
  type ChatPreferenceSummary,
  getChatIsMutedForUser,
} from "../chat-user-preferences";
import { mapGroupPinnedMessages } from "./group-chat-projections";

type GroupChatSummary = Pick<ChatApi, "governance" | "id" | "pinnedMessages"> &
  ChatPreferenceSummary;

export function mapGroup(
  group: GroupApi,
  currentUserId: string | null,
  proposals: PlanProposal[] = [],
  chatSummary?: GroupChatSummary | null,
): Group {
  const governance = resolveGroupGovernance(group, chatSummary);
  const members = group.members.map((member) =>
    mapGroupMember(member, group.id),
  );
  const participants = getDefinedActivityParticipants(
    members.map((member) => member.user),
  );

  return {
    id: group.id,
    name: group.name,
    description: group.description,
    avatar: group.avatar,
    avatarMedia: group.avatarMedia ?? null,
    status: group.status,
    maxMembers: group.maxMembers,
    createdAt: group.createdAt,
    updatedAt: group.updatedAt,
    version: group.version,
    disbandedAt: group.disbandedAt,
    activityId: group.activityId,
    activity: mapGroupActivitySummary(group),
    plan: group.plan ? mapGroupPlan(group, proposals, governance) : null,
    members,
    chat: mapGroupChat(
      group,
      chatSummary,
      participants,
      currentUserId,
      governance,
    ),
    planHistory: mapGroupPlanHistory(group),
    governance,
  };
}

function mapGroupActivitySummary(group: GroupApi): Group["activity"] {
  return {
    id: group.activity.id,
    title: group.activity.title,
    city: group.activity.city,
    status: group.activity.status,
    visibility: group.activity.visibility,
    access: group.activity.access,
    forgeMode: group.activity.forgeMode,
  };
}

function mapGroupPlan(
  group: GroupApi,
  proposals: PlanProposal[],
  governance: GroupApi["governance"],
): NonNullable<Group["plan"]> {
  const { plan } = group;

  if (!plan) {
    throw new Error("Cannot map group plan without a plan payload.");
  }

  return {
    id: plan.id,
    title: plan.title,
    description: null,
    category: plan.category,
    coverImage: plan.coverImage ?? null,
    coverImageMedia: plan.coverImageMedia ?? null,
    status: plan.status,
    repeatExperimentVariant: plan.repeatExperimentVariant,
    scheduleMode: plan.scheduleMode,
    revision: plan.revision,
    isScheduleResolved: plan.isScheduleResolved,
    isLocationResolved: plan.isLocationResolved,
    nextRequiredAction: plan.nextRequiredAction,
    operationalState: plan.operationalState,
    dateTime: plan.dateTime,
    timeZoneId: plan.timeZoneId,
    localStartDate: plan.localStartDate,
    localStartTime: plan.localStartTime,
    scheduleFold: plan.scheduleFold,
    durationMinutes: plan.durationMinutes,
    endAt: plan.endAt,
    calendarSequence: plan.calendarSequence,
    locationMode: plan.locationMode,
    location: plan.location,
    locationLat: plan.locationLat,
    locationLng: plan.locationLng,
    cost: plan.cost,
    costAmount: null,
    costDetails: null,
    costAmountDecimal: null,
    costCurrency: null,
    costAccuracy: "UNKNOWN",
    costBasis: "UNKNOWN",
    depositAmountDecimal: null,
    refundPolicy: null,
    purchaseResponsibility: "UNKNOWN",
    costCheckedAt: null,
    costLegacyUnknown: true,
    completedAt: null,
    cancelledAt: null,
    createdAt: group.createdAt,
    updatedAt: group.updatedAt,
    version: group.version,
    groupId: group.id,
    governance: resolveGovernance(plan.governance, governance),
    proposals,
  };
}

function mapGroupChat(
  group: GroupApi,
  chatSummary: GroupChatSummary | null | undefined,
  participants: ActivityParticipant[],
  currentUserId: string | null,
  governance: GroupApi["governance"],
): Group["chat"] {
  const chat = getGroupChat(group, chatSummary);

  if (!chat) {
    return undefined;
  }

  return {
    id: chat.id,
    governance: resolveGovernance(chat.governance, governance),
    isMuted: getChatIsMutedForUser(chat, currentUserId),
    pinnedMessages: mapGroupPinnedMessages(
      {
        pinnedMessages: getGroupPinnedMessages(group, chatSummary),
      },
      participants,
      currentUserId,
    ),
  };
}

function resolveGroupGovernance(
  group: GroupApi,
  chatSummary: GroupChatSummary | null | undefined,
) {
  return resolveGovernance(
    group.governance,
    chatSummary?.governance,
    group.chat?.governance,
  );
}

function resolveGovernance(
  primary: GroupApi["governance"],
  ...fallbacks: GroupApi["governance"][]
) {
  if (primary != null) {
    return primary;
  }

  return fallbacks.find((governance) => governance != null);
}

function getGroupChat(
  group: GroupApi,
  chatSummary: GroupChatSummary | null | undefined,
) {
  return chatSummary ?? group.chat ?? null;
}

function getGroupPinnedMessages(
  group: GroupApi,
  chatSummary: GroupChatSummary | null | undefined,
) {
  return chatSummary?.pinnedMessages ?? group.chat?.pinnedMessages;
}

function mapGroupPlanHistory(
  group: GroupApi,
): NonNullable<Group["planHistory"]> {
  return group.planHistory?.map(mapGroupPlanHistoryItem) ?? [];
}

function mapGroupPlanHistoryItem(
  plan: NonNullable<GroupApi["planHistory"]>[number],
): NonNullable<Group["planHistory"]>[number] {
  return {
    id: plan.id,
    title: plan.title,
    category: plan.category,
    scheduleMode: plan.scheduleMode,
    dateTime: plan.dateTime,
    coverImage: plan.coverImage ?? null,
    coverImageMedia: plan.coverImageMedia ?? null,
    status: plan.status,
    locationMode: plan.locationMode,
    location: plan.location,
    locationLat: plan.locationLat,
    locationLng: plan.locationLng,
    cost: plan.cost,
  };
}
