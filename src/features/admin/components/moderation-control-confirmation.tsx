import type { ReactNode } from "react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";

interface ModerationControlConfirmationProps {
  actionLabel: string;
  children: ReactNode;
  description: string;
  disabled?: boolean;
  errorMessage?: string | null;
  loading: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  title: string;
  tone?: "default" | "destructive";
}

export function ModerationControlConfirmation({
  actionLabel,
  children,
  description,
  disabled = false,
  errorMessage,
  loading,
  onConfirm,
  onOpenChange,
  open,
  title,
  tone = "default",
}: ModerationControlConfirmationProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild disabled={disabled}>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {errorMessage ? (
          <p className="text-destructive text-sm" role="alert">
            {errorMessage}
          </p>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <Button
            type="button"
            variant={tone === "destructive" ? "destructive" : "primary"}
            disabled={loading}
            loading={loading}
            onClick={onConfirm}
          >
            {actionLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
