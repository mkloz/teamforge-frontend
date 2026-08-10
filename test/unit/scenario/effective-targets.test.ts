import { describe, expect, it } from "vitest";
import {
  type CssRect,
  expandRect,
  getExteriorSamplePoints,
  getPositiveRectOverlap,
  getTargetSamplePoints,
  rectContains,
} from "../../scenario/support/effective-targets";

const compactArtInsideTarget = {
  effective: { height: 44, width: 44, x: 10, y: 20 },
  visible: { height: 16, width: 16, x: 24, y: 34 },
};

describe("effective target geometry", () => {
  it("keeps compact visible artwork independent from its effective bounds", () => {
    expect(compactArtInsideTarget.visible.width).toBeLessThan(44);
    expect(compactArtInsideTarget.visible.height).toBeLessThan(44);
    expect(compactArtInsideTarget.effective).toMatchObject({
      height: 44,
      width: 44,
    });
  });

  it("detects positive-area overlap but permits touching edges", () => {
    const left: CssRect = { height: 44, width: 44, x: 0, y: 0 };
    const touching: CssRect = { height: 44, width: 44, x: 44, y: 0 };
    const overlapping: CssRect = { height: 44, width: 44, x: 42, y: 0 };

    expect(getPositiveRectOverlap(left, touching)).toBeNull();
    expect(getPositiveRectOverlap(left, overlapping)).toEqual({
      height: 44,
      width: 2,
      x: 42,
      y: 0,
    });
  });

  it("derives pseudo-element hit slop from the semantic bounds", () => {
    expect(
      expandRect(
        { height: 40, width: 40, x: 12, y: 20 },
        { bottom: 2, left: 2, right: 2, top: 2 },
      ),
    ).toEqual({ height: 44, width: 44, x: 10, y: 18 });
  });

  it("requires visible artwork to remain inside the effective target", () => {
    expect(
      rectContains(
        compactArtInsideTarget.effective,
        compactArtInsideTarget.visible,
      ),
    ).toBe(true);
    expect(
      rectContains(compactArtInsideTarget.effective, {
        height: 16,
        width: 16,
        x: 50,
        y: 34,
      }),
    ).toBe(false);
  });

  it("samples the centre, axis edges, and inset corners", () => {
    expect(getTargetSamplePoints(compactArtInsideTarget.effective)).toEqual([
      { label: "centre", x: 32, y: 42 },
      { label: "top edge", x: 32, y: 20.5 },
      { label: "top right corner", x: 46, y: 28 },
      { label: "right edge", x: 53.5, y: 42 },
      { label: "bottom right corner", x: 46, y: 56 },
      { label: "bottom edge", x: 32, y: 63.5 },
      { label: "bottom left corner", x: 18, y: 56 },
      { label: "left edge", x: 10.5, y: 42 },
      { label: "top left corner", x: 18, y: 28 },
    ]);
  });

  it("samples just beyond every declared hit-slop edge", () => {
    expect(getExteriorSamplePoints(compactArtInsideTarget.effective)).toEqual([
      { label: "outside top", x: 32, y: 19 },
      { label: "outside top right", x: 55, y: 19 },
      { label: "outside right", x: 55, y: 42 },
      { label: "outside bottom right", x: 55, y: 65 },
      { label: "outside bottom", x: 32, y: 65 },
      { label: "outside bottom left", x: 9, y: 65 },
      { label: "outside left", x: 9, y: 42 },
      { label: "outside top left", x: 9, y: 19 },
    ]);
  });
});
