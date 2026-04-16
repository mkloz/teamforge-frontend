import { CalendarPlus, Share2, BellOff, LogOut, Flag } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import type { GroupStatus } from "@/features/activity/types/groups.types";

interface ActionsSectionProps {
  groupId: string;
  groupStatus: GroupStatus;
}

export function ActionsSection({ groupStatus }: ActionsSectionProps) {
  const isCompleted =
    groupStatus === "COMPLETED" || groupStatus === "DISSOLVED";

  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground mb-3">Actions</h3>

      {/* Primary actions */}
      {!isCompleted && (
        <>
          <ActionButton
            icon={<CalendarPlus size={16} />}
            label="Add to Calendar"
            onClick={() => console.log("Add to calendar")}
          />
          <ActionButton
            icon={<Share2 size={16} />}
            label="Share Group"
            onClick={() => console.log("Share group")}
          />
          <ActionButton
            icon={<BellOff size={16} />}
            label="Mute Notifications"
            onClick={() => console.log("Mute notifications")}
          />
        </>
      )}

      {/* Separator */}
      <div className="border-t border-border my-3" />

      {/* Destructive actions */}
      {!isCompleted && (
        <ActionButton
          icon={<LogOut size={16} />}
          label="Leave Group"
          onClick={() => console.log("Leave group")}
          variant="destructive"
        />
      )}

      <ActionButton
        icon={<Flag size={16} />}
        label="Report Group"
        onClick={() => console.log("Report group")}
        variant="muted"
      />
    </section>
  );
}

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: "default" | "destructive" | "muted";
}

function ActionButton({
  icon,
  label,
  onClick,
  variant = "default",
}: ActionButtonProps) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={cn(
        "w-full h-auto flex items-center justify-start gap-4 px-3 py-2.5 rounded-xl border border-transparent shadow-none transition-all duration-200",
        variant === "default" && "text-ink hover:bg-muted/80",
        variant === "destructive" &&
          "text-red-500 hover:bg-red-500/10 hover:border-red-500/20",
        variant === "muted" && "text-slate-muted hover:bg-muted hover:text-ink",
      )}
    >
      <span
        className={cn(
          "shrink-0 p-2 rounded-lg transition-colors",
          variant === "default" &&
            "bg-muted group-hover:bg-ink group-hover:text-white",
          variant === "destructive" &&
            "bg-red-500/10 group-hover:bg-red-500 group-hover:text-white",
          variant === "muted" &&
            "bg-muted/50 group-hover:bg-ink group-hover:text-white",
        )}
      >
        {icon}
      </span>
      <span className="text-sm font-bold tracking-tight">{label}</span>
    </Button>
  );
}
