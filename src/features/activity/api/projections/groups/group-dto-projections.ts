import type { ChatApi, GroupApi, PlanProposal } from "@/shared/schemas";

import type {
  ActivityParticipant,
  Group,
} from "@/features/activity/lib/activity-contract";
import { mapGroupMember } from "@/features/activity/api/projections/activity-participant-projections";

import { mapGroupPinnedMessages } from "./group-chat-projections";

export function mapGroup(
  group: GroupApi,
  currentUserId: string | null,
  proposals: PlanProposal[] = [],
  chatSummary?: Pick<ChatApi, "id" | "pinnedMessages"> | null,
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
          pinnedMessages: mapGroupPinnedMessages(
            chat,
            participants,
            currentUserId,
          ),
        }
      : undefined,
    planHistory: [],
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
  return {
    id: group.plan!.id,
    title: group.plan!.title,
    description: null,
    category: group.plan!.category,
    coverImage: group.avatar,
    status: group.plan!.status,
    dateTime: group.plan!.dateTime,
    locationMode: group.plan!.locationMode,
    location: group.plan!.location,
    locationLat: group.plan!.locationLat,
    locationLng: group.plan!.locationLng,
    cost: group.plan!.cost,
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
