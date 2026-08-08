import { describe, expect, it } from "vitest";

import { getDateRangeRoutePatch } from "@/features/explore/hooks/explore-route-state/explore-route-utils";

describe("Explore date range routing", () => {
  it("updates both endpoints together and clears the preset time window", () => {
    expect(getDateRangeRoutePatch("2026-08-12", "2026-08-18")).toEqual({
      from: "2026-08-12",
      time: null,
      to: "2026-08-18",
    });
  });

  it("preserves the opposite endpoint when one side changes", () => {
    expect(getDateRangeRoutePatch("2026-08-14", "2026-08-18")).toMatchObject({
      from: "2026-08-14",
      to: "2026-08-18",
    });
    expect(getDateRangeRoutePatch("2026-08-14", null)).toMatchObject({
      from: "2026-08-14",
      to: null,
    });
  });
});
