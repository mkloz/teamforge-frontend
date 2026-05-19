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

  it("falls back to OTHER for unknown activity text", () => {
    expect(resolvePlanCategory("Tiny niche gathering")).toBe("OTHER");
    expect(resolvePlanCategory(null)).toBe("OTHER");
  });

  it("maps activity visibility to backend access mode", () => {
    expect(resolveActivityAccess("PUBLIC")).toBe("OPEN");
    expect(resolveActivityAccess("FRIENDS_ONLY")).toBe("BY_REQUEST");
    expect(resolveActivityAccess("PRIVATE")).toBe("BY_REQUEST");
  });
});
