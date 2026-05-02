import { ActivityCommands } from "@/features/activity/api/activity-commands";
import { ActivityRealtimeHandlers } from "@/features/activity/api/activity-realtime-handlers";
import { shouldApplyRealtimeEvent } from "@/shared/lib/realtime-event-registry";
import { realtimeMessagePayloadSchema } from "@/shared/schemas";
import type { RealtimeMessagePayload } from "@/shared/schemas";

interface RealtimeMessageEventContext {
  activeChatId?: string | null;
  currentUserId: string;
}

async function markIncomingActiveChatMessageRead(
  payload: RealtimeMessagePayload,
  { activeChatId, currentUserId }: RealtimeMessageEventContext,
) {
  if (activeChatId !== payload.chatId) {
    return;
  }

  if (payload.message.senderId === currentUserId) {
    return;
  }

  await ActivityCommands.markChatRead(payload.chatId, payload.message.id);
}

export async function handleRealtimeMessageNew(
  payload: unknown,
  context: RealtimeMessageEventContext,
) {
  const parsed = realtimeMessagePayloadSchema.parse(payload);

  if (!shouldApplyRealtimeEvent(parsed)) {
    return;
  }

  await ActivityRealtimeHandlers.applyMessage(parsed.chatId, parsed.message, {
    activeChatId: context.activeChatId,
  });
  await markIncomingActiveChatMessageRead(parsed, context);
}

export async function handleRealtimeMessageUpdated(
  payload: unknown,
  activeChatId?: string | null,
) {
  const parsed = realtimeMessagePayloadSchema.parse(payload);

  if (!shouldApplyRealtimeEvent(parsed)) {
    return;
  }

  await ActivityRealtimeHandlers.applyMessage(parsed.chatId, parsed.message, {
    activeChatId,
  });
}
