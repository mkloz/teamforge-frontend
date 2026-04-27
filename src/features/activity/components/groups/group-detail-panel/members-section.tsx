import { UserPlus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import type { GroupMember } from "@/features/activity/types/groups.types";
import { MemberCard } from "./member-card";
import { useMemo } from "react";

interface MembersSectionProps {
  members: GroupMember[];
  maxMembers: number;
  onShowProfile?: (member: GroupMember) => void;
}

export function MembersSection({
  members,
  maxMembers,
  onShowProfile,
}: MembersSectionProps) {
  const canInvite = useMemo(
    () => members.length < maxMembers,
    [members.length, maxMembers],
  );

  const memberCountString = useMemo(
    () => `(${members.length}/${maxMembers})`,
    [members.length, maxMembers],
  );

  const slotsRemaining = maxMembers - members.length;

  return (
    <section aria-labelledby="members-heading">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3
            id="members-heading"
            className="text-sm font-bold text-foreground uppercase tracking-widest"
          >
            Members{" "}
            <span className="text-muted-foreground/60 font-medium ml-1">
              {memberCountString}
            </span>
          </h3>
          {slotsRemaining > 0 && slotsRemaining <= 3 && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/15 text-amber-600">
              {slotsRemaining} {slotsRemaining === 1 ? "slot" : "slots"} left
            </span>
          )}
        </div>
        {canInvite && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-[11px] font-bold uppercase tracking-wider border-primary/20 hover:border-primary/40 hover:bg-primary/5 text-primary rounded-lg shadow-xs transition-all duration-300"
          >
            <UserPlus size={13} className="mr-1" />
            Invite
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {members.map((member) => (
          <MemberCard
            key={member.userId}
            member={member}
            onShowProfile={onShowProfile}
          />
        ))}
      </div>
    </section>
  );
}
