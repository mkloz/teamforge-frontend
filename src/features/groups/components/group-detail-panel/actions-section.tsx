import { CalendarPlus, Share2, BellOff, LogOut, Flag } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { GroupStatus } from "../../types/groups.types";

interface ActionsSectionProps {
  groupId: string;
  groupStatus: GroupStatus;
}

export function ActionsSection({ groupId: _groupId, groupStatus }: ActionsSectionProps) {
  const isCompleted = groupStatus === "COMPLETED" || groupStatus === "DISSOLVED";

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
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left",
        "transition-all duration-150 active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        variant === "default" && "text-foreground hover:bg-muted/80",
        variant === "destructive" && "text-destructive hover:bg-destructive/10",
        variant === "muted" && "text-muted-foreground hover:bg-muted/60",
      )}
    >
      <span className={cn(
        "flex-shrink-0 p-1.5 rounded-lg",
        variant === "default" && "bg-muted",
        variant === "destructive" && "bg-destructive/10",
        variant === "muted" && "bg-muted/50",
      )}>
        {icon}
      </span>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
