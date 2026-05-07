import { useEffect } from "react";

import {
  disconnectRealtimeSession,
  subscribeAppRealtimeEvents,
  subscribeRealtimeSessionSync,
} from "@/app/runtime/app-realtime-events";

export function AppRealtimeSync() {
  useEffect(() => {
    const unsubscribeSession = subscribeRealtimeSessionSync();
    const unsubscribeRealtimeEvents = subscribeAppRealtimeEvents();

    return () => {
      unsubscribeRealtimeEvents();
      unsubscribeSession();
      disconnectRealtimeSession();
    };
  }, []);

  return null;
}
