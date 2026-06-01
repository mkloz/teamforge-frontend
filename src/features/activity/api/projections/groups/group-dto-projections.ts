import { mapGroupMember } from "@/features/activity/api/projections/activity-participant-projections";

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

type GroupChatSummary = Pick<ChatApi, "id" | "pinnedMessages"> &
  ChatPreferenceSummary;

export function mapGroup(
  group: GroupApi,
  currentUserId: string | null,
  proposals: PlanProposal[] = [],
  chatSummary?: GroupChatSummary | null,
): Group {
  const members = group.members.map((member) =>
    mapGroupMember(member, group.id),
  );
  const participants = members
    .map((member) => member.user)
    .filter(
      (participant): participant is ActivityParticipant =>
        participant !== undefined,
    );
  const chat = chatSummary ?? group.chat ?? null;
  const pinnedMessages =
    chatSummary?.pinnedMessages ?? group.chat?.pinnedMessages;

  return {
    id: group.id,
    name: group.name,
    description: group.description,
    avatar: group.avatar,
    status: group.status,
    maxMembers: group.maxMembers,
    createdAt: group.createdAt,
    updatedAt: group.updatedAt,
    version: group.version,
    disbandedAt: group.disbandedAt,
    activityId: group.activityId,
    activity: mapGroupActivitySummary(group),
    plan: group.plan ? mapGroupPlan(group, proposals) : null,
    members,
    chat: chat
      ? {
          id: chat.id,
          isMuted: getChatIsMutedForUser(chat, currentUserId),
          pinnedMessages: mapGroupPinnedMessages(
            {
              pinnedMessages,
            },
            participants,
            currentUserId,
          ),
        }
      : undefined,
    planHistory:
      group.planHistory?.map((plan) => ({
        id: plan.id,
        title: plan.title,
        category: plan.category,
        dateTime: plan.dateTime,
        coverImage: plan.coverImage ?? null,
        status: plan.status,
        locationMode: plan.locationMode,
        location: plan.location,
        locationLat: plan.locationLat,
        locationLng: plan.locationLng,
        cost: plan.cost,
      })) ?? [],
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
    status: plan.status,
    dateTime: plan.dateTime,
    locationMode: plan.locationMode,
    location: plan.location,
    locationLat: plan.locationLat,
    locationLng: plan.locationLng,
    cost: plan.cost,
    costAmount: null,
    costDetails: null,
    completedAt: null,
    cancelledAt: null,
    createdAt: group.createdAt,
    updatedAt: group.updatedAt,
    version: group.version,
    groupId: group.id,
    proposals,
  };
}
