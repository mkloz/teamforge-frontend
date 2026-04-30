import { useEffect, useRef } from "react";

import { realtimeClient } from "@/shared/api/realtime-client";

interface UseChatTypingSignalInput {
  chatId?: string | null;
  isFocused: boolean;
  isPaused?: boolean;
  text: string;
}

const TYPING_STOP_DELAY_MS = 1800;

export function useChatTypingSignal({
  chatId,
  isFocused,
  isPaused = false,
  text,
}: UseChatTypingSignalInput) {
  const isTypingRef = useRef(false);
  const stopTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (stopTimerRef.current !== null) {
        window.clearTimeout(stopTimerRef.current);
      }

      if (chatId && isTypingRef.current) {
        realtimeClient.emit("chat.typing", {
          chatId,
          isTyping: false,
        });
      }
    };
  }, [chatId]);

  useEffect(() => {
    if (stopTimerRef.current !== null) {
      window.clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }

    const shouldType =
      !!chatId && isFocused && !isPaused && text.trim().length > 0;

    if (!shouldType) {
      if (chatId && isTypingRef.current) {
        isTypingRef.current = false;
        realtimeClient.emit("chat.typing", {
          chatId,
          isTyping: false,
        });
      }
      return;
    }

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      realtimeClient.emit("chat.typing", {
        chatId,
        isTyping: true,
      });
    }

    stopTimerRef.current = window.setTimeout(() => {
      if (chatId && isTypingRef.current) {
        isTypingRef.current = false;
        realtimeClient.emit("chat.typing", {
          chatId,
          isTyping: false,
        });
      }
    }, TYPING_STOP_DELAY_MS);
  }, [chatId, isFocused, isPaused, text]);
}
