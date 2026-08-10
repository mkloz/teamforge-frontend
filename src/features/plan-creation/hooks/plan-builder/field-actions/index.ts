import type {
  PlanBuilderData,
  PlanBuilderField,
} from "@/features/plan-creation/lib/plan-builder";

import { createSetFieldAction } from "./action-creators";
import type {
  PlanBuilderFieldActions,
  UsePlanBuilderFieldActionsOptions,
} from "./types";
import { useActivityFieldActions } from "./use-activity-field-actions";
import { useIdentityFieldActions } from "./use-identity-field-actions";
import { usePlanCreationSettingsFieldActions } from "./use-plan-creation-settings-field-actions";
import { usePlanFieldActions } from "./use-plan-field-actions";

export function usePlanBuilderFieldActions({
  dispatch,
  state,
  syncMode,
}: UsePlanBuilderFieldActionsOptions): PlanBuilderFieldActions {
  function setField<Field extends PlanBuilderField>(
    field: Field,
    value: PlanBuilderData[Field],
  ) {
    dispatch(createSetFieldAction(field, value));
  }

  const activityActions = useActivityFieldActions({
    dispatch,
    syncMode,
  });
  const planActions = usePlanFieldActions({ setField });
  const identityActions = useIdentityFieldActions({ setField });
  const planCreationSettingsActions = usePlanCreationSettingsFieldActions({
    setField,
    state,
    syncMode,
  });

  return {
    setField,
    ...activityActions,
    ...planActions,
    ...identityActions,
    ...planCreationSettingsActions,
  };
}
