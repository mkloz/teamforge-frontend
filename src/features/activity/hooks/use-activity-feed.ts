import { useDeferredValue, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AuthQueries } from "@/features/auth/api/auth.queries";
import { ActivityQueries } from "../api/activity.queries";
import { useActivityStore } from "../store/activity.store";

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
  const currentUserQuery = useQuery(AuthQueries.currentUser());
  const groupsQuery = useQuery(ActivityQueries.groups());
  const chatsQuery = useQuery(ActivityQueries.chats());
  const friendshipsQuery = useQuery(ActivityQueries.friendships());

  const feedData = useMemo(() => {
    if (
      !currentUserQuery.data ||
      !groupsQuery.data ||
      !chatsQuery.data ||
      !friendshipsQuery.data
    ) {
      return null;
    }

    return ActivityQueries.deriveFeedData(
      activeFilter,
      deferredSearchQuery,
      groupsQuery.data,
      chatsQuery.data,
      friendshipsQuery.data,
      currentUserQuery.data,
      typingByChatId,
    );
  }, [
    activeFilter,
    chatsQuery.data,
    currentUserQuery.data,
    deferredSearchQuery,
    friendshipsQuery.data,
    groupsQuery.data,
    typingByChatId,
  ]);

  return {
    searchQuery,
    activeFilter,
    sidebarDensity,
    filteredItems: feedData?.items ?? [],
    groupCount: feedData?.groupCount ?? 0,
    dmCount: feedData?.dmCount ?? 0,
    unreadCount: feedData?.unreadCount ?? 0,
    setSearchQuery,
    setActiveFilter,
    setSidebarDensity,
  };
}
