import { describe, expect, it } from "vitest";

import {
  findActivityOption,
  resolveActivityAccess,
  resolvePlanCategory,
} from "@/features/forge/lib/forge-activity-builders/activity-option-resolution";

describe("forge activity option resolution", () => {
  it("resolves options by label, stable id, and harmless whitespace/case", () => {
    expect(findActivityOption("Tech & Build")?.id).toBe("TECH");
    expect(findActivityOption("tech")?.label).toBe("Tech & Build");
    expect(findActivityOption("  food & drink  ")?.id).toBe("FOOD");
  });

  it("resolves near-label inputs with small user typos", () => {
    expect(findActivityOption("tehc build")?.id).toBe("TECH");
    expect(findActivityOption("game play")?.id).toBe("GAMING");
    expect(findActivityOption("study skilz")?.id).toBe("LEARNING");
  });

  it("resolves concise activity descriptions to the strongest category", () => {
    expect(resolvePlanCategory("coding")).toBe("TECH");
    expect(resolvePlanCategory("dinner")).toBe("FOOD");
    expect(resolvePlanCategory("coffee chat")).toBe("SOCIAL");
  });

  it("resolves common real-world activity wording beyond category labels", () => {
    expect(resolvePlanCategory("football after class")).toBe("SPORTS");
    expect(resolvePlanCategory("hiking trail")).toBe("OUTDOORS");
    expect(resolvePlanCategory("movie night")).toBe("ARTS");
    expect(resolvePlanCategory("hackathon")).toBe("TECH");
  });

  it("prefers stronger multi-token evidence over earlier weak category hits", () => {
    expect(resolvePlanCategory("board games")).toBe("GAMING");
    expect(resolvePlanCategory("parks and cycling")).toBe("OUTDOORS");
  });

  it("does not guess when the activity points equally at multiple categories", () => {
    expect(findActivityOption("tech food")).toBeNull();
    expect(resolvePlanCategory("tech food")).toBe("OTHER");
  });

  it("falls back to OTHER for unknown activity text", () => {
    expect(findActivityOption("Tiny niche gathering")).toBeNull();
    expect(resolvePlanCategory("Tiny niche gathering")).toBe("OTHER");
    expect(resolvePlanCategory(null)).toBe("OTHER");
  });

  it("maps activity visibility to backend access mode", () => {
    expect(resolveActivityAccess("PUBLIC")).toBe("OPEN");
    expect(resolveActivityAccess("FRIENDS_ONLY")).toBe("BY_REQUEST");
    expect(resolveActivityAccess("PRIVATE")).toBe("BY_REQUEST");
  });
});
