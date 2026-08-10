import type { User } from "@/shared/schemas";

export interface UserSignInMethods {
  google: boolean;
  password: boolean;
}

export function getUserSignInMethods(
  user: Pick<User, "signInMethods"> | null | undefined,
): UserSignInMethods {
  return user?.signInMethods ?? { google: false, password: false };
}
