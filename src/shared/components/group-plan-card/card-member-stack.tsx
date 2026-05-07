import { Avatar } from "@/shared/components/common/avatar";
import type { GroupPlanCardVariant } from "@/shared/components/group-plan-card/group-plan-card-types";
import { cn } from "@/shared/lib/utils";
import type { ExploreGroup } from "@/shared/schemas";

interface CardMemberStackProps {
  group: ExploreGroup;
  fallbackInitial: string;
  variant?: GroupPlanCardVariant;
}

export function CardMemberStack({
  fallbackInitial,
  group,
  variant = "default",
}: CardMemberStackProps) {
  const isCompact = variant === "compact";
  const visibleMembers = group.members.slice(0, 4);
  const hiddenMemberCount = Math.max(0, group.activeMembersCount - 4);
  const sizeClassName = isCompact ? "size-7" : "size-7";

  return (
    <div className="flex shrink-0 -space-x-2">
      {visibleMembers.map((member, index) => (
        <Avatar
          key={`${group.id}-${index}`}
          src={member.avatar}
          name={member.name}
          fallback={member.name ? undefined : fallbackInitial}
          className={cn(
            "border-thin border-canvas bg-canvas transition-transform duration-300 hover:z-20 hover:-translate-y-1",
            sizeClassName,
          )}
          fallbackClassName="text-xs"
        />
      ))}

      {hiddenMemberCount > 0 ? (
        <div
          className={cn(
            "relative z-10 flex items-center justify-center rounded-full border-thin border-canvas bg-muted text-xs font-extrabold text-muted-foreground transition-transform duration-300 hover:z-20 hover:-translate-y-1",
            sizeClassName,
          )}
        >
          +{hiddenMemberCount}
        </div>
      ) : null}
    </div>
  );
}
