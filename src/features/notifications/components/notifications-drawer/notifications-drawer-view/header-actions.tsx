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
    <div className="flex items-center gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={onMarkAllReadDialogOpen}
            disabled={!isOnline || count === 0 || isMarkingAllRead}
            loading={isMarkingAllRead}
            aria-label="Mark all notifications as read"
            className="h-9 rounded-full px-2.5 text-slate-muted text-xs hover:text-ink"
            contentClassName="gap-1.5"
          >
            <CheckCheck className="size-4 shrink-0" aria-hidden="true" />
            <span className="hidden min-[390px]:inline">Read all</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">{labels.markAllRead}</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={!isOnline || isRefreshing}
            loading={isRefreshing}
            aria-label="Refresh notifications"
            className="size-10 rounded-full p-0 text-slate-muted hover:text-ink [@media(pointer:fine)]:size-9"
          >
            <RefreshCw className="size-4 shrink-0" aria-hidden="true" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">{labels.refresh}</TooltipContent>
      </Tooltip>
    </div>
  );
}
