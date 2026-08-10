import { createAutomaticGroupFormationExecutionInput } from "@test/support/factories/group-formation-execution";
import { describe, expect, it } from "vitest";
import { resolveGroupSize } from "@/features/plan-creation/lib/group-formation-activity-builders/group-size";

describe("resolveGroupSize", () => {
  it("uses normalized fixed size when the user chooses fixed group sizing", () => {
    expect(
      resolveGroupSize(
        createAutomaticGroupFormationExecutionInput({
          fixedSize: 99,
          groupSizeMode: "FIXED",
        }),
      ),
    ).toBe(8);
  });

  it("keeps the compatibility size separate from the automatic range", () => {
    expect(
      resolveGroupSize(
        createAutomaticGroupFormationExecutionInput({
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
        createAutomaticGroupFormationExecutionInput({
          fixedSize: Number.NaN,
          groupSizeMode: "FIXED",
        }),
      ),
    ).toBe(6);
  });
});
