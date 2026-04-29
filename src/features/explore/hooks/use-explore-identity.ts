import { AuthQueries } from "@/features/auth/api/auth.queries";

import { ExploreQueries } from "../api/explore.queries";

export function useExploreIdentity() {
  const { data: currentUser } = AuthQueries.useCurrentUser();

  return ExploreQueries.getIdentity(currentUser);
}
