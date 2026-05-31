import { useQuery } from "@tanstack/react-query";
import { ActivityQueryFactory } from "@/features/activity/api/activity-query-factory";
import type { HomeGroup } from "@/features/home/schemas/home-group.schema";

import { collectGroupChatState } from "./group-chat-state";
import { GroupsGridView } from "./groups-grid-view";

interface GroupsGridChatStateLoaderProps {
  groups: HomeGroup[];
  isGroupsLoading?: boolean;
}

export function GroupsGridChatStateLoader({
  groups,
  isGroupsLoading,
}: GroupsGridChatStateLoaderProps) {
  const chatsQuery = useQuery(ActivityQueryFactory.chats());
  const groupChatState = collectGroupChatState(chatsQuery.data ?? []);

  return (
    <GroupsGridView
      groups={groups}
      groupChatState={groupChatState}
      isGroupsLoading={isGroupsLoading}
    />
  );
}
