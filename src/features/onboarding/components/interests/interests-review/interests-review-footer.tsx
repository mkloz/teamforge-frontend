import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface InterestsReviewFooterProps {
  backLabel?: string;
  onConfirm: () => void;
  canConfirm: boolean;
  onBack: () => void;
  isOnline?: boolean;
  isSaving?: boolean;
  confirmLabel?: string;
}

interface ConfirmButtonState {
  disabled: boolean;
  label: string;
  title: string | undefined;
}

export function InterestsReviewFooter({
  backLabel = "Back",
  onConfirm,
  canConfirm,
  onBack,
  isOnline = true,
  isSaving = false,
  confirmLabel = "Confirm & Finish",
}: InterestsReviewFooterProps) {
  const confirmButton = getConfirmButtonState({
    canConfirm,
    confirmLabel,
    isOnline,
    isSaving,
  });

  return (
    <div className="flex w-full xs:flex-row flex-col-reverse xs:items-center items-stretch gap-3 pt-4 pb-6 sm:pb-5">
      <Button
        variant="outline"
        size="md"
        onClick={onBack}
        disabled={isSaving}
        className="w-full xs:w-auto min-w-0 xs:shrink-0"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        <span className="truncate">{backLabel}</span>
      </Button>
      <Button
        variant="primary"
        size="md"
        onClick={onConfirm}
        disabled={confirmButton.disabled}
        title={confirmButton.title}
        className="w-full min-w-0 xs:flex-1"
      >
        <span className="truncate">{confirmButton.label}</span>
        <CheckCircle2 size={18} />
      </Button>
    </div>
  );
}

function getConfirmButtonState({
  canConfirm,
  confirmLabel,
  isOnline,
  isSaving,
}: Required<
  Pick<
    InterestsReviewFooterProps,
    "canConfirm" | "confirmLabel" | "isOnline" | "isSaving"
  >
>): ConfirmButtonState {
  return {
    disabled: !isOnline || !canConfirm || isSaving,
    label: getConfirmButtonLabel({ confirmLabel, isOnline, isSaving }),
    title: isOnline ? undefined : "Reconnect before saving interests.",
  };
}

function getConfirmButtonLabel({
  confirmLabel,
  isOnline,
  isSaving,
}: Required<
  Pick<InterestsReviewFooterProps, "confirmLabel" | "isOnline" | "isSaving">
>) {
  if (isSaving) {
    return "Saving…";
  }

  return isOnline ? confirmLabel : "Reconnect to save";
}
