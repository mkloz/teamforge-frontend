import type { LucideIcon } from "lucide-react";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";

export interface MessageActionItem {
  icon: LucideIcon;
  id: string;
  label: string;
  onSelect: () => unknown;
  tone?: "danger";
}

export interface MessageActionCallbacks {
  onForward?: (
    message: UnifiedMessage,
    targetChatId: string,
  ) => Promise<unknown>;
  onPin: (message: UnifiedMessage) => Promise<void> | void;
  onReply: (message: UnifiedMessage) => void;
  onRetry: (message: UnifiedMessage) => Promise<void> | void;
  onSelectMessage?: (message: UnifiedMessage) => void;
  onStartEdit: (message: UnifiedMessage) => void;
  onToggleSaved?: (
    message: UnifiedMessage,
    isSaved: boolean,
  ) => Promise<unknown>;
  onUnpin: (message: UnifiedMessage) => Promise<void> | void;
}

export interface GetMessageActionMenuStateInput extends MessageActionCallbacks {
  isSaved: boolean;
  message: UnifiedMessage;
  reactionPickerDisabled: boolean;
  setDeleteDialogOpen: (open: boolean) => void;
  setForwardDialogOpen: (open: boolean) => void;
}

export interface PrimaryMessageActionsInput
  extends MessageActionCallbacks,
    MessageActionAvailability {
  isSaved: boolean;
  message: UnifiedMessage;
  setForwardDialogOpen: (open: boolean) => void;
}

export interface DangerMessageActionsInput {
  canDelete: boolean;
  setDeleteDialogOpen: (open: boolean) => void;
}

export interface MessageActionAvailability {
  canCopy: boolean;
  canDelete: boolean;
  canEdit: boolean;
  canPin: boolean;
  canReact: boolean;
  canReply: boolean;
  canRetry: boolean;
  canSave: boolean;
  canSelect: boolean;
  copyContent: string;
}

export type MessageActionCandidate = MessageActionItem | null;
