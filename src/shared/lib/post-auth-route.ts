import type { User } from "@/shared/schemas";

export function getPostAuthRedirectPath(user: User | null | undefined) {
  if (!user) {
    return "/auth/login" as const;
  }

  const missingProfileBasics =
    user.age === null || user.gender === null || !user.city?.trim();

  if (missingProfileBasics) {
    return "/onboarding/profile" as const;
  }

  const missingPersonality =
    !user.personalityType ||
    [user.oceanO, user.oceanC, user.oceanE, user.oceanA, user.oceanN].some(
      (value) => value === null,
    );

  if (missingPersonality) {
    return "/onboarding/personality" as const;
  }

  if (!user.interests?.length) {
    return "/onboarding/interests" as const;
  }

  return "/home" as const;
}
