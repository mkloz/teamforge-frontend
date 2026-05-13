import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";

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
  variant = "default",
}: ConfirmGroupActionButtonProps) {
  if (disabled) {
    return (
      <GroupActionButton
        disabled
        icon={icon}
        label={label}
        onClick={() => {}}
        variant={variant}
      />
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <GroupActionButton
          icon={icon}
          label={label}
          onClick={() => {}}
          variant={variant}
        />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
          <AlertDialogDescription>{confirmDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant={variant === "destructive" ? "destructive" : "primary"}
            onClick={() => {
              void onConfirm();
            }}
          >
            {confirmActionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
