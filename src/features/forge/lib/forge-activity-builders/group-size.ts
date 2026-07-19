import type { AutoForgeExecutionInput } from "@/features/forge/lib/forge-execution-schema";
import { normalizeFixedGroupSize } from "@/features/forge/lib/forge-size";

export function resolveGroupSize(input: AutoForgeExecutionInput) {
  return normalizeFixedGroupSize(input.fixedSize);
}
