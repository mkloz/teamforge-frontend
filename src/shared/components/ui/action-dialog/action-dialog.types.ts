import type { MouseEventHandler, ReactNode } from "react";
import type { ButtonV2Props } from "@/shared/components/ui/button";

export type ActionDialogTone = "danger" | "info" | "success" | "warning";

export interface ActionDialogProps {
  cancelLabel?: string;
  children?: ReactNode;
  closeLabel?: string;
  closeOnConfirm?: boolean;
  confirmLabel?: string;
  confirmVariant?: ButtonV2Props["variant"];
  contentClassName?: string;
  description: ReactNode;
  details?: string[];
  disabled?: boolean;
  eyebrow?: string;
  icon?: ReactNode;
  loading?: boolean;
  onConfirm?: () => unknown;
  onContentClick?: MouseEventHandler<HTMLDivElement>;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  title: ReactNode;
  tone?: ActionDialogTone;
  trigger?: ReactNode;
}
