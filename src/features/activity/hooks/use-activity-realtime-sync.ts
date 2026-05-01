import { useEffect } from "react";

import { ActivityCommands } from "@/features/activity/api/activity-commands";
import { ActivityRealtimeHandlers } from "@/features/activity/api/activity-realtime-handlers";
import { useActivityStore } from "@/features/activity/store/activity.store";
import { realtimeClient } from "@/shared/api/realtime-client";
import { shouldApplyRealtimeEvent } from "@/shared/lib/realtime-event-registry";
import {
  realtimeChatReadPayloadSchema,
  realtimeChatTypingPayloadSchema,
  realtimeGroupUpdatedPayloadSchema,
  realtimeMessagePayloadSchema,
  realtimePresenceChangedPayloadSchema,
  realtimePlanUpdatedPayloadSchema,
  type User,
} from "@/shared/schemas";

interface UseActivityRealtimeSyncInput {
  activeChatId?: string | null;
  activeGroupId?: string | null;
  activePlanId?: string | null;
  currentUser?: User | null;
}

export function useActivityRealtimeSync({
  activeChatId,
  activeGroupId,
  activePlanId,
  currentUser,
}: UseActivityRealtimeSyncInput) {
  const setChatTypingState = useActivityStore(
    (state) => state.setChatTypingState,
  );
  const clearChatTypingState = useActivityStore(
    (state) => state.clearChatTypingState,
  );

  useEffect(() => {
    if (!activeChatId) {
      return;
    }

    realtimeClient.emit("chat.subscribe", { chatId: activeChatId });

    return () => {
      clearChatTypingState(activeChatId);
      realtimeClient.emit("chat.unsubscribe", { chatId: activeChatId });
    };
  }, [activeChatId, clearChatTypingState]);

  useEffect(() => {
    if (!activePlanId) {
      return;
    }

    realtimeClient.emit("plan.subscribe", { planId: activePlanId });

    return () => {
      realtimeClient.emit("plan.unsubscribe", { planId: activePlanId });
    };
  }, [activePlanId]);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    const typingTimeouts = new Map<string, number>();

    const offMessageNew = realtimeClient.on("message.new", async (payload) => {
      const parsed = realtimeMessagePayloadSchema.parse(payload);

      if (!shouldApplyRealtimeEvent(parsed)) {
        return;
      }

      await ActivityRealtimeHandlers.applyMessage(
        parsed.chatId,
        parsed.message,
        {
          activeChatId,
        },
      );

      if (
        activeChatId === parsed.chatId &&
        parsed.message.senderId !== currentUser.id
      ) {
        await ActivityCommands.markChatRead(parsed.chatId, parsed.message.id);
      }
    });

    const offMessageUpdated = realtimeClient.on(
      "message.updated",
      async (payload) => {
        const parsed = realtimeMessagePayloadSchema.parse(payload);

        if (!shouldApplyRealtimeEvent(parsed)) {
          return;
        }

        await ActivityRealtimeHandlers.applyMessage(
          parsed.chatId,
          parsed.message,
          {
            activeChatId,
          },
        );
      },
    );

    const offChatRead = realtimeClient.on("chat.read", (payload) => {
      const parsed = realtimeChatReadPayloadSchema.parse(payload);

      if (!shouldApplyRealtimeEvent(parsed)) {
        return;
      }

      ActivityRealtimeHandlers.applyChatRead(parsed.chat);
    });

    const offChatTyping = realtimeClient.on("chat.typing", (payload) => {
      const parsed = realtimeChatTypingPayloadSchema.parse(payload);

      if (parsed.user.id === currentUser.id) {
        return;
      }

      setChatTypingState(parsed.chatId, parsed.user, parsed.isTyping);

      const timeoutKey = `${parsed.chatId}:${parsed.user.id}`;
      const existingTimeout = typingTimeouts.get(timeoutKey);
      if (existingTimeout !== undefined) {
        window.clearTimeout(existingTimeout);
        typingTimeouts.delete(timeoutKey);
      }

      if (parsed.isTyping) {
        const timeout = window.setTimeout(() => {
          setChatTypingState(parsed.chatId, parsed.user, false);
          typingTimeouts.delete(timeoutKey);
        }, 2600);

        typingTimeouts.set(timeoutKey, timeout);
      }
    });

    const offPresenceChanged = realtimeClient.on(
      "presence.changed",
      (payload) => {
        const parsed = realtimePresenceChangedPayloadSchema.parse(payload);

        ActivityRealtimeHandlers.applyPresenceChanged(
          parsed.user.id,
          parsed.onlineStatus,
        );
      },
    );

    const offPlanUpdated = realtimeClient.on(
      "plan.updated",
      async (payload) => {
        const parsed = realtimePlanUpdatedPayloadSchema.parse(payload);

        if (!shouldApplyRealtimeEvent(parsed)) {
          return;
        }

        if (!activeGroupId || parsed.groupId !== activeGroupId) {
          return;
        }

        ActivityRealtimeHandlers.applyPlanUpdate(
          parsed.groupId,
          parsed.plan,
          parsed.proposal,
          parsed.kind,
        );
      },
    );

    const offGroupUpdated = realtimeClient.on("group.updated", (payload) => {
      const parsed = realtimeGroupUpdatedPayloadSchema.parse(payload);

      if (!shouldApplyRealtimeEvent(parsed)) {
        return;
      }

      ActivityRealtimeHandlers.applyGroupUpdate(currentUser.id, parsed.group);
    });

    return () => {
      for (const timeout of typingTimeouts.values()) {
        window.clearTimeout(timeout);
      }

      offMessageNew();
      offMessageUpdated();
      offChatRead();
      offChatTyping();
      offPresenceChanged();
      offPlanUpdated();
      offGroupUpdated();
    };
  }, [activeChatId, activeGroupId, currentUser, setChatTypingState]);
}
