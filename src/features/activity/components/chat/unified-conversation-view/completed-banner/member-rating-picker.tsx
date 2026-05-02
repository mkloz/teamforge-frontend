import type { GroupMember } from "@/features/activity/lib/activity-contract";
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
          <button
            key={member.userId}
            type="button"
            disabled={isRated || disabled}
            onClick={() => onSelect(member)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/40",
              isSelected
                ? "border-forge-teal/40 bg-forge-teal/10 text-forge-teal"
                : "border-border bg-card text-ink hover:border-forge-teal/30",
              isRated && "opacity-50",
            )}
          >
            {member.user?.name ?? "Teammate"}
            {isRated ? " rated" : ""}
          </button>
        );
      })}
    </div>
  );
}
