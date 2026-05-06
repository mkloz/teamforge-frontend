import { useQuery } from "@tanstack/react-query";

import { currentUserQueryOptions } from "@/shared/api/current-user-query";

import { getHomeViewer } from "@/features/home/lib/home-viewer";

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
