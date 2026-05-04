import type { GroupMember } from "@/features/activity/lib/activity-contract";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface MemberRatingPickerProps {
  activeUserId: string | null;
  disabled: boolean;
  members: GroupMember[];
  onSelect: (member: GroupMember) => void;
  ratedUserIds: Set<string>;
}

export function MemberRatingPicker({
  activeUserId,
  disabled,
  members,
  onSelect,
  ratedUserIds,
}: MemberRatingPickerProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {members.map((member) => {
        const isRated = ratedUserIds.has(member.userId);
        const isSelected = activeUserId === member.userId;

        return (
          <Button
            key={member.userId}
            type="button"
            variant="ghost"
            size="xs"
            disabled={isRated || disabled}
            onClick={() => onSelect(member)}
            className={cn(
              "h-auto shrink-0 rounded-full border px-3 py-1.5 text-xs transition-colors",
              "focus-visible:ring-forge-teal/40",
              isSelected
                ? "border-forge-teal/40 bg-forge-teal/10 text-forge-teal"
                : "border-border bg-card text-ink hover:border-forge-teal/30",
              isRated && "opacity-50",
            )}
          >
            {member.user?.name ?? "Teammate"}
            {isRated ? " rated" : ""}
          </Button>
        );
      })}
    </div>
  );
}
