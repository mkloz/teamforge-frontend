import { appQueryClient } from "@/shared/api/query-client";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import { invalidateHomeGroupSurfaces } from "@/shared/api/query-invalidation";
import type { ChatApi, GroupApi, PlanProposal } from "@/shared/schemas";

import type { ActivityGroupSelectionData } from "@/features/activity/api/activity-query-data";
import {
  ACTIVITY_CHATS_QUERY_KEY,
  ACTIVITY_GROUPS_QUERY_KEY,
} from "@/features/activity/api/activity-query-keys";
import { toMessageApi } from "@/features/activity/api/messages/message-mappers";
import type { Group } from "@/features/activity/lib/activity-contract";

interface RealtimeGroupUpdateOptions {
  currentUserId: string;
  getGroupVersion: (
    group:
      | Pick<GroupApi, "updatedAt" | "version">
      | Pick<Group, "updatedAt" | "version">,
  ) => number;
  group: GroupApi;
  mapApiGroupFromSelection: (group: Group) => GroupApi;
  mapGroup: (
    group: GroupApi,
    currentUserId: string | null,
    proposals?: PlanProposal[],
    chatSummary?: Pick<ChatApi, "id" | "pinnedMessages"> | null,
  ) => Group;
}

export const ActivityGroupCache = {
  applyRealtimeGroupUpdate({
    currentUserId,
    getGroupVersion,
    group,
    mapApiGroupFromSelection,
    mapGroup,
  }: RealtimeGroupUpdateOptions) {
    const isStillMember = group.members.some(
      (member) => member.userId === currentUserId && member.leftAt === null,
    );

    appQueryClient.setQueryData<GroupApi[]>(
      ACTIVITY_GROUPS_QUERY_KEY,
      (current) => {
        const currentGroup = current?.find((item) => item.id === group.id);
        const nextGroup =
          currentGroup && getGroupVersion(currentGroup) > getGroupVersion(group)
            ? currentGroup
            : group;
        const withoutExisting =
          current?.filter((item) => item.id !== group.id) ?? [];

        if (!isStillMember) {
          return withoutExisting;
        }

        return [nextGroup, ...withoutExisting].sort(
          (left, right) => getGroupVersion(right) - getGroupVersion(left),
        );
      },
    );

    appQueryClient.setQueryData<ChatApi[]>(
      ACTIVITY_CHATS_QUERY_KEY,
      (current) => {
        if (!current) {
          return current;
        }

        if (!isStillMember) {
          return current.filter((chat) => chat.groupId !== group.id);
        }

        return current.map((chat) =>
          chat.groupId === group.id && chat.group
            ? {
                ...chat,
                group: {
                  ...chat.group,
                  avatar: group.avatar,
                  name: group.name,
                  status: group.status,
                },
              }
            : chat,
        );
      },
    );

    appQueryClient.setQueryData<ActivityGroupSelectionData | undefined>(
      APP_QUERY_KEYS.activity.groupSelectionById(group.id),
      (current) => {
        if (!current?.group) {
          return current;
        }

        if (!isStillMember) {
          return {
            ...current,
            group: null,
            proposalMessages: [],
          };
        }

        return {
          ...current,
          group: mapGroup(
            getGroupVersion(current.group) > getGroupVersion(group)
              ? mapApiGroupFromSelection(current.group)
              : group,
            currentUserId,
            current.group?.plan?.proposals ?? [],
            current.chatId
              ? ({
                  id: current.chatId,
                  pinnedMessages: current.group?.chat?.pinnedMessages?.map(
                    (message) => toMessageApi(message),
                  ),
                } satisfies Pick<ChatApi, "id" | "pinnedMessages">)
              : null,
          ),
        };
      },
    );

    void invalidateHomeGroupSurfaces();
  },
};
