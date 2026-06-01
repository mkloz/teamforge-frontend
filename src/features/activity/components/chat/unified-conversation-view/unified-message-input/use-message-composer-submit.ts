import type { KeyboardEvent } from "react";
import { useState } from "react";

import type {
  ActivityOutgoingAttachment,
  ActivitySendMessageInput,
} from "@/features/activity/lib/activity-contract";
import { warnInDevelopment } from "@/shared/lib/development-warning";

interface UseMessageComposerSubmitOptions {
  disabled: boolean;
  isOnline: boolean;
  isEditing: boolean;
  onClearComposer: () => void;
  onOfflineSubmit: () => void;
  onSend: (input: ActivitySendMessageInput) => Promise<void> | void;
  pendingAttachments: ActivityOutgoingAttachment[];
  value: string;
}

interface MessageSubmitPayload {
  content: string;
  attachments: ActivityOutgoingAttachment[];
}

export function useMessageComposerSubmit({
  disabled,
  isOnline,
  isEditing,
  onClearComposer,
  onOfflineSubmit,
  onSend,
  pendingAttachments,
  value,
}: UseMessageComposerSubmitOptions) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isDisabled = disabled || (isEditing && isSubmitting);

  async function submitMessage(payload: MessageSubmitPayload) {
    if (!isEditing) {
      onClearComposer();

      try {
        await onSend(payload);
      } catch (error) {
        warnInDevelopment("Message send failed after composer clear.", error);
        // The message bubble keeps the failed state and the composer-level
        // error is set by the activity composer.
      }

      return;
    }

    setIsSubmitting(true);

    try {
      await onSend(payload);
      onClearComposer();
    } catch (error) {
      warnInDevelopment("Message edit failed; composer draft kept.", error);
      // Keep the edit draft in place so the user can fix or retry it.
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSubmit() {
    const trimmed = value.trim();

    if ((!trimmed && pendingAttachments.length === 0) || isDisabled) {
      return;
    }

    if (!isOnline) {
      onOfflineSubmit();
      return;
    }

    void submitMessage({
      content: trimmed,
      attachments: pendingAttachments,
    });
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  }

  return {
    handleKeyDown,
    handleSubmit,
    isDisabled,
    isSubmitting,
  };
}
