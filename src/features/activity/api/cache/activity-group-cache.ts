import type { ActivityGroupSelectionData } from "@/features/activity/api/activity-query-data";
import {
  ACTIVITY_CHATS_QUERY_KEY,
  ACTIVITY_GROUPS_QUERY_KEY,
} from "@/features/activity/api/activity-query-keys";
import { toMessageApi } from "@/features/activity/api/messages/message-mappers";
import type { Group } from "@/features/activity/lib/activity-contract";
import { appQueryClient } from "@/shared/api/query-client";
import { invalidateHomeGroupSurfaces } from "@/shared/api/query-invalidation";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import { resetViewerProfileQueries } from "@/shared/api/viewer-profile-cache";
import type { ChatApi, GroupApi, PlanProposal } from "@/shared/schemas";

interface RealtimeGroupUpdateOptions {
  currentUserId: string;
  getGroupVersion: (
    group:
      | Pick<GroupApi, "updatedAt" | "version">
      | Pick<Group, "updatedAt" | "version">,
  ) => number;
  group: GroupApi;
  mapApiGroupFromSelection: (group: Group, baseGroup: GroupApi) => GroupApi;
  mapGroup: (
    group: GroupApi,
    currentUserId: string | null,
    proposals?: PlanProposal[],
    chatSummary?: Pick<
      ChatApi,
      "governance" | "id" | "isMuted" | "pinnedMessages"
    > | null,
  ) => Group;
}

type GroupVersionSource =
  | Pick<GroupApi, "updatedAt" | "version">
  | Pick<Group, "updatedAt" | "version">;

type ActivityGroupSelectionWithGroup = ActivityGroupSelectionData & {
  group: Group;
};

interface UpdateGroupSelectionCacheInput {
  current: ActivityGroupSelectionData | undefined;
  currentUserId: string;
  getGroupVersion: (group: GroupVersionSource) => number;
  group: GroupApi;
  isStillMember: boolean;
  mapApiGroupFromSelection: RealtimeGroupUpdateOptions["mapApiGroupFromSelection"];
  mapGroup: RealtimeGroupUpdateOptions["mapGroup"];
}

export const ActivityGroupCache = {
  applyRealtimeGroupUpdate({
    currentUserId,
    getGroupVersion,
    group,
    mapApiGroupFromSelection,
    mapGroup,
  }: RealtimeGroupUpdateOptions) {
    const cachedGroup = appQueryClient
      .getQueryData<GroupApi[]>(ACTIVITY_GROUPS_QUERY_KEY)
      ?.find((item) => item.id === group.id);

    if (hasViewerProfileAccessChanged(cachedGroup, group)) {
      void resetViewerProfileQueries();
    }

    const isStillMember = isActiveGroupMember(group, currentUserId);

    appQueryClient.setQueryData<GroupApi[]>(
      ACTIVITY_GROUPS_QUERY_KEY,
      (current) =>
        updateActivityGroupsCache({
          current,
          getGroupVersion,
          group,
          isStillMember,
        }),
    );

    appQueryClient.setQueryData<ChatApi[]>(
      ACTIVITY_CHATS_QUERY_KEY,
      (current) =>
        updateActivityChatsCache({
          current,
          group,
          isStillMember,
        }),
    );

    appQueryClient.setQueryData<ActivityGroupSelectionData | undefined>(
      APP_QUERY_KEYS.activity.groupSelectionById(group.id),
      (current) =>
        updateGroupSelectionCache({
          current,
          currentUserId,
          getGroupVersion,
          group,
          isStillMember,
          mapApiGroupFromSelection,
          mapGroup,
        }),
    );

    void invalidateHomeGroupSurfaces();
  },
};

function hasViewerProfileAccessChanged(
  cachedGroup: GroupApi | undefined,
  incomingGroup: GroupApi,
) {
  if (!cachedGroup) {
    return true;
  }

  if (cachedGroup.status !== incomingGroup.status) {
    return true;
  }

  return (
    getActiveMemberIds(cachedGroup).join(":") !==
    getActiveMemberIds(incomingGroup).join(":")
  );
}

function getActiveMemberIds(group: GroupApi) {
  return group.members
    .filter((member) => member.leftAt === null)
    .map((member) => member.userId)
    .sort();
}

function isActiveGroupMember(group: GroupApi, currentUserId: string) {
  return group.members.some(
    (member) => member.userId === currentUserId && member.leftAt === null,
  );
}

