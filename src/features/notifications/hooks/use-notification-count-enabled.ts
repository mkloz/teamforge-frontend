import { useEffect, useState } from "react";
import { cancelDelay, scheduleDelay } from "@/shared/lib/browser-scheduling";

const PASSIVE_NOTIFICATION_COUNT_DELAY_MS = 12_000;

export function useNotificationCountEnabled() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (enabled) {
      return undefined;
    }

    const delayTask = scheduleDelay(() => {
      setEnabled(true);
    }, PASSIVE_NOTIFICATION_COUNT_DELAY_MS);

    return () => {
      cancelDelay(delayTask);
    };
  }, [enabled]);

  return [enabled, () => setEnabled(true)] as const;
}
