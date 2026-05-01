import type { ChatApi, GroupApi, PlanProposal } from "@/shared/schemas";

import { toMessageApi } from "@/features/activity/api/activity-message-cache";
import type {
  ActivityParticipant,
  Group,
  UnifiedConversation,
} from "@/features/activity/lib/activity-contract";
import {
  buildGroupParticipants,
  mapGroupMember,
} from "./activity-participant-projections";
import { mapMessages, mapSingleMessage } from "./activity-message-projections";

type ActivityFeedItem = UnifiedConversation;

export function mapGroup(
  group: GroupApi,
  currentUserId: string | null,
  proposals: PlanProposal[] = [],
  chatSummary?: Pick<ChatApi, "id" | "pinnedMessages"> | null,
): Group {
  const members = group.members.map((member) =>
    mapGroupMember(member, group.id),
  );
  const participants =
    members
      .map((member) => member.user)
      .filter(
        (participant): participant is ActivityParticipant =>
          participant !== undefined,
      ) ?? [];
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
    activity: {
      id: group.activity.id,
      title: group.activity.title,
      city: group.activity.city,
      status: group.activity.status,
      visibility: group.activity.visibility,
      access: group.activity.access,
      forgeMode: group.activity.forgeMode,
    },
    plan: group.plan
      ? {
          id: group.plan.id,
          title: group.plan.title,
          description: null,
          category: group.plan.category,
          coverImage: group.avatar,
          status: group.plan.status,
          dateTime: group.plan.dateTime,
          locationMode: group.plan.locationMode,
          location: group.activity.city,
          locationLat: null,
          locationLng: null,
          cost: group.plan.cost,
          costAmount: null,
          costDetails: null,
          completedAt: null,
          cancelledAt: null,
          createdAt: group.createdAt,
          updatedAt: group.updatedAt,
          version: group.version,
          groupId: group.id,
          proposals,
        }
      : null,
    members,
    chat: chat
      ? {
          id: chat.id,
          pinnedMessages: mapMessages(
            chat.pinnedMessages ?? [],
            participants,
            currentUserId,
          ),
        }
      : undefined,
    planHistory: [],
  };
}

export function mapApiGroupFromSelection(group: Group): GroupApi {
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
    activity: {
      id: group.activity?.id ?? group.activityId,
      title: group.activity?.title ?? group.name,
      city: group.activity?.city ?? null,
      status: group.activity?.status ?? "MATCHED",
      visibility: group.activity?.visibility ?? "PUBLIC",
      access: group.activity?.access ?? "OPEN",
      forgeMode: group.activity?.forgeMode ?? "AUTO",
      interests: [],
    },
    plan: group.plan
      ? {
          id: group.plan.id,
          title: group.plan.title,
          category: group.plan.category,
          status: group.plan.status,
          dateTime: group.plan.dateTime,
          locationMode: group.plan.locationMode,
          cost: group.plan.cost,
        }
      : null,
    chat: group.chat
      ? {
          id: group.chat.id,
          pinnedMessages: group.chat.pinnedMessages?.map((message) =>
            toMessageApi(message),
          ),
        }
      : null,
    members:
      group.members?.map((member) => ({
        userId: member.userId,
        role: member.role,
        joinedAt: member.joinedAt,
        leftAt: member.leftAt,
        compatibilityScore: member.compatibilityScore,
        user: {
          id: member.user?.id ?? member.userId,
          name: member.user?.name ?? "Member",
          avatar: member.user?.avatar ?? null,
          personalityType: member.user?.personalityType ?? null,
          trustScore: member.user?.trustScore ?? 0,
          onlineStatus: member.user?.onlineStatus,
        },
      })) ?? [],
  };
}

export function findGroupChat(chats: ChatApi[], groupId: string) {
  return chats.find((chat) => chat.groupId === groupId) ?? null;
}

export function buildGroupFeedItem(
  groupDto: GroupApi,
  chats: ChatApi[],
  currentUserParticipant: ActivityParticipant,
  typingByChatId: Record<
    string,
    Array<{ id: string; name: string; avatar: string | null }>
  >,
): ActivityFeedItem {
  const chat = findGroupChat(chats, groupDto.id);
  const group = mapGroup(groupDto, currentUserParticipant.id, [], chat ?? null);
  const participants = buildGroupParticipants(group, currentUserParticipant);
  const latestMessage = chat?.lastMessage
    ? mapSingleMessage(
        chat.lastMessage,
        participants,
        currentUserParticipant.id,
      )
    : undefined;

  return {
    id: group.id,
    kind: "group",
    unreadCount: chat?.unreadCount ?? 0,
    isTyping: chat ? (typingByChatId[chat.id]?.length ?? 0) > 0 : false,
    latestMessage,
    group,
  };
}
