import { PresenceLabel } from "@/shared/components/common/presence-label";
import { StatusPill } from "@/shared/components/ui/status-pill";
import type { OnlineStatus } from "@/shared/schemas/enums";

export function MemberIdentityRow({
  isViewer,
  lastSeenAt,
  memberName,
  onlineStatus,
}: {
  isViewer: boolean;
  lastSeenAt?: string | null;
  memberName: string;
  onlineStatus?: OnlineStatus;
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
      <PresenceLabel lastSeenAt={lastSeenAt} status={onlineStatus} />
    </div>
  );
}
