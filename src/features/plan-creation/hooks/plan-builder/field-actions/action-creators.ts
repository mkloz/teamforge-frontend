import type {
  PlanBuilderData,
  PlanBuilderField,
  PlanBuilderSetFieldAction,
} from "@/features/plan-creation/lib/plan-builder";

export function createSetFieldAction<Field extends PlanBuilderField>(
  field: Field,
  value: PlanBuilderData[Field],
): PlanBuilderSetFieldAction<Field> {
  return {
    type: "set-field",
    field,
    value,
  };
}
