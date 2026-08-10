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

interface MemberRatingButtonState {
  isDisabled: boolean;
  isRated: boolean;
  isSelected: boolean;
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
        const state = getMemberRatingButtonState({
          activeUserId,
          disabled,
          member,
          ratedUserIds,
        });

        return (
          <MemberRatingButton
            key={member.userId}
            member={member}
            onSelect={onSelect}
            state={state}
          />
        );
      })}
    </div>
  );
}

function MemberRatingButton({
  member,
  onSelect,
  state,
}: {
  member: GroupMember;
  onSelect: (member: GroupMember) => void;
  state: MemberRatingButtonState;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="xs"
      disabled={state.isDisabled}
      onClick={() => onSelect(member)}
      className={getMemberRatingButtonClassName(state)}
    >
      {member.user?.name ?? "Teammate"}
      {state.isRated ? " rated" : ""}
    </Button>
  );
}

function getMemberRatingButtonState({
  activeUserId,
  disabled,
  member,
  ratedUserIds,
}: {
  activeUserId: string | null;
  disabled: boolean;
  member: GroupMember;
  ratedUserIds: Set<string>;
}): MemberRatingButtonState {
  const isRated = ratedUserIds.has(member.userId);

  return {
    isDisabled: isRated || disabled,
    isRated,
    isSelected: activeUserId === member.userId,
  };
}

function getMemberRatingButtonClassName({
  isRated,
  isSelected,
}: MemberRatingButtonState) {
  return cn(
    "h-auto shrink-0 rounded-full border px-3 py-1.5 text-xs transition-colors",
    "focus-visible:ring-foreground",
    isSelected
      ? "border-primary/40 bg-primary-soft text-foreground"
      : "border-border bg-card text-ink hover:border-foreground/35",
    isRated && "opacity-50",
  );
}
