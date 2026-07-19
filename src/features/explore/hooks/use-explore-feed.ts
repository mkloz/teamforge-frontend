import { useExploreFeedQuery } from "@/features/explore/hooks/use-explore-feed-query";
import { useExploreRouteState } from "@/features/explore/hooks/use-explore-route-state";
import { useUnexpiredExploreFeedItems } from "@/shared/hooks/use-unexpired-explore-feed-items";

export function useExploreFeed() {
  const feedQuery = useExploreFeedQuery();
  const { isAnythingFiltered, resetFilters, searchQuery } =
    useExploreRouteState();
  const loadedItems = feedQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const items = useUnexpiredExploreFeedItems(loadedItems);
  const firstPage = feedQuery.data?.pages[0];
  const hiddenExpiredCount = loadedItems.length - items.length;

  return {
    items,
    hasItems: items.length > 0,
    hasNextPage: feedQuery.hasNextPage,
    insight: firstPage?.insight,
    isAnythingFiltered,
    isError: feedQuery.isError,
    isFetchingNextPage: feedQuery.isFetchingNextPage,
    isLoading: feedQuery.isLoading,
    fetchNextPage: feedQuery.fetchNextPage,
    refetch: feedQuery.refetch,
    resetFilters,
    searchQuery,
    totalItems: Math.max(
      0,
      (firstPage?.meta.totalItemsCount ?? items.length) - hiddenExpiredCount,
    ),
  };
}
