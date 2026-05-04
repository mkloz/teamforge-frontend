import type {
  ForgeWizardData,
  ForgeWizardField,
  ForgeWizardSetFieldAction,
} from "@/features/forge/lib/forge-wizard";

export function createSetFieldAction<Field extends ForgeWizardField>(
  field: Field,
  value: ForgeWizardData[Field],
): ForgeWizardSetFieldAction {
  return {
    type: "set-field",
    field,
    value,
  } as ForgeWizardSetFieldAction;
}
