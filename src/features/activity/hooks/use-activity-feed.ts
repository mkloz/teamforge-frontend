import { useQuery } from "@tanstack/react-query";
import { useDeferredValue } from "react";
import { ActivityQueryFactory } from "@/features/activity/api/activity-query-factory";
import { useActivityStore } from "@/features/activity/store/activity.store";
import { currentUserQueryOptions } from "@/shared/api/current-user-query";

export function useActivityFeed() {
  const searchQuery = useActivityStore((state) => state.searchQuery);
  const activeFilter = useActivityStore((state) => state.activeFilter);
  const sidebarDensity = useActivityStore((state) => state.sidebarDensity);
  const typingByChatId = useActivityStore((state) => state.typingByChatId);
  const setSearchQuery = useActivityStore((state) => state.setSearchQuery);
  const setActiveFilter = useActivityStore((state) => state.setActiveFilter);
  const setSidebarDensity = useActivityStore(
    (state) => state.setSidebarDensity,
  );

  const deferredSearchQuery = useDeferredValue(searchQuery);
  const currentUserQuery = useQuery(currentUserQueryOptions());
  const groupsQuery = useQuery(ActivityQueryFactory.groups());
  const chatsQuery = useQuery(ActivityQueryFactory.chats());
  const friendshipsQuery = useQuery(ActivityQueryFactory.friendships());

  const feedData =
    currentUserQuery.data &&
    groupsQuery.data &&
    chatsQuery.data &&
    friendshipsQuery.data
      ? ActivityQueryFactory.deriveFeedData(
          activeFilter,
          deferredSearchQuery,
          groupsQuery.data,
          chatsQuery.data,
          friendshipsQuery.data,
          currentUserQuery.data,
          typingByChatId,
        )
      : null;
  const isInitialLoading =
    feedData === null &&
    (currentUserQuery.isPending ||
      groupsQuery.isPending ||
      chatsQuery.isPending ||
      friendshipsQuery.isPending);

  return {
    searchQuery,
    activeFilter,
    sidebarDensity,
    isInitialLoading,
    filteredItems: feedData?.items ?? [],
    groupCount: feedData?.groupCount ?? 0,
    dmCount: feedData?.dmCount ?? 0,
    unreadCount: feedData?.unreadCount ?? 0,
    setSearchQuery,
    setActiveFilter,
    setSidebarDensity,
  };
}
