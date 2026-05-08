import { useQuery } from "@tanstack/react-query";
import { getHomeViewer } from "@/features/home/lib/home-viewer";
import { currentUserQueryOptions } from "@/shared/api/current-user-query";

export function useHomeViewerState() {
  const query = useQuery(currentUserQueryOptions());

  return {
    viewer: getHomeViewer(query.data),
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

export function useHomeViewer() {
  return useHomeViewerState().viewer;
}
