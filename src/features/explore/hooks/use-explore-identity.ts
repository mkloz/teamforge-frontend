import { useQuery } from "@tanstack/react-query";

import { currentUserQueryOptions } from "@/shared/api/current-user-query";
import { getExploreIdentity } from "@/features/explore/lib/explore-presenters";

export function useExploreIdentity() {
  const { data: currentUser } = useQuery(currentUserQueryOptions());

  return getExploreIdentity(currentUser);
}