function updateActivityGroupsCache({
  current,
  getGroupVersion,
  group,
  isStillMember,
}: {
  current: GroupApi[] | undefined;
  getGroupVersion: (group: GroupVersionSource) => number;
  group: GroupApi;
  isStillMember: boolean;
}) {
  const currentGroup = current?.find((item) => item.id === group.id);
  const nextGroup = getNewestGroup({
    currentGroup,
    getGroupVersion,
    incomingGroup: group,
  });
  const withoutExisting = removeGroupFromList(current, group.id);

  if (!isStillMember) {
    return withoutExisting;
  }

  return [nextGroup, ...withoutExisting].sort(
    (left, right) => getGroupVersion(right) - getGroupVersion(left),
  );
}

function getNewestGroup({
  currentGroup,
  getGroupVersion,
  incomingGroup,
}: {
  currentGroup: GroupApi | undefined;
  getGroupVersion: (group: GroupVersionSource) => number;
  incomingGroup: GroupApi;
}) {
  return currentGroup &&
    getGroupVersion(currentGroup) > getGroupVersion(incomingGroup)
    ? currentGroup
    : incomingGroup;
}

function removeGroupFromList(current: GroupApi[] | undefined, groupId: string) {
  return current?.filter((item) => item.id !== groupId) ?? [];
}

function updateActivityChatsCache({
  current,
  group,
  isStillMember,
}: {
  current: ChatApi[] | undefined;
  group: GroupApi;
  isStillMember: boolean;
}) {
  if (!current) {
    return current;
  }

  if (!isStillMember) {
    return current.filter((chat) => chat.groupId !== group.id);
  }

  return current.map((chat) => updateChatGroupSummary(chat, group));
}

function updateChatGroupSummary(chat: ChatApi, group: GroupApi) {
  if (chat.groupId !== group.id || !chat.group) {
    return chat;
  }

  return {
    ...chat,
    group: {
      ...chat.group,
      avatar: group.avatar,
      name: group.name,
      status: group.status,
    },
  };
}

function updateGroupSelectionCache({
  current,
  currentUserId,
  getGroupVersion,
  group,
  isStillMember,
  mapApiGroupFromSelection,
  mapGroup,
}: UpdateGroupSelectionCacheInput) {
  if (!hasActiveGroupSelection(current)) {
    return current;
  }

  if (!isStillMember) {
    return clearInactiveGroupSelection(current);
  }

  return updateActiveGroupSelection({
    current,
    currentUserId,
    getGroupVersion,
    incomingGroup: group,
    mapApiGroupFromSelection,
    mapGroup,
  });
}

function hasActiveGroupSelection(
  current: ActivityGroupSelectionData | undefined,
): current is ActivityGroupSelectionWithGroup {
  return Boolean(current?.group);
}

function clearInactiveGroupSelection(current: ActivityGroupSelectionData) {
  return {
    ...current,
    group: null,
    proposalMessages: [],
  };
}

function updateActiveGroupSelection({
  current,
  currentUserId,
  getGroupVersion,
  incomingGroup,
  mapApiGroupFromSelection,
  mapGroup,
}: {
  current: ActivityGroupSelectionWithGroup;
  currentUserId: string;
  getGroupVersion: (group: GroupVersionSource) => number;
  incomingGroup: GroupApi;
  mapApiGroupFromSelection: RealtimeGroupUpdateOptions["mapApiGroupFromSelection"];
  mapGroup: RealtimeGroupUpdateOptions["mapGroup"];
}) {
  return {
    ...current,
    group: mapGroup(
      getNewestGroupForSelection({
        currentGroup: current.group,
        getGroupVersion,
        incomingGroup,
        mapApiGroupFromSelection,
      }),
      currentUserId,
      current.group.plan?.proposals ?? [],
      getGroupSelectionChatSummary(current),
    ),
  };
}

function getNewestGroupForSelection({
  currentGroup,
  getGroupVersion,
  incomingGroup,
  mapApiGroupFromSelection,
}: {
  currentGroup: Group;
  getGroupVersion: (group: GroupVersionSource) => number;
  incomingGroup: GroupApi;
  mapApiGroupFromSelection: RealtimeGroupUpdateOptions["mapApiGroupFromSelection"];
}) {
  return getGroupVersion(currentGroup) > getGroupVersion(incomingGroup)
    ? mapApiGroupFromSelection(currentGroup, incomingGroup)
    : incomingGroup;
}

function getGroupSelectionChatSummary(
  current: ActivityGroupSelectionData,
): Pick<ChatApi, "governance" | "id" | "isMuted" | "pinnedMessages"> | null {
  if (!current.chatId) {
    return null;
  }

  return {
    governance:
      current.group?.governance == null
        ? current.group?.chat?.governance
        : current.group.governance,
    id: current.chatId,
    isMuted: current.group?.chat?.isMuted ?? false,
    pinnedMessages: current.group?.chat?.pinnedMessages?.map((message) =>
      toMessageApi(message),
    ),
  };
}
