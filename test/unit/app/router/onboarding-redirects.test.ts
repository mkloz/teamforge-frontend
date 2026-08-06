import { describe, expect, it } from "vitest";

import { getEditableOnboardingRedirectTarget } from "@/app/router/route-guards/onboarding-redirects";

describe("editable onboarding redirects", () => {
  it("allows an introductory user to continue the full assessment", () => {
    expect(
      getEditableOnboardingRedirectTarget({
        canonicalDestination: "/explore",
        expectedDestination: "/onboarding/personality",
        isEditMode: true,
      }),
    ).toBeNull();
  });

  it("does not let introductory edit mode skip into interests", () => {
    expect(
      getEditableOnboardingRedirectTarget({
        canonicalDestination: "/explore",
        expectedDestination: "/onboarding/interests",
        isEditMode: true,
      }),
    ).toBe("/explore");
  });

  it("keeps established users on either editable onboarding route", () => {
    expect(
      getEditableOnboardingRedirectTarget({
        canonicalDestination: "/home",
        expectedDestination: "/onboarding/personality",
        isEditMode: true,
      }),
    ).toBeNull();
  });
});
