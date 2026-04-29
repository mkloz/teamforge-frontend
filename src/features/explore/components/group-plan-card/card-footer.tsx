import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import type { ExploreGroup } from "@/shared/schemas";
import { useJoinExploreGroup } from "../../hooks/use-join-explore-group";

interface CardFooterProps {
  group: ExploreGroup;
  isFull: boolean;
  variant?: "default" | "compact";
}

export function CardFooter({
  group,
  isFull,
  variant = "default",
}: CardFooterProps) {
  const isCompact = variant === "compact";
  const currentSize = group.activeMembersCount;
  const capacity = group.maxMembers;
  const access = group.access;
  const title = group.plan?.title || group.activity.title || "Activity";
  const joinMutation = useJoinExploreGroup(group.id);
  const isPending = joinMutation.isPending;
  const joinResult = joinMutation.data?.status;
  const spotsLeft = capacity > 0 ? Math.max(0, capacity - currentSize) : null;
  const actionLabel = isFull
    ? "Full"
    : joinResult === "JOINED"
      ? "Joined"
      : joinResult === "REQUESTED"
        ? "Requested"
        : isPending
          ? access === "BY_REQUEST"
            ? "Requesting..."
            : "Joining..."
          : access === "BY_REQUEST"
            ? "Request"
            : "Join";

  return (
    <div
      className={cn(
        "flex items-center justify-between mt-auto relative z-20 gap-3",
        isCompact ? "pt-1" : "pt-2",
      )}
    >
      {/* Availability Insights */}
      <div className="flex items-center gap-2.5">
        {/* Avatar Stack */}
        <div className="flex -space-x-2 shrink-0">
          {group.members.slice(0, 4).map((member, i) => (
            <div
              key={`${group.id}-${i}`}
              className={cn(
                "rounded-full border-thin border-canvas bg-canvas flex items-center justify-center overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:z-20 relative",
                isCompact ? "size-6" : "w-7 h-7",
              )}
            >
              {member.avatar ? (
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-full h-full object-cover bg-muted"
                  loading="lazy"
                />
              ) : (
                <span className="text-[10px] font-black text-forge-teal">
                  {member.name
                    .split(/\s+/)
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0]?.toUpperCase())
                    .join("") ||
                    title[0]?.toUpperCase() ||
                    "T"}
                </span>
              )}
            </div>
          ))}

          {/* Remainder Badge */}
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

        {/* Spots Left / Capacity */}
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
          {spotsLeft !== null && !isFull && (
            <span className="font-bold text-accent">{spotsLeft} left</span>
          )}
          {spotsLeft === null ? (
            <span className="font-bold text-slate-muted">Flexible size</span>
          ) : null}
          {isFull && <span className="font-bold text-destructive">Full</span>}
        </div>
      </div>

      <button
        type="button"
        className="contents"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant={isFull ? "outline" : "primary"}
          size={isCompact ? "sm" : "default"}
          disabled={isFull || isPending || joinResult !== undefined}
          onClick={() => joinMutation.mutate()}
          className={cn(
            "shrink-0 z-20 shadow-sm",
            isFull && "opacity-50 pointer-events-none hidden md:inline-flex",
          )}
        >
          {actionLabel}
        </Button>
      </button>
    </div>
  );
}
