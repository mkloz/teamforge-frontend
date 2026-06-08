import { ActionDialog } from "@/shared/components/ui/action-dialog";

import {
  GroupActionButton,
  type GroupActionButtonProps,
} from "./group-action-button";

interface ConfirmGroupActionButtonProps
  extends Omit<GroupActionButtonProps, "onClick"> {
  confirmActionLabel: string;
  confirmDescription: string;
  confirmTitle: string;
  onConfirm: () => Promise<void> | void;
}

export function ConfirmGroupActionButton({
  confirmActionLabel,
  confirmDescription,
  confirmTitle,
  disabled = false,
  icon,
  label,
  onConfirm,
  title,
  variant = "default",
}: ConfirmGroupActionButtonProps) {
  if (disabled) {
    return (
      <GroupActionButton
        disabled
        icon={icon}
        label={label}
        onClick={() => {}}
        title={title}
        variant={variant}
      />
    );
  }

  return (
    <ActionDialog
      cancelLabel="Stay here"
      confirmLabel={confirmActionLabel}
      description={confirmDescription}
      onConfirm={onConfirm}
      title={confirmTitle}
      tone={variant === "destructive" ? "danger" : "info"}
      trigger={
        <GroupActionButton
          icon={icon}
          label={label}
          onClick={() => {}}
          title={title}
          variant={variant}
        />
      }
    />
  );
}
