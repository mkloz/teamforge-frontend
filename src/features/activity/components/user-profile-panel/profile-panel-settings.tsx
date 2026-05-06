import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { Ban, Bell, BellOff, Loader2 } from "lucide-react";

interface ProfilePanelSettingsProps {
  isMuted: boolean;
  isBlocked: boolean;
  blockActionDisabled?: boolean;
  isBlockActionPending?: boolean;
  isMobile?: boolean;
  onToggleBlock?: () => void;
}

export function ProfilePanelSettings({
  isMuted,
  isBlocked,
  blockActionDisabled = false,
  isBlockActionPending = false,
  isMobile = false,
  onToggleBlock,
}: ProfilePanelSettingsProps) {
  return (
    <div className={cn("p-6", isMobile && "pb-safe pb-8")}>
      <h4 className="text-xs font-semibold text-slate-muted uppercase tracking-widest px-1 mb-4">
        Account & Safety
      </h4>
      <div className="flex flex-col gap-1">
        <Button
          variant="ghost"
          className="group flex items-center gap-3 w-full justify-start h-auto px-3 py-2"
        >
          <div className="w-9 h-9 shrink-0 rounded-lg bg-muted flex items-center justify-center text-slate-muted group-hover:text-forge-teal transition-colors">
            {isMuted ? <BellOff size={16} /> : <Bell size={16} />}
          </div>
          <span className="text-sm font-medium text-ink">
            {isMuted ? "Unmute Notifications" : "Mute Notifications"}
          </span>
        </Button>

        <Button
          variant="destructive"
          className="group flex h-auto w-full items-center justify-start gap-3 px-3 py-2"
          disabled={blockActionDisabled || isBlockActionPending}
          onClick={onToggleBlock}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive transition-colors">
            {isBlockActionPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Ban size={16} />
            )}
          </div>
          <span className="text-sm font-medium">
            {isBlockActionPending
              ? isBlocked
                ? "Unblocking..."
                : "Blocking..."
              : isBlocked
                ? "Unblock User"
                : "Block User"}
          </span>
        </Button>
      </div>
    </div>
  );
}
