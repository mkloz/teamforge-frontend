import { useQuery } from "@tanstack/react-query";
import { ActivityQueryFactory } from "@/features/activity/public/activity-query-factory";
import type { HomeGroup } from "@/features/home/schemas/home-group.schema";
import type { ChatApi } from "@/shared/schemas";

import { collectGroupChatState } from "./group-chat-state";
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
  const { data: chats = EMPTY_CHATS } = useQuery(ActivityQueryFactory.chats());
  const groupChatState = collectGroupChatState(chats);

  return (
    <GroupsGridView
      groups={groups}
      groupChatState={groupChatState}
      isGroupsLoading={isGroupsLoading}
    />
  );
}
