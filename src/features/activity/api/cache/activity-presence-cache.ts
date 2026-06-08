import type {
  ActivityDirectSelectionData,
  ActivityGroupSelectionData,
} from "@/features/activity/api/activity-query-data";
import {
  ACTIVITY_CHATS_QUERY_KEY,
  ACTIVITY_FRIENDSHIPS_QUERY_KEY,
  ACTIVITY_GROUPS_QUERY_KEY,
} from "@/features/activity/api/activity-query-keys";
import { appQueryClient } from "@/shared/api/query-client";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import type {
  ChatApi,
  FriendshipApi,
  GroupApi,
  OnlineStatus,
} from "@/shared/schemas";

export const ActivityPresenceCache = {
  applyPresenceChanged(userId: string, onlineStatus: OnlineStatus) {
    appQueryClient.setQueryData<ChatApi[]>(
      ACTIVITY_CHATS_QUERY_KEY,
      (current) =>
        current?.map((chat) => ({
          ...chat,
          counterpart:
            chat.counterpart?.id === userId
              ? { ...chat.counterpart, onlineStatus }
              : chat.counterpart,
          participants: chat.participants?.map((participant) =>
            participant.user.id === userId
              ? {
                  ...participant,
                  user: {
                    ...participant.user,
                    onlineStatus,
                  },
                }
              : participant,
          ),
        })) ?? current,
    );

    appQueryClient.setQueryData<FriendshipApi[]>(
      ACTIVITY_FRIENDSHIPS_QUERY_KEY,
      (current) =>
        current?.map((friendship) => ({
          ...friendship,
          requester:
            friendship.requester.id === userId
              ? { ...friendship.requester, onlineStatus }
              : friendship.requester,
          receiver:
            friendship.receiver.id === userId
              ? { ...friendship.receiver, onlineStatus }
              : friendship.receiver,
          counterpart:
            friendship.counterpart.id === userId
              ? { ...friendship.counterpart, onlineStatus }
              : friendship.counterpart,
        })) ?? current,
    );

    appQueryClient.setQueryData<GroupApi[]>(
      ACTIVITY_GROUPS_QUERY_KEY,
      (current) =>
        current?.map((group) => ({
          ...group,
          members: group.members.map((member) =>
            member.user.id === userId
              ? {
                  ...member,
                  user: {
                    ...member.user,
                    onlineStatus,
                  },
                }
              : member,
          ),
        })) ?? current,
    );

    for (const [
      queryKey,
      selection,
    ] of appQueryClient.getQueriesData<ActivityGroupSelectionData>({
      queryKey: APP_QUERY_KEYS.activity.groupSelection,
    })) {
      if (!selection?.group) {
        continue;
      }

      appQueryClient.setQueryData<ActivityGroupSelectionData>(queryKey, {
        ...selection,
        group: {
          ...selection.group,
          members:
            selection.group.members?.map((member) =>
              member.user?.id === userId
                ? Object.assign({}, member, {
                    user: member.user
                      ? Object.assign({}, member.user, { onlineStatus })
                      : member.user,
                  })
                : member,
            ) ?? [],
        },
      });
    }

    for (const [
      queryKey,
      selection,
    ] of appQueryClient.getQueriesData<ActivityDirectSelectionData>({
      queryKey: APP_QUERY_KEYS.activity.directSelection,
    })) {
      if (!selection?.chat) {
        continue;
      }

      appQueryClient.setQueryData<ActivityDirectSelectionData>(queryKey, {
        ...selection,
        chat: {
          ...selection.chat,
          participants:
            selection.chat.participants?.map((participant) =>
              participant.user?.id === userId
                ? Object.assign({}, participant, {
                    user: participant.user
                      ? Object.assign({}, participant.user, { onlineStatus })
                      : participant.user,
                  })
                : participant,
            ) ?? [],
        },
      });
    }
  },
};
