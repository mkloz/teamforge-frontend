import { useQuery } from "@tanstack/react-query";
import { activityChatsQueryOptions } from "@/features/activity/public/activity-chat-query-options";
import { collectActivityGroupChatState } from "@/features/activity/public/activity-group-chat-state";
import type { HomeGroup } from "@/features/home/schemas/home-group.schema";
import type { ChatApi } from "@/shared/schemas";

import { GroupsGridView } from "./groups-grid-view";

const EMPTY_CHATS: ChatApi[] = [];

interface GroupsGridChatStateLoaderProps {
  groups: HomeGroup[];
  isGroupsLoading?: boolean;
}

export function GroupsGridChatStateLoader({
  groups,
  isGroupsLoading,
}: GroupsGridChatStateLoaderProps) {
  const { data: chats = EMPTY_CHATS } = useQuery(activityChatsQueryOptions());
  const groupChatState = collectActivityGroupChatState(chats);

  return (
    <GroupsGridView
      groups={groups}
      groupChatState={groupChatState}
      isGroupsLoading={isGroupsLoading}
    />
  );
}
