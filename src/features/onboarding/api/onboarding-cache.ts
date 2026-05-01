import type { QueryClient } from "@tanstack/react-query";

import { CURRENT_USER_QUERY_KEY } from "@/shared/api/current-user-query";
import type { Interest, User } from "@/shared/schemas";

export class OnboardingCache {
  static setCurrentUser(queryClient: QueryClient, user: User) {
    queryClient.setQueryData(CURRENT_USER_QUERY_KEY, user);
  }

  static applySavedInterests(queryClient: QueryClient, interests: Interest[]) {
    queryClient.setQueryData<User | undefined>(
      CURRENT_USER_QUERY_KEY,
      (user) =>
        user
          ? {
              ...user,
              interests,
            }
          : user,
    );
  }

  static invalidateCurrentUser(queryClient: QueryClient) {
    return queryClient.invalidateQueries({
      queryKey: CURRENT_USER_QUERY_KEY,
    });
  }
}
