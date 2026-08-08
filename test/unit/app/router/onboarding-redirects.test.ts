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

  it("allows an introductory user to edit interests", () => {
    expect(
      getEditableOnboardingRedirectTarget({
        canonicalDestination: "/explore",
        expectedDestination: "/onboarding/interests",
        isEditMode: true,
      }),
    ).toBeNull();
  });

  it.each(["/onboarding/personality", "/onboarding/interests"] as const)(
    "keeps established users on %s",
    (expectedDestination) => {
      expect(
        getEditableOnboardingRedirectTarget({
          canonicalDestination: "/home",
          expectedDestination,
          isEditMode: true,
        }),
      ).toBeNull();
    },
  );

  it("still redirects incomplete users to their required onboarding step", () => {
    expect(
      getEditableOnboardingRedirectTarget({
        canonicalDestination: "/onboarding/intent",
        expectedDestination: "/onboarding/interests",
        isEditMode: true,
      }),
    ).toBe("/onboarding/intent");
  });
});
