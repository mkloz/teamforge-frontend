import type { KeyboardEvent } from "react";
import { useState } from "react";

import type {
  ActivityOutgoingAttachment,
  ActivitySendMessageInput,
} from "@/features/activity/lib/activity-contract";

interface UseMessageComposerSubmitOptions {
  disabled: boolean;
  onClearComposer: () => void;
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
  onClearComposer,
  onSend,
  pendingAttachments,
  value,
}: UseMessageComposerSubmitOptions) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isDisabled = disabled || isSubmitting;

  async function submitMessage(payload: MessageSubmitPayload) {
    setIsSubmitting(true);

    try {
      await onSend(payload);
      onClearComposer();
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSubmit() {
    const trimmed = value.trim();

    if ((!trimmed && pendingAttachments.length === 0) || isDisabled) {
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
