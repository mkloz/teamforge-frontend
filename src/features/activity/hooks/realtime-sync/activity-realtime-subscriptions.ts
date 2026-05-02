import { realtimeClient } from "@/shared/api/realtime-client";

export function subscribeToRealtimeChat(
  chatId: string,
  onUnsubscribe: (chatId: string) => void,
) {
  realtimeClient.emit("chat.subscribe", { chatId });

  return () => {
    onUnsubscribe(chatId);
    realtimeClient.emit("chat.unsubscribe", { chatId });
  };
}

export function subscribeToRealtimePlan(planId: string) {
  realtimeClient.emit("plan.subscribe", { planId });

  return () => {
    realtimeClient.emit("plan.unsubscribe", { planId });
  };
}
