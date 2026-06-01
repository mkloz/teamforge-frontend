import { useCallback } from "react";

import { useNetworkStatus } from "@/shared/hooks/use-network-status";
import { showAppInfoToast } from "@/shared/lib/app-toast";

interface OfflineActionGuardOptions {
  description: string;
  id: string;
  title?: string;
}

export function useOfflineActionGuard() {
  const isOnline = useNetworkStatus();

  const guardOfflineAction = useCallback(
    ({
      description,
      id,
      title = "You're offline.",
    }: OfflineActionGuardOptions) => {
      if (isOnline) {
        return false;
      }

      showAppInfoToast(title, {
        id,
        description,
      });
      return true;
    },
    [isOnline],
  );

  return {
    guardOfflineAction,
    isOnline,
  };
}
