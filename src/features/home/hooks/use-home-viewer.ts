import { useQuery } from "@tanstack/react-query";

import { currentUserQueryOptions } from "@/shared/api/current-user-query";

import { getHomeViewer } from "@/features/home/lib/home-viewer";

export function useHomeViewer() {
  const { data: currentUser } = useQuery(currentUserQueryOptions());

  return getHomeViewer(currentUser);
}
