import { Ban, Bell, BellOff } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface ProfilePanelSettingsProps {
  isMuted: boolean;
  isBlocked: boolean;
  isMobile?: boolean;
}

export function ProfilePanelSettings({
  isMuted,
  isBlocked,
  isMobile = false,
}: ProfilePanelSettingsProps) {
  return (
    <div className={cn("p-4", isMobile && "pb-safe")}>
      {!isMobile && (
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Settings
        </h4>
      )}
      <div className="space-y-1">
        <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-muted/50 transition-colors">
          {isMuted ? (
            <>
              <BellOff size={18} className="text-muted-foreground" />
              <span className="text-sm text-foreground">
                Unmute notifications
              </span>
            </>
          ) : (
            <>
              <Bell size={18} className="text-muted-foreground" />
              <span className="text-sm text-foreground">
                Mute notifications
              </span>
            </>
          )}
        </button>
        <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-destructive/10 transition-colors text-destructive">
          <Ban size={18} />
          <span className="text-sm">
            {isBlocked ? "Unblock user" : "Block user"}
          </span>
        </button>
      </div>
    </div>
  );
}
