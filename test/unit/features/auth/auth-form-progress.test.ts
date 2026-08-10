import { describe, expect, it } from "vitest";

import {
  calculateForgotPasswordProgress,
  calculateResetPasswordProgress,
} from "@/features/auth/lib/auth-form-progress";

describe("support auth form progress", () => {
  it("keeps the forgot-password formation dispersed initially", () => {
    expect(calculateForgotPasswordProgress({ email: "" })).toBe(0);
    expect(calculateForgotPasswordProgress({ email: "user@example.com" })).toBe(
      1,
    );
  });

  it("assembles the reset-password formation as both fields are completed", () => {
    expect(
      calculateResetPasswordProgress({ password: "", confirmPassword: "" }),
    ).toBe(0);
    expect(
      calculateResetPasswordProgress({
        password: "secure-password",
        confirmPassword: "",
      }),
    ).toBe(0.5);
    expect(
      calculateResetPasswordProgress({
        password: "secure-password",
        confirmPassword: "secure-password",
      }),
    ).toBe(1);
  });
});
