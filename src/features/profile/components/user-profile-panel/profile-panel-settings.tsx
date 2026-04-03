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
    <div className={cn("p-6", isMobile && "pb-safe pb-8")}>
      <h4 className="text-xs font-semibold text-slate-muted uppercase tracking-widest px-1 mb-4">
        Account & Safety
      </h4>
      <div className="space-y-1">
        <button className="flex items-center gap-3 w-full px-3 py-2 rounded-xl transition-all duration-200 hover:bg-muted group active:scale-[0.98]">
          <div className="w-9 h-9 shrink-0 rounded-lg bg-muted flex items-center justify-center text-slate-muted group-hover:text-forge-teal transition-colors">
            {isMuted ? <BellOff size={16} /> : <Bell size={16} />}
          </div>
          <span className="text-sm font-medium text-ink">
            {isMuted ? "Unmute Notifications" : "Mute Notifications"}
          </span>
        </button>

        <button className="flex items-center gap-3 w-full px-3 py-2 rounded-xl transition-all duration-200 hover:bg-red-500/10 group active:scale-[0.98]">
          <div className="w-9 h-9 shrink-0 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500/40 group-hover:text-red-500 transition-colors">
            <Ban size={16} />
          </div>
          <span className="text-sm font-medium text-red-600 dark:text-red-400">
            {isBlocked ? "Unblock User" : "Block User"}
          </span>
        </button>
      </div>
    </div>
  );
}
