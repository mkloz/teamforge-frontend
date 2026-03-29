import { Crown, UserPlus } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import type { GroupMember } from "@/features/activity/types/groups.types";

interface MembersSectionProps {
  members: GroupMember[];
  maxMembers: number;
}

export function MembersSection({ members, maxMembers }: MembersSectionProps) {
  const canInvite = members.length < maxMembers;

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">
          Members ({members.length}/{maxMembers})
        </h3>
        {canInvite && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-primary"
          >
            <UserPlus size={14} className="mr-1" />
            Invite
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {members.map((member) => (
          <MemberCard key={member.id} member={member} />
        ))}
      </div>
    </section>
  );
}

function MemberCard({ member }: { member: GroupMember }) {
  const isAdmin = member.role === "ADMIN";

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
      {/* Avatar */}
      <div className="relative shrink-0">
        <img
          src={member.avatar}
          alt={member.name}
          className="w-10 h-10 rounded-full object-cover"
        />
        {isAdmin && (
          <div className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-amber-500 border border-background">
            <Crown size={10} className="text-white" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground truncate">
            {member.name}
          </p>
          <Badge variant="mbti" className="text-[10px] px-1.5 py-0">
            {member.personalityType}
          </Badge>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-muted-foreground">
            Trust: {Math.round(member.trustScore * 100)}%
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="text-[10px] text-primary">
            {member.compatibilityScore}% match
          </span>
        </div>
      </div>
    </div>
  );
}
