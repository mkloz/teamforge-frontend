export type ProfileNavigation =
  | {
      readonly to: "/profile";
    }
  | {
      readonly to: "/users/$userId";
      readonly params: {
        readonly userId: string;
      };
    };

export function buildProfileNavigation(userId?: string): ProfileNavigation {
  if (userId) {
    return {
      to: "/users/$userId",
      params: {
        userId,
      },
    } as const;
  }

  return {
    to: "/profile",
  } as const;
}
