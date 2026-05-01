import type { ReactNode } from "react";

import { Avatar } from "@/shared/components/common/avatar";
import { cn } from "@/shared/lib/utils";
import type { ExploreGroup } from "@/shared/schemas";

interface CardFooterProps {
  group: ExploreGroup;
  isFull: boolean;
  action: ReactNode;
  variant?: "default" | "compact";
}

export function CardFooter({
  group,
  isFull,
  action,
  variant = "default",
}: CardFooterProps) {
  const isCompact = variant === "compact";
  const currentSize = group.activeMembersCount;
  const capacity = group.maxMembers;
  const title = group.plan?.title || group.activity.title || "Activity";
  const spotsLeft = capacity > 0 ? Math.max(0, capacity - currentSize) : null;

  return (
    <div
      className={cn(
        "flex items-center justify-between mt-auto relative z-20 gap-3",
        isCompact ? "pt-1" : "pt-2",
      )}
    >
      <div className="flex items-center gap-2.5">
        <div className="flex -space-x-2 shrink-0">
          {group.members.slice(0, 4).map((member, i) => (
            <Avatar
              key={`${group.id}-${i}`}
              src={member.avatar}
              name={member.name}
              fallback={
                member.name ? undefined : title[0]?.toUpperCase() || "T"
              }
              className={cn(
                "border-thin border-canvas bg-canvas transition-transform duration-300 hover:-translate-y-1 hover:z-20",
                isCompact ? "size-6" : "w-7 h-7",
              )}
              fallbackClassName="text-[10px]"
            />
          ))}

          {currentSize > 4 && (
            <div
              className={cn(
                "rounded-full border-thin border-canvas bg-muted flex items-center justify-center text-[10px] font-extrabold text-muted-foreground relative z-10 transition-transform duration-300 hover:-translate-y-1 hover:z-20",
                isCompact ? "size-6" : "w-7 h-7",
              )}
            >
              +{currentSize - 4}
            </div>
          )}
        </div>

        <div
          className={cn(
            "flex flex-col justify-center leading-tight",
            isCompact ? "text-[10px]" : "text-xs",
          )}
        >
          <span className="font-extrabold text-foreground">
            {capacity > 0
              ? `${currentSize}/${capacity}`
              : `${currentSize} joined`}
          </span>
          {spotsLeft !== null && !isFull ? (
            <span className="font-bold text-accent">{spotsLeft} left</span>
          ) : null}
          {spotsLeft === null ? (
            <span className="font-bold text-slate-muted">Flexible size</span>
          ) : null}
          {isFull ? (
            <span className="font-bold text-destructive">Full</span>
          ) : null}
        </div>
      </div>

      {action}
    </div>
  );
}
