import { useState } from "react";

export interface ForgeLimits {
  used: number;
  limit: number;
  resetsAt: string;
}

export function useForgeLimits(initial: ForgeLimits) {
  const [limits, _setLimits] = useState<ForgeLimits>(initial);

  const remaining = limits.limit - limits.used;
  const isExhausted = remaining <= 0;
  const resetsInMs = new Date(limits.resetsAt).getTime() - Date.now();
  const resetsInHours = Math.ceil(resetsInMs / (1000 * 60 * 60));

  return {
    limits,
    remaining,
    isExhausted,
    resetsInHours,
    resetsAt: limits.resetsAt,
  };
}
