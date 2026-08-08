import { describe, expect, it } from "vitest";

import { buildNavigationTourSteps } from "@/features/onboarding/components/education/navigation-tour-steps";
import type { OnboardingProductState } from "@/shared/schemas/onboarding-product-state";

describe("focused product tutorial steps", () => {
  it("builds one useful stop per prioritized workflow stage", () => {
    const steps = buildNavigationTourSteps(
      productState({
        coachmarkOrder: ["FORGE", "EXPLORE", "ACTIVITY"],
        forgeAllowed: true,
      }),
    );

    expect(steps).toHaveLength(3);
    expect(steps.map((step) => step.pageId)).toEqual([
      "FORGE",
      "EXPLORE",
      "ACTIVITY",
    ]);
    expect(steps.map((step) => step.action)).toEqual([
      "Choose Start when you have an activity in mind.",
      "Use Filters, then open one plan to check the details.",
      "Open the item with an unread badge or pending decision.",
    ]);
  });

  it("omits Forge when the user cannot open it", () => {
    const steps = buildNavigationTourSteps(
      productState({
        coachmarkOrder: ["EXPLORE", "ACTIVITY", "FORGE"],
        forgeAllowed: false,
      }),
    );

    expect(steps).toHaveLength(2);
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
