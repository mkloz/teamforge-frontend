import { useCallback, useState } from "react";
import { ActionDialog } from "@/shared/components/ui/action-dialog";
import type { ActionDialogProps } from "@/shared/components/ui/action-dialog/action-dialog.types";
import { useSettingsOverlayGuard } from "./settings-navigation-guard";

export function SettingsActionDialog(props: ActionDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const { onOpenChange } = props;
  const isControlled = props.open !== undefined;
  const open = props.open ?? internalOpen;
  const setOpen = useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [isControlled, onOpenChange],
  );

  useSettingsOverlayGuard(open, () => setOpen(false));

  return <ActionDialog {...props} onOpenChange={setOpen} open={open} />;
}
