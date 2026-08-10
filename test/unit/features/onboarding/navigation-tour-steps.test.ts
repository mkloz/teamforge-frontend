import { describe, expect, it } from "vitest";

import { buildNavigationTourSteps } from "@/features/onboarding/components/education/navigation-tour-steps";
import type { OnboardingProductState } from "@/shared/schemas/onboarding-product-state";

describe("focused product tutorial steps", () => {
  it("builds one useful stop per prioritized workflow stage", () => {
    const steps = buildNavigationTourSteps(
      productState({
        coachmarkOrder: ["START_PLAN", "EXPLORE", "ACTIVITY"],
        planCreationAllowed: true,
      }),
    );

    expect(steps).toHaveLength(3);
    expect(steps.map((step) => step.pageId)).toEqual([
      "START_PLAN",
      "EXPLORE",
      "ACTIVITY",
    ]);
    expect(steps.map((step) => step.action)).toEqual([
      "Choose Start when you have an activity in mind.",
      "Use Filters, then open one plan to check the details.",
      "Open the item with an unread badge or pending decision.",
    ]);
  });

  it("omits the plan builder when the user cannot open it", () => {
    const steps = buildNavigationTourSteps(
      productState({
        coachmarkOrder: ["EXPLORE", "ACTIVITY", "START_PLAN"],
        planCreationAllowed: false,
      }),
    );

    expect(steps).toHaveLength(2);
    expect(steps.some((step) => step.pageId === "START_PLAN")).toBe(false);
  });
});

function productState({
  coachmarkOrder,
  planCreationAllowed,
}: {
  coachmarkOrder: OnboardingProductState["presentation"]["coachmarkOrder"];
  planCreationAllowed: boolean;
}): Parameters<typeof buildNavigationTourSteps>[0] {
  return {
    capabilities: {
      START_GROUP_FORMATION: { allowed: planCreationAllowed },
      START_INTRODUCTORY_GROUP_FORMATION: { allowed: planCreationAllowed },
    },
    presentation: { coachmarkOrder },
  };
}
