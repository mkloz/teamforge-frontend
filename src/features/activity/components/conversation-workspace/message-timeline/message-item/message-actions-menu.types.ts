import type { ReactNode } from "react";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";

export interface MessageContextMenuBaseProps {
  message: UnifiedMessage;
  onDelete: (message: UnifiedMessage) => Promise<void> | void;
  onPin: (message: UnifiedMessage) => Promise<void> | void;
  onReply: (message: UnifiedMessage) => void;
  onRetry: (message: UnifiedMessage) => Promise<void> | void;
  onStartEdit: (message: UnifiedMessage) => void;
  onForward?: (
    message: UnifiedMessage,
    targetChatId: string,
  ) => Promise<unknown>;
  onToggleReaction: (
    message: UnifiedMessage,
    emoji: string,
  ) => Promise<void> | void;
  reactionPickerDisabled?: boolean;
  selectedReactionEmojis?: readonly string[];
  onUnpin: (message: UnifiedMessage) => Promise<void> | void;
  isSaved?: boolean;
  onToggleSaved?: (
    message: UnifiedMessage,
    isSaved: boolean,
  ) => Promise<unknown>;
  onSelectMessage?: (message: UnifiedMessage) => void;
  onOpenChange?: (open: boolean) => void;
  isOnline?: boolean;
}

export interface MessageContextMenuProps extends MessageContextMenuBaseProps {
  children: ReactNode;
}

export type MessageActionMenuInput = Pick<
  MessageContextMenuBaseProps,
  | "isSaved"
  | "message"
  | "onForward"
  | "onPin"
  | "onReply"
  | "onRetry"
  | "onSelectMessage"
  | "onStartEdit"
  | "onToggleSaved"
  | "onUnpin"
  | "reactionPickerDisabled"
  | "selectedReactionEmojis"
>;
