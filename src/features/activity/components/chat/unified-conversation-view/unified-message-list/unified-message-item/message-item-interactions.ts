import type { KeyboardEvent, MouseEvent } from "react";

import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { showAppErrorToast } from "@/shared/lib/error-toast";

interface ToggleMessageSelectionFromPointerInput {
  canToggleSelection: boolean;
  event: MouseEvent<HTMLElement>;
  message: UnifiedMessage;
  onToggleSelected?: (message: UnifiedMessage) => void;
}

interface ToggleMessageSelectionFromKeyboardInput {
  canToggleSelection: boolean;
  event: KeyboardEvent<HTMLElement>;
  message: UnifiedMessage;
  onToggleSelected?: (message: UnifiedMessage) => void;
}

interface ToggleMessageReactionWithToastInput {
  emoji: string;
  message: UnifiedMessage;
  onToggleReaction: (
    message: UnifiedMessage,
    emoji: string,
  ) => Promise<void> | void;
}

interface MessageItemInteractionHandlersInput {
  canToggleSelection: boolean;
  message: UnifiedMessage;
  onToggleReaction: (
    message: UnifiedMessage,
    emoji: string,
  ) => Promise<void> | void;
  onToggleSelected?: (message: UnifiedMessage) => void;
}

interface MessageItemInteractionHandlers {
  handleMessageClick: (event: MouseEvent<HTMLElement>) => void;
  handleMessageKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  handleToggleReaction: (emoji: string) => void;
}

export function createMessageItemInteractionHandlers({
  canToggleSelection,
  message,
  onToggleReaction,
  onToggleSelected,
}: MessageItemInteractionHandlersInput): MessageItemInteractionHandlers {
  return {
    handleMessageClick: (event) =>
      toggleMessageSelectionFromPointer({
        canToggleSelection,
        event,
        message,
        onToggleSelected,
      }),
    handleMessageKeyDown: (event) =>
      toggleMessageSelectionFromKeyboard({
        canToggleSelection,
        event,
        message,
        onToggleSelected,
      }),
    handleToggleReaction: (emoji) =>
      toggleMessageReactionWithToast({
        emoji,
        message,
        onToggleReaction,
      }),
  };
}

function toggleMessageSelectionFromPointer({
  canToggleSelection,
  event,
  message,
  onToggleSelected,
}: ToggleMessageSelectionFromPointerInput) {
  if (!canToggleSelection) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  onToggleSelected?.(message);
}

function toggleMessageSelectionFromKeyboard({
  canToggleSelection,
  event,
  message,
  onToggleSelected,
}: ToggleMessageSelectionFromKeyboardInput) {
  if (!canToggleSelection || !isMessageSelectionKey(event.key)) {
    return;
  }

  event.preventDefault();
  onToggleSelected?.(message);
}

function toggleMessageReactionWithToast({
  emoji,
  message,
  onToggleReaction,
}: ToggleMessageReactionWithToastInput) {
  void Promise.resolve(onToggleReaction(message, emoji)).catch((error) =>
    showAppErrorToast(error, {
      fallbackMessage: "We couldn't update that reaction.",
    }),
  );
}

function isMessageSelectionKey(key: string) {
  return key === "Enter" || key === " ";
}
