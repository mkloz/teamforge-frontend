import { describe, expect, it } from "vitest";

import { getUserSignInMethods } from "@/shared/lib/user-sign-in-methods";

describe("getUserSignInMethods", () => {
  it("uses the connected methods returned by the API", () => {
    expect(
      getUserSignInMethods({
        authProvider: "EMAIL",
        signInMethods: { google: true, password: true },
      }),
    ).toEqual({ google: true, password: true });
  });

  it("falls back to the legacy provider for older responses", () => {
    expect(
      getUserSignInMethods({
        authProvider: "GOOGLE",
        signInMethods: undefined,
      }),
    ).toEqual({ google: true, password: false });
  });
});
