export type ProfileNavigation =
  | {
      readonly to: "/profile";
    }
  | {
      readonly to: "/users/$userId";
      readonly params: {
        readonly userId: string;
      };
      readonly search?: UserDetailRouteSearch;
    };

export const userDetailIntentValues = ["connect"] as const;

export type UserDetailIntent = (typeof userDetailIntentValues)[number];

export interface UserDetailRouteSearch {
  intent?: UserDetailIntent;
}

export function buildPublicProfilePath(
  userId: string,
  search?: UserDetailRouteSearch,
) {
  const query = search?.intent
    ? `?intent=${encodeURIComponent(search.intent)}`
    : "";

  return `/users/${encodeURIComponent(userId)}${query}`;
}

export function buildProfileNavigation(
  userId?: string,
  search?: UserDetailRouteSearch,
): ProfileNavigation {
  if (userId) {
    return {
      to: "/users/$userId",
      params: {
        userId,
      },
      search,
    } as const;
  }

  return {
    to: "/profile",
  } as const;
}
