import type { GroupMember } from "@/features/activity/lib/activity-contract";
import { StatusPill } from "@/shared/components/ui/status-pill";

export function MemberIdentityRow({
  isViewer,
  member,
  memberName,
}: {
  isViewer: boolean;
  member: GroupMember;
  memberName: string;
}) {
  return (
    <div className="mb-0.5 flex min-w-0 items-center gap-1.5">
      <p className="min-w-0 truncate font-black text-foreground text-sm leading-tight">
        {memberName}
      </p>
      {isViewer ? (
        <StatusPill
          tone="neutral"
          size="xs"
          surface="soft"
          className="bg-muted px-1.5"
        >
          You
        </StatusPill>
      ) : null}
      {member.user?.personalityType ? (
        <StatusPill
          tone="teal"
          size="xs"
          surface="solid"
          className="h-4 px-1.5 py-0 leading-4"
        >
          {member.user.personalityType}
        </StatusPill>
      ) : null}
    </div>
  );
}
