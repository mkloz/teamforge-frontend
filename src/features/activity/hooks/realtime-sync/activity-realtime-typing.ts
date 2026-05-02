import { realtimeChatTypingPayloadSchema } from "@/shared/schemas";
import type { RealtimeChatTypingPayload } from "@/shared/schemas";

type TypingUser = RealtimeChatTypingPayload["user"];
type SetChatTypingState = (
  chatId: string,
  user: TypingUser,
  isTyping: boolean,
) => void;

export function createTypingTimeoutRegistry() {
  return new Map<string, number>();
}

export function clearTypingTimeoutRegistry(
  typingTimeouts: Map<string, number>,
) {
  for (const timeout of typingTimeouts.values()) {
    window.clearTimeout(timeout);
  }

  typingTimeouts.clear();
}

export function handleRealtimeTypingPayload(
  payload: unknown,
  currentUserId: string,
  setChatTypingState: SetChatTypingState,
  typingTimeouts: Map<string, number>,
) {
  const parsed = realtimeChatTypingPayloadSchema.parse(payload);

  if (parsed.user.id === currentUserId) {
    return;
  }

  setChatTypingState(parsed.chatId, parsed.user, parsed.isTyping);

  const timeoutKey = `${parsed.chatId}:${parsed.user.id}`;
  const existingTimeout = typingTimeouts.get(timeoutKey);

  if (existingTimeout !== undefined) {
    window.clearTimeout(existingTimeout);
    typingTimeouts.delete(timeoutKey);
  }

  if (!parsed.isTyping) {
    return;
  }

  const timeout = window.setTimeout(() => {
    setChatTypingState(parsed.chatId, parsed.user, false);
    typingTimeouts.delete(timeoutKey);
  }, 2600);

  typingTimeouts.set(timeoutKey, timeout);
}
