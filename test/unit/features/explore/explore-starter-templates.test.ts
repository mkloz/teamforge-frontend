import { describe, expect, it } from "vitest";
import { ACTIVITY_TEMPLATE_STARTING_POINTS } from "@/features/forge/public/canonical-activity-templates";
import { buildForgeTemplateLaunchNavigation } from "@/shared/navigation";

describe("Explore starter templates", () => {
  it("offers five complete activity-like starting points", () => {
    expect(ACTIVITY_TEMPLATE_STARTING_POINTS).toHaveLength(5);

    for (const startingPoint of ACTIVITY_TEMPLATE_STARTING_POINTS) {
      expect(startingPoint.coverImage).toBeTruthy();
      expect(startingPoint.description.length).toBeGreaterThan(20);
      expect(startingPoint.minimumGroupSize).toBeGreaterThanOrEqual(3);
      expect(startingPoint.maximumGroupSize).toBeGreaterThan(
        startingPoint.minimumGroupSize ?? 0,
      );
    }
  });

  it("opens Forge with the selected template ready to edit", () => {
    for (const startingPoint of ACTIVITY_TEMPLATE_STARTING_POINTS) {
      expect(
        buildForgeTemplateLaunchNavigation(startingPoint.templateId),
      ).toEqual({
        to: "/forge",
        search: {
          open: true,
          step: 3,
          templateId: startingPoint.templateId,
        },
      });
    }
  });
});
