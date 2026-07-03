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

const userDetailIntentValues = ["connect"] as const;

export type UserDetailIntent = (typeof userDetailIntentValues)[number];

export interface UserDetailRouteSearch {
  intent?: UserDetailIntent;
}

function isUserDetailIntent(value: unknown): value is UserDetailIntent {
  return (
    typeof value === "string" &&
    userDetailIntentValues.some((intent) => intent === value)
  );
}

export function validateUserDetailSearch(
  search: Record<string, unknown>,
): UserDetailRouteSearch {
  return {
    intent: isUserDetailIntent(search.intent) ? search.intent : undefined,
  };
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
