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
    <AlertDialogFooter className="grid grid-cols-2 gap-2 bg-transparent px-5 pt-2 pb-5 sm:px-6 sm:pb-6">
      {onConfirm ? (
        <>
          <AlertDialogCancel disabled={isBusy} className="w-full rounded-xl">
            {cancelLabel}
          </AlertDialogCancel>
          <Button
            type="button"
            variant={actionVariant}
            loading={isBusy}
            disabled={disabled || isBusy}
            className="w-full rounded-xl"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </>
      ) : (
        <Button
          type="button"
          variant="primary"
          className="col-span-2 w-full rounded-xl"
          onClick={onClose}
        >
          {closeLabel}
        </Button>
      )}
    </AlertDialogFooter>
  );
}
