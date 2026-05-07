import { useEffect, useEffectEvent, useRef } from "react";

import { realtimeClient } from "@/shared/api/realtime-client";
import { cancelDelay, scheduleDelay } from "@/shared/lib/browser-scheduling";
import type { ScheduledDelayHandle } from "@/shared/lib/browser-scheduling";

interface UseChatTypingSignalInput {
  chatId?: string | null;
  isFocused: boolean;
  isPaused?: boolean;
  text: string;
}

const TYPING_STOP_DELAY_MS = 1800;

function emitTypingStatus(chatId: string, isTyping: boolean) {
  realtimeClient.emit("chat.typing", {
    chatId,
    isTyping,
  });
}

export function useChatTypingSignal({
  chatId,
  isFocused,
  isPaused = false,
  text,
}: UseChatTypingSignalInput) {
  const isTypingRef = useRef(false);
  const stopTimerRef = useRef<ScheduledDelayHandle | null>(null);

  const clearStopTimer = useEffectEvent(() => {
    if (stopTimerRef.current !== null) {
      cancelDelay(stopTimerRef.current);
      stopTimerRef.current = null;
    }
  });

  const stopTyping = useEffectEvent(
    (targetChatId: string | null | undefined) => {
      clearStopTimer();

      if (targetChatId && isTypingRef.current) {
        isTypingRef.current = false;
        emitTypingStatus(targetChatId, false);
      }
    },
  );

  useEffect(() => {
    return () => {
      stopTyping(chatId);
    };
  }, [chatId]);

  useEffect(() => {
    clearStopTimer();

    const shouldType =
      !!chatId && isFocused && !isPaused && text.trim().length > 0;

    if (!shouldType) {
      stopTyping(chatId);
      return;
    }

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      emitTypingStatus(chatId, true);
    }

    stopTimerRef.current = scheduleDelay(() => {
      stopTyping(chatId);
    }, TYPING_STOP_DELAY_MS);
  }, [chatId, isFocused, isPaused, text]);
}
