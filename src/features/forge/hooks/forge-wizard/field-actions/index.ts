import { useCallback } from "react";

import type {
  ForgeWizardData,
  ForgeWizardField,
} from "@/features/forge/lib/forge-wizard";

import { createSetFieldAction } from "./action-creators";
import type {
  ForgeWizardFieldActions,
  UseForgeWizardFieldActionsOptions,
} from "./types";
import { useActivityFieldActions } from "./use-activity-field-actions";
import { useForgeSettingsFieldActions } from "./use-forge-settings-field-actions";
import { useIdentityFieldActions } from "./use-identity-field-actions";
import { usePlanFieldActions } from "./use-plan-field-actions";

export function useForgeWizardFieldActions({
  dispatch,
  state,
  syncMode,
}: UseForgeWizardFieldActionsOptions): ForgeWizardFieldActions {
  const setField = useCallback(
    <Field extends ForgeWizardField>(
      field: Field,
      value: ForgeWizardData[Field],
    ) => {
      dispatch(createSetFieldAction(field, value));
    },
    [dispatch],
  );

  const activityActions = useActivityFieldActions({
    dispatch,
    syncMode,
  });
  const planActions = usePlanFieldActions({ setField });
  const identityActions = useIdentityFieldActions({ setField });
  const forgeSettingsActions = useForgeSettingsFieldActions({
    setField,
    state,
    syncMode,
  });

  return {
    setField,
    ...activityActions,
    ...planActions,
    ...identityActions,
    ...forgeSettingsActions,
  };
}
