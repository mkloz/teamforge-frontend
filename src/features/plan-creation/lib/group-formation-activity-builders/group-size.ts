import type { AutomaticGroupFormationExecutionInput } from "@/features/plan-creation/lib/group-formation-execution-schema";
import { normalizeFixedGroupSize } from "@/features/plan-creation/lib/plan-creation-size";

export function resolveGroupSize(input: AutomaticGroupFormationExecutionInput) {
  return normalizeFixedGroupSize(input.fixedSize);
}
