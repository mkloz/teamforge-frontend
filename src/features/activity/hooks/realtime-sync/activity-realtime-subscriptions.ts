import { realtimeClient } from "@/shared/api/realtime-client";

export function subscribeToRealtimeChat(
  chatId: string,
  onUnsubscribe: (chatId: string) => void,
) {
  const emitSubscription = () => {
    realtimeClient.emit("chat.subscribe", { chatId });
  };
  const stopReplayingSubscription = realtimeClient.onConnect(emitSubscription);

  emitSubscription();

  return () => {
    stopReplayingSubscription();
    onUnsubscribe(chatId);
    realtimeClient.emit("chat.unsubscribe", { chatId });
  };
}

export function subscribeToRealtimePlan(planId: string) {
  const emitSubscription = () => {
    realtimeClient.emit("plan.subscribe", { planId });
  };
  const stopReplayingSubscription = realtimeClient.onConnect(emitSubscription);

  emitSubscription();

  return () => {
    stopReplayingSubscription();
    realtimeClient.emit("plan.unsubscribe", { planId });
  };
}
