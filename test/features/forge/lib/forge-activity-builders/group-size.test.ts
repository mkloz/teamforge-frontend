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
});
