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

interface PresenceUpdate {
  lastSeenAt: string | null;
  onlineStatus: OnlineStatus;
  userId: string;
}

export const ActivityPresenceCache = {
  applyPresenceChanged(
    userId: string,
    onlineStatus: OnlineStatus,
    lastSeenAt: string | null,
  ) {
    const update = { lastSeenAt, onlineStatus, userId };

    updatePresenceListCaches(update);
    updateGroupSelectionPresenceCaches(update);
    updateDirectSelectionPresenceCaches(update);
  },
};

function updatePresenceListCaches(update: PresenceUpdate) {
  appQueryClient.setQueryData<ChatApi[]>(ACTIVITY_CHATS_QUERY_KEY, (current) =>
    mapCachedPresenceList(current, (chat) => applyChatPresence(chat, update)),
  );

  appQueryClient.setQueryData<FriendshipApi[]>(
    ACTIVITY_FRIENDSHIPS_QUERY_KEY,
    (current) =>
      mapCachedPresenceList(current, (friendship) =>
        applyFriendshipPresence(friendship, update),
      ),
  );

  appQueryClient.setQueryData<GroupApi[]>(
    ACTIVITY_GROUPS_QUERY_KEY,
    (current) =>
      mapCachedPresenceList(current, (group) =>
        applyGroupPresence(group, update),
      ),
  );
}

function updateGroupSelectionPresenceCaches(update: PresenceUpdate) {
  for (const [
    queryKey,
    selection,
  ] of appQueryClient.getQueriesData<ActivityGroupSelectionData>({
    queryKey: APP_QUERY_KEYS.activity.groupSelection,
  })) {
    if (!selection?.group) {
      continue;
    }

    appQueryClient.setQueryData<ActivityGroupSelectionData>(
      queryKey,
      applyGroupSelectionPresence(selection, update),
    );
  }
}

function updateDirectSelectionPresenceCaches(update: PresenceUpdate) {
  for (const [
    queryKey,
    selection,
  ] of appQueryClient.getQueriesData<ActivityDirectSelectionData>({
    queryKey: APP_QUERY_KEYS.activity.directSelection,
  })) {
    if (!selection?.chat) {
      continue;
    }

    appQueryClient.setQueryData<ActivityDirectSelectionData>(
      queryKey,
      applyDirectSelectionPresence(selection, update),
    );
  }
}

function mapCachedPresenceList<TItem>(
  current: TItem[] | undefined,
  applyPresence: (item: TItem) => TItem,
) {
  return current?.map((item) => applyPresence(item)) ?? current;
}

function applyChatPresence(
  chat: ChatApi,
  { lastSeenAt, onlineStatus, userId }: PresenceUpdate,
): ChatApi {
  return {
    ...chat,
    counterpart: updateOptionalPresenceUser(
      chat.counterpart,
      userId,
      onlineStatus,
      lastSeenAt,
    ),
    participants: chat.participants?.map((participant) =>
      participant.user.id === userId
        ? {
            ...participant,
            user: updatePresenceUser(
              participant.user,
              onlineStatus,
              lastSeenAt,
            ),
          }
        : participant,
    ),
  };
}

function applyFriendshipPresence(
  friendship: FriendshipApi,
  { lastSeenAt, onlineStatus, userId }: PresenceUpdate,
): FriendshipApi {
  return {
    ...friendship,
    requester: updateMatchingPresenceUser(
      friendship.requester,
      userId,
      onlineStatus,
      lastSeenAt,
    ),
    receiver: updateMatchingPresenceUser(
      friendship.receiver,
      userId,
      onlineStatus,
      lastSeenAt,
    ),
    counterpart: updateMatchingPresenceUser(
      friendship.counterpart,
      userId,
      onlineStatus,
      lastSeenAt,
    ),
  };
}

function applyGroupPresence(
  group: GroupApi,
  { lastSeenAt, onlineStatus, userId }: PresenceUpdate,
): GroupApi {
  return {
    ...group,
    members: group.members.map((member) =>
      member.user.id === userId
        ? {
            ...member,
            user: updatePresenceUser(member.user, onlineStatus, lastSeenAt),
          }
        : member,
    ),
  };
}

function applyGroupSelectionPresence(
  selection: ActivityGroupSelectionData,
  { lastSeenAt, onlineStatus, userId }: PresenceUpdate,
): ActivityGroupSelectionData {
  if (!selection.group) {
    return selection;
  }

  return {
    ...selection,
    group: {
      ...selection.group,
      members:
        selection.group.members?.map((member) =>
          member.user?.id === userId
            ? {
                ...member,
                user: updatePresenceUser(member.user, onlineStatus, lastSeenAt),
              }
            : member,
        ) ?? [],
    },
  };
}

function applyDirectSelectionPresence(
  selection: ActivityDirectSelectionData,
  { lastSeenAt, onlineStatus, userId }: PresenceUpdate,
): ActivityDirectSelectionData {
  if (!selection.chat) {
    return selection;
  }

  return {
    ...selection,
    chat: {
      ...selection.chat,
      participants:
        selection.chat.participants?.map((participant) =>
          participant.user?.id === userId
            ? {
                ...participant,
                user: updatePresenceUser(
                  participant.user,
                  onlineStatus,
                  lastSeenAt,
                ),
              }
            : participant,
        ) ?? [],
    },
  };
}

function updateMatchingPresenceUser<TUser extends { id: string }>(
  user: TUser,
  userId: string,
  onlineStatus: OnlineStatus,
  lastSeenAt: string | null,
) {
  return user.id === userId
    ? updatePresenceUser(user, onlineStatus, lastSeenAt)
    : user;
}

function updateOptionalPresenceUser<TUser extends { id: string }>(
  user: TUser | null | undefined,
  userId: string,
  onlineStatus: OnlineStatus,
  lastSeenAt: string | null,
) {
  return user?.id === userId
    ? updatePresenceUser(user, onlineStatus, lastSeenAt)
    : user;
}

function updatePresenceUser<TUser extends object>(
  user: TUser,
  onlineStatus: OnlineStatus,
  lastSeenAt: string | null,
) {
  return {
    ...user,
    lastSeenAt,
    onlineStatus,
  };
}
