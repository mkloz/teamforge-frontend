import { toMessageApi } from "@/features/activity/api/messages/message-mappers";
import type { Group } from "@/features/activity/lib/activity-contract";
import type { GroupApi } from "@/shared/schemas";

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
          coverImage: group.plan.coverImage,
          status: group.plan.status,
          dateTime: group.plan.dateTime,
          locationMode: group.plan.locationMode,
          location: group.plan.location,
          locationLat: group.plan.locationLat,
          locationLng: group.plan.locationLng,
          cost: group.plan.cost,
        }
      : null,
    chat: group.chat
      ? {
          id: group.chat.id,
          isMuted: group.chat.isMuted,
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
