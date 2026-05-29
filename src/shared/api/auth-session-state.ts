import { useSyncExternalStore } from "react";

import { authSession } from "@/shared/api/auth-session";

export function useAuthSessionState() {
  const tokens = useSyncExternalStore(
    (listener) => authSession.subscribe(listener),
    () => authSession.getTokens(),
    () => authSession.getTokens(),
  );

  return {
    tokens,
    isAuthenticated: tokens !== null,
  };
}
