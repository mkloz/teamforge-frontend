import type { AutoForgeExecutionInput } from "@/features/forge/lib/forge-execution-schema";
import {
  getPreferredGroupSizeFromRange,
  normalizeFixedGroupSize,
} from "@/features/forge/lib/forge-size";

export function resolveGroupSize(input: AutoForgeExecutionInput) {
  if (input.groupSizeMode === "FIXED") {
    return normalizeFixedGroupSize(input.fixedSize);
  }

  return resolveRangeGroupSize(input.autoMinSize, input.autoMaxSize);
}

function resolveRangeGroupSize(minSize: number, maxSize: number) {
  return getPreferredGroupSizeFromRange(minSize, maxSize);
}
