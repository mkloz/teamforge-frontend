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
    <section
      className={cn("border-border/70 border-t px-5 py-5", isMobile && "pb-6")}
    >
      <h4 className="font-bold text-slate-muted text-xs">Account & safety</h4>
      <div className="mt-3 flex flex-col divide-y divide-border/70 border-border/70 border-y">
        <Button
          variant="ghost"
          className="group flex h-auto w-full items-center justify-start rounded-lg px-0 py-3"
          contentClassName="justify-start gap-3"
        >
          {isMuted ? (
            <BellOff className="size-4 shrink-0 text-slate-muted transition-colors group-hover:text-forge-teal" />
          ) : (
            <Bell className="size-4 shrink-0 text-slate-muted transition-colors group-hover:text-forge-teal" />
          )}
          <span className="font-medium text-ink text-sm">
            {isMuted ? "Unmute notifications" : "Mute notifications"}
          </span>
        </Button>

        <Button
          variant="ghost"
          className="group flex h-auto w-full items-center justify-start rounded-lg px-0 py-3 text-destructive"
          contentClassName="justify-start gap-3"
          disabled={
            blockActionDisabled || isBlockActionPending || !onToggleBlock
          }
          onClick={onToggleBlock}
        >
          {isBlockActionPending ? (
            <Loader2 className="size-4 shrink-0 animate-spin" />
          ) : (
            <Ban className="size-4 shrink-0" />
          )}
          <span className="font-medium text-sm">
            {isBlockActionPending
              ? isBlocked
                ? "Unblocking..."
                : "Blocking..."
              : isBlocked
                ? "Unblock user"
                : "Block user"}
          </span>
        </Button>
      </div>
    </section>
  );
}
