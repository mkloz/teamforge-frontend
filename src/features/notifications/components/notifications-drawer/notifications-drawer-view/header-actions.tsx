import { CheckCheck, RefreshCw } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { getNotificationsListHeaderActionLabels } from "./header-state";

export function NotificationsListHeaderActions({
  count,
  isMarkingAllRead,
  isOnline,
  isRefreshing,
  onMarkAllReadDialogOpen,
  onRefresh,
}: {
  count: number;
  isMarkingAllRead: boolean;
  isOnline: boolean;
  isRefreshing: boolean;
  onMarkAllReadDialogOpen: () => void;
  onRefresh: () => void;
}) {
  const labels = getNotificationsListHeaderActionLabels(isOnline);

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="subtle"
            size="icon"
            onClick={onMarkAllReadDialogOpen}
            disabled={!isOnline || count === 0 || isMarkingAllRead}
            loading={isMarkingAllRead}
            aria-label="Mark all notifications as read"
            className="size-10 p-0"
          >
            <CheckCheck className="size-4 shrink-0" aria-hidden="true" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">{labels.markAllRead}</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="accentGhost"
            size="icon"
            onClick={onRefresh}
            disabled={!isOnline || isRefreshing}
            loading={isRefreshing}
            aria-label="Refresh notifications"
            className="size-10 p-0"
          >
            <RefreshCw className="size-4 shrink-0" aria-hidden="true" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">{labels.refresh}</TooltipContent>
      </Tooltip>
    </>
  );
}
