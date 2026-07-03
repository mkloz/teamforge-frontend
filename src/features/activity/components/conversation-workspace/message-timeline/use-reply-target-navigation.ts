import { useEffect, useEffectEvent, useRef } from "react";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import type { ScrollToMessage } from "./message-scroll.types";
import type { LoadOlderMessagesRequestOptions } from "./use-load-older-messages-request";

interface UseReplyTargetNavigationInput {
  hasOlderMessages: boolean;
  messages: UnifiedMessage[];
  requestLoadOlderMessages: (
    options?: LoadOlderMessagesRequestOptions,
  ) => boolean;
  scrollToMessage: ScrollToMessage;
}

export function useReplyTargetNavigation({
  hasOlderMessages,
  messages,
  requestLoadOlderMessages,
  scrollToMessage,
}: UseReplyTargetNavigationInput) {
  const pendingReplyTargetIdRef = useRef<string | null>(null);

  const requestLoadOlderMessagesFromEffect = useEffectEvent(() => {
    requestLoadOlderMessages();
  });

  function activateReplyTarget(messageId: string) {
    if (hasLoadedMessage(messages, messageId)) {
      pendingReplyTargetIdRef.current = null;
      scrollToMessage(messageId, { highlight: true });
      return;
    }

    pendingReplyTargetIdRef.current = messageId;

    if (!requestLoadOlderMessages() && !hasOlderMessages) {
      pendingReplyTargetIdRef.current = null;
    }
  }

  useEffect(() => {
    const pendingReplyTargetId = pendingReplyTargetIdRef.current;

    if (!pendingReplyTargetId) {
      return undefined;
    }

    if (hasLoadedMessage(messages, pendingReplyTargetId)) {
      const frame = requestAnimationFrame(() => {
        scrollToMessage(pendingReplyTargetId, { highlight: true });
        pendingReplyTargetIdRef.current = null;
      });

      return () => cancelAnimationFrame(frame);
    }

    if (!hasOlderMessages) {
      pendingReplyTargetIdRef.current = null;
      return undefined;
    }

    requestLoadOlderMessagesFromEffect();
    return undefined;
  }, [messages, hasOlderMessages, scrollToMessage]);

  return {
    activateReplyTarget,
  };
}

function hasLoadedMessage(messages: UnifiedMessage[], messageId: string) {
  return messages.some((message) => message.id === messageId);
}
