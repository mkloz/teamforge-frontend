import { describe, expect, it } from "vitest";

import { buildNavigationTourSteps } from "@/features/onboarding/components/education/navigation-tour-steps";
import type { OnboardingProductState } from "@/shared/schemas/onboarding-product-state";

describe("main-navigation tutorial steps", () => {
  it("builds ten intent-ordered steps when Forge is available", () => {
    const steps = buildNavigationTourSteps(
      productState({
        coachmarkOrder: ["FORGE", "EXPLORE", "ACTIVITY"],
        forgeAllowed: true,
      }),
    );

    expect(steps).toHaveLength(10);
    expect(steps.filter((step) => step.pageId === "FORGE")).toHaveLength(2);
    expect([...new Set(steps.map((step) => step.pageId))]).toEqual([
      "FORGE",
      "EXPLORE",
      "ACTIVITY",
      "HOME",
      "PROFILE",
    ]);
  });

  it("keeps an eight-step tour instead of navigating to blocked Forge", () => {
    const steps = buildNavigationTourSteps(
      productState({
        coachmarkOrder: ["EXPLORE", "ACTIVITY", "FORGE"],
        forgeAllowed: false,
      }),
    );

    expect(steps).toHaveLength(8);
    expect(steps.some((step) => step.pageId === "FORGE")).toBe(false);
  });
});

function productState({
  coachmarkOrder,
  forgeAllowed,
}: {
  coachmarkOrder: OnboardingProductState["presentation"]["coachmarkOrder"];
  forgeAllowed: boolean;
}): Parameters<typeof buildNavigationTourSteps>[0] {
  return {
    capabilities: {
      START_FORGE: { allowed: forgeAllowed },
      START_INTRODUCTORY_FORGE: { allowed: forgeAllowed },
    },
    presentation: { coachmarkOrder },
  };
}
