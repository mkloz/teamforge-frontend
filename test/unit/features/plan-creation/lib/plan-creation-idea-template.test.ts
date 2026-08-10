import { describe, expect, it } from "vitest";
import { buildPlanIdeaTemplate } from "@/features/plan-creation/lib/plan-idea-template";
import type { PlanIdeaLaunch } from "@/shared/navigation/plan-creation-navigation";

describe("planCreation idea template matching", () => {
  it("uses activity semantics when an idea has no explicit lane", () => {
    const template = buildPlanIdeaTemplate(
      createIdea({
        detail: "Casual five-a-side near campus after lectures.",
        title: "Football after class",
      }),
    );

    expect(template.selectedActivity).toBe("Sport & Movement");
    expect(template.groupName).not.toBe("Football after class");
  });

  it("keeps meaningful short tech tokens in template matching", () => {
    const template = buildPlanIdeaTemplate(
      createIdea({
        detail: "Prototype a small AI product with fast feedback.",
        title: "AI hackathon",
      }),
    );

    expect(template.selectedActivity).toBe("Tech & Build");
    expect(template.groupName).not.toBe("AI hackathon");
  });

  it("maps film and movie ideas to culture templates", () => {
    const template = buildPlanIdeaTemplate(
      createIdea({
        detail: "Pick a film together and keep the conversation relaxed.",
        title: "Movie night",
      }),
    );

    expect(template.selectedActivity).toBe("Arts & Culture");
    expect(template.groupName).not.toBe("Movie night");
  });
});

function createIdea(overrides: Partial<PlanIdeaLaunch>): PlanIdeaLaunch {
  return {
    detail: "",
    title: "Interest-led small group",
    ...overrides,
  };
}
