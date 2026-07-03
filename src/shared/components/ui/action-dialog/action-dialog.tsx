import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import { showAppErrorToast } from "@/shared/lib/error-toast";
import { captureException } from "@/shared/lib/telemetry";
import { cn } from "@/shared/lib/utils";
import type { ActionDialogProps } from "./action-dialog.types";
import { ActionDialogActions } from "./action-dialog-actions";
import { ActionDialogChildren } from "./action-dialog-children";
import { ActionDialogDetails } from "./action-dialog-details";
import { ActionDialogHeading } from "./action-dialog-heading";
import {
  canRunActionDialogConfirm,
  getActionDialogRenderState,
  getActionDialogTitleLabel,
  runActionDialogConfirm,
} from "./action-dialog-state";

export function ActionDialog({
  cancelLabel = "Keep working",
  children,
  closeLabel = "Got it",
  closeOnConfirm = true,
  confirmLabel = "Confirm",
  confirmVariant,
  contentClassName,
  description,
  details,
  disabled = false,
  eyebrow,
  icon,
  loading = false,
  onConfirm,
  onContentClick,
  onOpenChange,
  open,
  title,
  tone = "info",
  trigger,
}: ActionDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [internalLoading, setInternalLoading] = useState(false);
  const { actionVariant, config, Icon, isBusy } = getActionDialogRenderState({
    confirmVariant,
    internalLoading,
    loading,
    tone,
  });
  const isControlled = open !== undefined;
  const dialogOpen = open ?? internalOpen;

  function setDialogOpen(nextOpen: boolean) {
    if (!isControlled) {
      setInternalOpen(nextOpen);
    }

    onOpenChange?.(nextOpen);
  }

  async function handleConfirm() {
    const confirmState = { disabled, isBusy, onConfirm };

    if (!canRunActionDialogConfirm(confirmState)) {
      return;
    }

    setInternalLoading(true);

    const confirmResult = await runActionDialogConfirm({
      closeOnConfirm,
      onConfirm: confirmState.onConfirm,
      setDialogOpen,
    }).then(
      () => ({ ok: true as const }),
      (error: unknown) => ({ error, ok: false as const }),
    );

    setInternalLoading(false);

    if (!confirmResult.ok) {
      captureException("ui.action-dialog.confirm", confirmResult.error, {
        title: getActionDialogTitleLabel(title),
      });
      showAppErrorToast(confirmResult.error);
    }
  }

  return (
    <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {trigger ? (
        <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      ) : null}
      <AlertDialogContent
        onClick={onContentClick}
        className={cn(
          "w-[calc(100%-2rem)] overflow-hidden rounded-md border-border/80 bg-canvas p-0 shadow-none sm:max-w-md [&>button]:top-4 [&>button]:right-4 [&>button]:shadow-none",
          contentClassName,
        )}
      >
        <ActionDialogHeading
          config={config}
          description={description}
          eyebrow={eyebrow}
          icon={icon}
          Icon={Icon}
          title={title}
        />

        <ActionDialogDetails config={config} details={details} />

        <ActionDialogChildren>{children}</ActionDialogChildren>

        <ActionDialogActions
          actionVariant={actionVariant}
          cancelLabel={cancelLabel}
          closeLabel={closeLabel}
          confirmLabel={confirmLabel}
          disabled={disabled}
          isBusy={isBusy}
          onClose={() => setDialogOpen(false)}
          onConfirm={
            onConfirm
              ? () => {
                  void handleConfirm();
                }
              : undefined
          }
        />
      </AlertDialogContent>
    </AlertDialog>
  );
}
