import { useQuery } from "@tanstack/react-query";
import { getExploreIdentity } from "@/features/explore/lib/explore-presenters";
import { currentUserQueryOptions } from "@/shared/api/current-user-query";

export function useExploreIdentity() {
  const { data: currentUser } = useQuery(currentUserQueryOptions());

  return getExploreIdentity(currentUser);
}
