import { useEffect, useEffectEvent } from "react";

import {
  subscribeToRealtimeChat,
  subscribeToRealtimePlan,
} from "@/features/activity/hooks/realtime-sync/activity-realtime-subscriptions";
import {
  clearTypingTimeoutRegistry,
  createTypingTimeoutRegistry,
  handleRealtimeTypingPayload,
} from "@/features/activity/hooks/realtime-sync/activity-realtime-typing";
import {
  handleRealtimeMessageNew,
  handleRealtimeMessageUpdated,
} from "@/features/activity/hooks/realtime-sync/activity-realtime-message-events";
import {
  handleRealtimeChatRead,
  handleRealtimeGroupUpdated,
  handleRealtimePlanUpdated,
  handleRealtimePresenceChanged,
} from "@/features/activity/hooks/realtime-sync/activity-realtime-surface-events";
import { useActivityStore } from "@/features/activity/store/activity.store";
import { realtimeClient } from "@/shared/api/realtime-client";
import type { User } from "@/shared/schemas";

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
  const currentUserId = currentUser?.id ?? null;

  const handleMessageNew = useEffectEvent(async (payload: unknown) => {
    if (!currentUserId) {
      return;
    }

    await handleRealtimeMessageNew(payload, {
      activeChatId,
      currentUserId,
    });
  });

  const handleMessageUpdated = useEffectEvent(async (payload: unknown) => {
    await handleRealtimeMessageUpdated(payload, activeChatId);
  });

  const handleChatRead = useEffectEvent((payload: unknown) => {
    handleRealtimeChatRead(payload);
  });

  const handleChatTyping = useEffectEvent(
    (payload: unknown, registry: Map<string, number>) => {
      if (!currentUserId) {
        return;
      }

      handleRealtimeTypingPayload(
        payload,
        currentUserId,
        setChatTypingState,
        registry,
      );
    },
  );

  const handlePresenceChanged = useEffectEvent((payload: unknown) => {
    handleRealtimePresenceChanged(payload);
  });

  const handlePlanUpdated = useEffectEvent((payload: unknown) => {
    handleRealtimePlanUpdated(payload, activeGroupId);
  });

  const handleGroupUpdated = useEffectEvent((payload: unknown) => {
    if (!currentUserId) {
      return;
    }

    handleRealtimeGroupUpdated(payload, currentUserId);
  });

  useEffect(() => {
    if (!activeChatId) {
      return;
    }

    return subscribeToRealtimeChat(activeChatId, clearChatTypingState);
  }, [activeChatId, clearChatTypingState]);

  useEffect(() => {
    if (!activePlanId) {
      return;
    }

    return subscribeToRealtimePlan(activePlanId);
  }, [activePlanId]);

  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    const typingTimeouts = createTypingTimeoutRegistry();

    const offMessageNew = realtimeClient.on("message.new", handleMessageNew);

    const offMessageUpdated = realtimeClient.on(
      "message.updated",
      handleMessageUpdated,
    );

    const offChatRead = realtimeClient.on("chat.read", handleChatRead);

    const offChatTyping = realtimeClient.on("chat.typing", (payload) => {
      handleChatTyping(payload, typingTimeouts);
    });

    const offPresenceChanged = realtimeClient.on(
      "presence.changed",
      handlePresenceChanged,
    );

    const offPlanUpdated = realtimeClient.on("plan.updated", handlePlanUpdated);

    const offGroupUpdated = realtimeClient.on(
      "group.updated",
      handleGroupUpdated,
    );

    return () => {
      clearTypingTimeoutRegistry(typingTimeouts);

      offMessageNew();
      offMessageUpdated();
      offChatRead();
      offChatTyping();
      offPresenceChanged();
      offPlanUpdated();
      offGroupUpdated();
    };
  }, [currentUserId]);
}
