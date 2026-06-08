import type { ScheduledDelayHandle } from "@/shared/lib/browser-scheduling";
import { cancelDelay, scheduleDelay } from "@/shared/lib/browser-scheduling";
import type { RealtimeChatTypingPayload } from "@/shared/schemas";
import { realtimeChatTypingPayloadSchema } from "@/shared/schemas";

type TypingUser = RealtimeChatTypingPayload["user"];
type TypingTimeoutHandle = ScheduledDelayHandle;
type SetChatTypingState = (
  chatId: string,
  user: TypingUser,
  isTyping: boolean,
) => void;

export function createTypingTimeoutRegistry() {
  return new Map<string, TypingTimeoutHandle>();
}

export function clearTypingTimeoutRegistry(
  typingTimeouts: Map<string, TypingTimeoutHandle>,
) {
  for (const timeout of typingTimeouts.values()) {
    cancelDelay(timeout);
  }

  typingTimeouts.clear();
}

export function handleRealtimeTypingPayload(
  payload: unknown,
  currentUserId: string,
  setChatTypingState: SetChatTypingState,
  typingTimeouts: Map<string, TypingTimeoutHandle>,
) {
  const parsed = realtimeChatTypingPayloadSchema.parse(payload);

  if (parsed.user.id === currentUserId) {
    return;
  }

  setChatTypingState(parsed.chatId, parsed.user, parsed.isTyping);

  const timeoutKey = `${parsed.chatId}:${parsed.user.id}`;
  const existingTimeout = typingTimeouts.get(timeoutKey);

  if (existingTimeout !== undefined) {
    cancelDelay(existingTimeout);
    typingTimeouts.delete(timeoutKey);
  }

  if (!parsed.isTyping) {
    return;
  }

  const timeout = scheduleDelay(() => {
    setChatTypingState(parsed.chatId, parsed.user, false);
    typingTimeouts.delete(timeoutKey);
  }, 2600);

  typingTimeouts.set(timeoutKey, timeout);
}
