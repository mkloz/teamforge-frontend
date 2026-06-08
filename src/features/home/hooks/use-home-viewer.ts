import { useQuery } from "@tanstack/react-query";
import { getHomeViewer } from "@/features/home/lib/home-viewer";
import { isApiNetworkError } from "@/shared/api/api-network-error";
import { currentUserQueryOptions } from "@/shared/api/current-user-query";

export function useHomeViewerState() {
  const query = useQuery(currentUserQueryOptions());
  const isBlockingError = query.isError && query.data === undefined;

  return {
    viewer: getHomeViewer(query.data),
    isLoading: query.isLoading,
    hasViewerData: query.data !== undefined,
    isError: isBlockingError,
    isOfflineUnavailable: isBlockingError && isApiNetworkError(query.error),
    refetch: query.refetch,
  };
}

export function useHomeViewer() {
  return useHomeViewerState().viewer;
}
