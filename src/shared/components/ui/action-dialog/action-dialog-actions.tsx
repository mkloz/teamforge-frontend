import {
  AlertDialogCancel,
  AlertDialogFooter,
} from "@/shared/components/ui/alert-dialog";
import { Button, type ButtonV2Props } from "@/shared/components/ui/button";

export function ActionDialogActions({
  actionVariant,
  cancelLabel,
  closeLabel,
  confirmLabel,
  disabled,
  isBusy,
  onClose,
  onConfirm,
}: {
  actionVariant: ButtonV2Props["variant"];
  cancelLabel: string;
  closeLabel: string;
  confirmLabel: string;
  disabled: boolean;
  isBusy: boolean;
  onClose: () => void;
  onConfirm?: () => void;
}) {
  return (
    <AlertDialogFooter className="bg-transparent px-6 pt-2 pb-6 sm:justify-between">
      {onConfirm ? (
        <>
          <AlertDialogCancel disabled={isBusy} className="rounded-md">
            {cancelLabel}
          </AlertDialogCancel>
          <Button
            type="button"
            variant={actionVariant}
            loading={isBusy}
            disabled={disabled || isBusy}
            className="rounded-md"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </>
      ) : (
        <Button type="button" variant="primary" onClick={onClose}>
          {closeLabel}
        </Button>
      )}
    </AlertDialogFooter>
  );
}
