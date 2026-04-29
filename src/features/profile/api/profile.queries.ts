import { queryOptions } from "@tanstack/react-query";

import { ProfileApi } from "./profile.api";

export class ProfileQueries {
  static profile(userId: string) {
    return queryOptions({
      queryKey: ["profile", userId],
      queryFn: () => ProfileApi.getUserProfile(userId),
      staleTime: 60_000,
    });
  }
}
