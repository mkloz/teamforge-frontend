import type { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";

export function shouldSkipOfflinePushAction(
  guardOfflineAction: ReturnType<
    typeof useOfflineActionGuard
  >["guardOfflineAction"],
  description: string,
  id: string,
) {
  return guardOfflineAction({ description, id });
}
