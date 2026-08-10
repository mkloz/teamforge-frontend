import { describe, expect, it } from "vitest";

import { getUserSignInMethods } from "@/shared/lib/user-sign-in-methods";

describe("getUserSignInMethods", () => {
  it("uses the connected methods returned by the API", () => {
    expect(
      getUserSignInMethods({
        signInMethods: { google: true, password: true },
      }),
    ).toEqual({ google: true, password: true });
  });

  it("returns no connected methods before a current user is available", () => {
    expect(getUserSignInMethods(undefined)).toEqual({
      google: false,
      password: false,
    });
  });
});
