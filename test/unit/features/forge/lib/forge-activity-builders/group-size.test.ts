import { createAutoForgeExecutionInput } from "@test/support/factories/forge-execution";
import { describe, expect, it } from "vitest";
import { resolveGroupSize } from "@/features/forge/lib/forge-activity-builders/group-size";

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

  it("keeps the compatibility size separate from the automatic range", () => {
    expect(
      resolveGroupSize(
        createAutoForgeExecutionInput({
          autoMaxSize: 7,
          autoMinSize: 4,
          fixedSize: 7,
          groupSizeMode: "RANGE",
        }),
      ),
    ).toBe(7);
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
  });
});
