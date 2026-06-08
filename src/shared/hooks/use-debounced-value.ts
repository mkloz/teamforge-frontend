import { useEffect, useState } from "react";

import { cancelDelay, scheduleDelay } from "@/shared/lib/browser-scheduling";

export function useDebouncedValue<T>(value: T, delayMs = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = scheduleDelay(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      cancelDelay(timeoutId);
    };
  }, [delayMs, value]);

  return debouncedValue;
}
