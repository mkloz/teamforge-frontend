import { describe, expect, it } from "vitest";

import { resolveGroupSize } from "@/features/forge/lib/forge-activity-builders/group-size";
import { createAutoForgeExecutionInput } from "../../../../factories/forge-execution";

describe("resolveGroupSize", () => {
  it("uses normalized fixed size when the user chooses fixed group sizing", () => {
    expect(
      resolveGroupSize(
        createAutoForgeExecutionInput({
          fixedSize: 99,
          groupSizeMode: "FIXED",
        }),
      ),
    ).toBe(8);
  });

  it("uses the rounded midpoint for automatic range sizing", () => {
    expect(
      resolveGroupSize(
        createAutoForgeExecutionInput({
          autoMaxSize: 7,
          autoMinSize: 4,
          groupSizeMode: "RANGE",
        }),
      ),
    ).toBe(6);
  });

  it("normalizes range endpoints before averaging corrupted bounds", () => {
    expect(
      resolveGroupSize(
        createAutoForgeExecutionInput({
          autoMaxSize: 20,
          autoMinSize: -20,
          groupSizeMode: "RANGE",
        }),
      ),
    ).toBe(5);
  });

  it("orders inverted range bounds before deriving the preferred group size", () => {
    expect(
      resolveGroupSize(
        createAutoForgeExecutionInput({
          autoMaxSize: 4,
          autoMinSize: 7,
          groupSizeMode: "RANGE",
        }),
      ),
    ).toBe(6);
  });

  it("falls back to a safe bounded size for non-finite values", () => {
    expect(
      resolveGroupSize(
        createAutoForgeExecutionInput({
          fixedSize: Number.NaN,
          groupSizeMode: "FIXED",
        }),
      ),
    ).toBe(6);

    expect(
      resolveGroupSize(
        createAutoForgeExecutionInput({
          autoMaxSize: Number.POSITIVE_INFINITY,
          autoMinSize: Number.NaN,
          groupSizeMode: "RANGE",
        }),
      ),
    ).toBe(6);

    expect(
      resolveGroupSize(
        createAutoForgeExecutionInput({
          autoMaxSize: 5,
          autoMinSize: Number.NaN,
          groupSizeMode: "RANGE",
        }),
      ),
    ).toBe(5);
  });
});
