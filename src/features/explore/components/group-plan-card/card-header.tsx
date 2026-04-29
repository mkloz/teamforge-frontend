import { cn } from "@/shared/lib/utils";
import type { ExploreGroup } from "@/shared/schemas";
import { Handshake } from "lucide-react";

interface CardHeaderProps {
  group: ExploreGroup;
  variant?: "default" | "compact";
}

export function CardHeader({ group, variant = "default" }: CardHeaderProps) {
  const isCompact = variant === "compact";
  const groupName = group.name;
  const access = group.access;
  const initials =
    groupName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "TF";

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
            "rounded-full overflow-hidden bg-muted border border-border shrink-0 flex items-center justify-center",
            isCompact ? "size-5" : "size-6",
          )}
        >
          {group.avatar ? (
            <img
              src={group.avatar}
              alt={groupName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-[10px] font-black text-forge-teal">
              {initials}
            </span>
          )}
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
