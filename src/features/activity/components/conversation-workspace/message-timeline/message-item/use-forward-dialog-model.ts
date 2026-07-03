import { useQuery } from "@tanstack/react-query";
import { activityQueries } from "@/features/activity/api/activity-queries";
import type { ChatApi, FriendshipApi, GroupApi } from "@/shared/schemas";
import { getForwardDialogState } from "./forward-dialog-state";
import { buildForwardTargets } from "./forward-dialog-targets";
import type { ForwardDialogModel } from "./forward-message-dialog.types";

export function useForwardDialogModel({
  isOnline,
  sourceChatId,
}: {
  isOnline: boolean;
  sourceChatId: string;
}) {
  const {
    data: groups = [],
    isError: hasGroupsLoadError,
    isPending: isLoadingGroups,
  } = useQuery(activityQueries.groups());
  const {
    data: chats = [],
    isError: hasChatsLoadError,
    isPending: isLoadingChats,
  } = useQuery(activityQueries.chats());
  const {
    data: friendships = [],
    isError: hasFriendshipsLoadError,
    isPending: isLoadingFriendships,
  } = useQuery(activityQueries.friendships());

  return getForwardDialogModel({
    chats,
    friendships,
    groups,
    hasLoadError:
      hasGroupsLoadError || hasChatsLoadError || hasFriendshipsLoadError,
    isLoading: isLoadingGroups || isLoadingChats || isLoadingFriendships,
    isOnline,
    sourceChatId,
  });
}

function getForwardDialogModel({
  chats,
  friendships,
  groups,
  hasLoadError,
  isLoading,
  isOnline,
  sourceChatId,
}: {
  chats: ChatApi[];
  friendships: FriendshipApi[];
  groups: GroupApi[];
  hasLoadError: boolean;
  isLoading: boolean;
  isOnline: boolean;
  sourceChatId: string;
}): ForwardDialogModel {
  const targets = buildForwardTargets({
    chats,
    friendships,
    groups,
    sourceChatId,
  });

  return {
    state: getForwardDialogState({
      hasLoadError,
      isLoading,
      isOnline,
      targetCount: targets.length,
    }),
    targets,
  };
}
