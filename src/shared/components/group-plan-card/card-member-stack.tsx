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
  const visibleMemberLimit = isCompact ? 3 : 4;
  const visibleMembers = group.members.slice(0, visibleMemberLimit);
  const hiddenMemberCount = Math.max(
    0,
    group.activeMembersCount - visibleMemberLimit,
  );
  const shouldShowHiddenCount = hiddenMemberCount > 0 && !isCompact;
  const sizeClassName = isCompact ? "size-6" : "size-7";

  return (
    <div className="flex shrink-0">
      {visibleMembers.map((member, index) => (
        <Avatar
          key={member.id}
          src={member.avatar}
          media={member.avatarMedia ?? null}
          name={member.name}
          fallback={member.name ? undefined : fallbackInitial}
          imageSize={64}
          className={cn(
            "border-canvas border-thin bg-canvas transition-transform duration-300 hover:z-20 hover:-translate-y-1",
            index > 0 && "-ml-2",
            sizeClassName,
          )}
          fallbackClassName="text-xs"
        />
      ))}

      {shouldShowHiddenCount ? (
        <div
          className={cn(
            "relative z-10 flex items-center justify-center rounded-full border-canvas border-thin bg-muted font-extrabold text-muted-foreground text-xs transition-transform duration-300 hover:z-20 hover:-translate-y-1",
            "-ml-2",
            sizeClassName,
          )}
        >
          +{hiddenMemberCount}
        </div>
      ) : null}
    </div>
  );
}
