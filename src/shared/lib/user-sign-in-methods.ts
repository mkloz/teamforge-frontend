import type { User } from "@/shared/schemas";

export interface UserSignInMethods {
  google: boolean;
  password: boolean;
}

export function getUserSignInMethods(
  user: Pick<User, "authProvider" | "signInMethods"> | null | undefined,
): UserSignInMethods {
  return (
    user?.signInMethods ?? {
      google: user?.authProvider === "GOOGLE",
      password: user?.authProvider === "EMAIL",
    }
  );
}
