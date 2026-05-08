import { Ban, Bell, BellOff, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

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
    <div
      className={cn(
        "p-6",
        isMobile && "pb-[calc(2rem+env(safe-area-inset-bottom))]",
      )}
    >
      <h4 className="mb-4 px-1 text-xs font-semibold tracking-widest text-slate-muted uppercase">
        Account & Safety
      </h4>
      <div className="flex flex-col gap-1">
        <Button
          variant="ghost"
          className="group flex h-auto w-full items-center justify-start gap-3 px-3 py-2"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-slate-muted transition-colors group-hover:text-forge-teal">
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
