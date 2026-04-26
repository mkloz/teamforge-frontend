import { cn } from "@/shared/lib/utils";
import { Handshake } from "lucide-react";
import type { Group } from "@/shared/schemas";

interface CardHeaderProps {
  group: Group;
  variant?: "default" | "compact";
}

export function CardHeader({ group, variant = "default" }: CardHeaderProps) {
  const isCompact = variant === "compact";
  const groupName = group.name;
  const groupAvatarUrl = group.avatar;
  const access = group.activity?.access || "OPEN";

  return (
    <div
      className={cn(
        "flex justify-between items-start gap-4",
        isCompact ? "mb-2" : "mb-3",
      )}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={cn(
            "rounded-full overflow-hidden bg-muted border border-border shrink-0",
            isCompact ? "size-5" : "size-6",
          )}
        >
          <img
            src={
              groupAvatarUrl
                ? `https://api.dicebear.com/7.x/identicon/svg?seed=${groupAvatarUrl}`
                : `https://api.dicebear.com/7.x/initials/svg?seed=${groupName}`
            }
            alt={groupName}
            className="w-full h-full object-cover"
          />
        </div>
        <span
          className={cn(
            "font-semibold text-muted-foreground tracking-tight group-hover:text-foreground transition-colors truncate",
            isCompact ? "text-xs" : "text-sm",
          )}
        >
          {groupName}
        </span>
      </div>

      {/* Top Right Request info pill if any */}
      {access === "BY_REQUEST" && (
        <span className="flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-md border border-border/80 text-muted-foreground text-[10px] font-bold uppercase tracking-wider bg-background/50">
          <Handshake className="w-3 h-3" />
          Req
        </span>
      )}
    </div>
  );
}
