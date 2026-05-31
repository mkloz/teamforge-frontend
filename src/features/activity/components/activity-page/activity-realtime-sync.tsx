import { useQuery } from "@tanstack/react-query";
import { useActivityRealtimeSync } from "@/features/activity/hooks/use-activity-realtime-sync";
import { currentUserQueryOptions } from "@/shared/api/current-user-query";

interface ActivityRealtimeSyncProps {
  activeChatId?: string | null;
  activeGroupId?: string | null;
  activePlanId?: string | null;
}

export function ActivityRealtimeSync({
  activeChatId,
  activeGroupId,
  activePlanId,
}: ActivityRealtimeSyncProps) {
  const currentUserQuery = useQuery(currentUserQueryOptions());

  useActivityRealtimeSync({
    activeChatId,
    activeGroupId,
    activePlanId,
    currentUser: currentUserQuery.data,
  });

  return null;
}
