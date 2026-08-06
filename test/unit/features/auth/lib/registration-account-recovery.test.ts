import { describe, expect, it } from "vitest";

import { getRegistrationAccountRecovery } from "@/features/auth/lib/registration-account-recovery";

describe("registration account recovery", () => {
  it.each([
    ["AUTH_ACCOUNT_EXISTS_GOOGLE", "google"],
    ["AUTH_ACCOUNT_EXISTS", "login"],
    ["UNRELATED_CONFLICT", null],
  ] as const)("maps %s to %s recovery", (code, expectedRecovery) => {
    expect(getRegistrationAccountRecovery(createApiError(code))).toBe(
      expectedRecovery,
    );
  });

  it("does not classify an ordinary error as an account recovery", () => {
    expect(getRegistrationAccountRecovery(new Error("Network failed"))).toBe(
      null,
    );
  });
});

function createApiError(code: string) {
  const error = Object.assign(new Error("Registration conflict"), {
    response: { status: 409 },
  });

  Object.defineProperty(error, "cause", {
    configurable: true,
    value: { code },
  });

  return error;
}
