import type { ReactNode } from "react";
import type { ActionDialogProps } from "./action-dialog.types";
import { ACTION_DIALOG_TONE_CONFIG } from "./action-dialog-tone";

export interface ActionDialogConfirmState {
  disabled: boolean;
  isBusy: boolean;
  onConfirm: ActionDialogProps["onConfirm"];
}

export function getActionDialogTitleLabel(title: ReactNode) {
  return typeof title === "string" ? title : "Action dialog";
}

export function hasActionDialogDetails(
  details: ActionDialogProps["details"],
): details is string[] {
  return Boolean(details?.length);
}

export function getActionDialogRenderState({
  confirmVariant,
  internalLoading,
  loading,
  tone,
}: {
  confirmVariant: ActionDialogProps["confirmVariant"];
  internalLoading: boolean;
  loading: boolean;
  tone: NonNullable<ActionDialogProps["tone"]>;
}) {
  const config = ACTION_DIALOG_TONE_CONFIG[tone];

  return {
    actionVariant: confirmVariant ?? config.confirmVariant,
    config,
    Icon: config.defaultIcon,
    isBusy: loading || internalLoading,
  };
}

export function canRunActionDialogConfirm(
  state: ActionDialogConfirmState,
): state is ActionDialogConfirmState & { onConfirm: () => unknown } {
  return Boolean(state.onConfirm) && !state.disabled && !state.isBusy;
}

export async function runActionDialogConfirm({
  closeOnConfirm,
  onConfirm,
  setDialogOpen,
}: {
  closeOnConfirm: boolean;
  onConfirm: () => unknown;
  setDialogOpen: (open: boolean) => void;
}) {
  await onConfirm();

  if (closeOnConfirm) {
    setDialogOpen(false);
  }
}
