import { describe, expect, it } from "vitest";

import {
  getVoronoiCanvasDevicePixelRatio,
  MAX_VORONOI_CANVAS_DEVICE_PIXEL_RATIO,
} from "@/shared/lib/voronoi/voronoi-performance";

describe("Voronoi canvas performance policy", () => {
  it.each([
    [0.75, 1],
    [1, 1],
    [1.25, 1.25],
    [1.5, 1.5],
    [2, 1.5],
    [3, 1.5],
  ])("caps device pixel ratio %s at %s", (input, expected) => {
    expect(getVoronoiCanvasDevicePixelRatio(input)).toBe(expected);
  });

  it("keeps the cap explicit and shared", () => {
    expect(MAX_VORONOI_CANVAS_DEVICE_PIXEL_RATIO).toBe(1.5);
  });
});
