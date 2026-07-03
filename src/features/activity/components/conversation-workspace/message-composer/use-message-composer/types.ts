import type { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";

export type OfflineActionGuard = ReturnType<
  typeof useOfflineActionGuard
>["guardOfflineAction"];

export interface MessageReference {
  id: string;
}
