import {
  AlertTriangle,
  CheckCircle2,
  Info,
  type LucideIcon,
  ShieldAlert,
} from "lucide-react";
import type { ButtonV2Props } from "@/shared/components/ui/button";
import type { ActionDialogTone } from "./action-dialog.types";

export const ACTION_DIALOG_TONE_CONFIG = {
  danger: {
    defaultEyebrow: "Safety check",
    defaultIcon: ShieldAlert,
    iconClassName: "text-destructive",
    detailLabel: "Impact",
    ruleClassName: "border-destructive/45",
    confirmVariant: "destructive",
  },
  info: {
    defaultEyebrow: "Before you continue",
    defaultIcon: Info,
    iconClassName: "text-primary",
    detailLabel: "Worth knowing",
    ruleClassName: "border-primary/45",
    confirmVariant: "primary",
  },
  success: {
    defaultEyebrow: "Ready to confirm",
    defaultIcon: CheckCircle2,
    iconClassName: "text-primary",
    detailLabel: "What happens",
    ruleClassName: "border-primary/45",
    confirmVariant: "primary",
  },
  warning: {
    defaultEyebrow: "Quick check",
    defaultIcon: AlertTriangle,
    iconClassName: "text-accent",
    detailLabel: "Note",
    ruleClassName: "border-accent/45",
    confirmVariant: "secondary",
  },
} satisfies Record<
  ActionDialogTone,
  {
    confirmVariant: ButtonV2Props["variant"];
    defaultEyebrow: string;
    defaultIcon: LucideIcon;
    detailLabel: string;
    iconClassName: string;
    ruleClassName: string;
  }
>;

export type ActionDialogToneConfig =
  (typeof ACTION_DIALOG_TONE_CONFIG)[ActionDialogTone];
