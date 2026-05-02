import type { AutoForgeExecutionInput } from "@/features/forge/api/forge-types";
import { normalizeFixedGroupSize } from "@/features/forge/lib/forge-size";

export function resolveGroupSize(input: AutoForgeExecutionInput) {
  if (input.groupSizeMode === "FIXED") {
    return normalizeFixedGroupSize(input.fixedSize);
  }

  return normalizeFixedGroupSize((input.autoMinSize + input.autoMaxSize) / 2);
}
