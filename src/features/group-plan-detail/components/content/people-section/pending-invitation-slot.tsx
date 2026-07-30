import { Clock3, LoaderCircle, ShieldCheck, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { GroupPlanDetailPendingInvitation } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import { Avatar } from "@/shared/components/common/avatar";

export function PendingInvitationSlot({
  canCancel,
  cancelDisabled,
  cancelling,
  invite,
  onCancel,
}: {
  canCancel: boolean;
  cancelDisabled: boolean;
  cancelling: boolean;
  invite: GroupPlanDetailPendingInvitation;
  onCancel: (inviteId: string) => Promise<void>;
}) {
  const elapsed = usePendingInviteElapsedTime(invite.createdAt);
  const trustPercent = formatPercent(invite.trustScore);

  return (
    <article className="group/pending flex min-h-16 items-center gap-3 rounded-xl border border-border/35 border-dashed bg-card/35 px-2 py-2 text-muted-foreground">
      <Avatar
        src={invite.avatar}
        media={invite.avatarMedia ?? null}
        name={invite.name}
        className="size-10 opacity-55 grayscale"
        imageClassName="opacity-75"
        fallbackClassName="bg-muted text-muted-foreground"
      />

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-foreground/60 text-sm">
          {invite.name}
        </p>
        <div className="mt-1.5 flex items-center gap-1.5 text-muted-foreground/65 text-xs">
          {invite.personalityType ? (
            <span className="font-semibold">{invite.personalityType}</span>
          ) : null}
          {invite.personalityType ? <MetricSeparator /> : null}
          <ShieldCheck className="size-3.5" aria-hidden="true" />
          <span className="sr-only">Trust</span>
          <span>{trustPercent}%</span>
        </div>
      </div>

      <div className="relative flex shrink-0 items-center justify-end">
        <span className="flex items-center gap-1 text-muted-foreground/65 text-xs transition-opacity sm:group-hover/pending:opacity-0 sm:group-focus-within/pending:opacity-0">
          <Clock3 className="size-3.5" aria-hidden="true" />
          <time dateTime={invite.createdAt}>{elapsed}</time>
        </span>
        {canCancel ? (
          <button
            type="button"
            aria-label={`Cancel invitation for ${invite.name}`}
            className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-[background-color,color,opacity,transform] hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/35 disabled:pointer-events-none sm:absolute sm:right-0 sm:translate-x-1 sm:opacity-0 sm:group-hover/pending:translate-x-0 sm:group-hover/pending:opacity-100 sm:group-focus-within/pending:translate-x-0 sm:group-focus-within/pending:opacity-100"
            disabled={cancelDisabled}
            onClick={() => void onCancel(invite.id)}
          >
            {cancelling ? (
              <LoaderCircle
                className="size-3.5 animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />
            ) : (
              <Trash2 className="size-3.5" aria-hidden="true" />
            )}
          </button>
        ) : null}
      </div>
    </article>
  );
}

export function AnonymousPendingInvitationSlot({
  slotNumber,
  maxMembers,
}: {
  slotNumber: number;
  maxMembers: number;
}) {
  return (
    <article
      aria-label={`Invitation pending for member slot ${slotNumber} of ${maxMembers}`}
      className="flex min-h-16 items-center gap-3 rounded-xl border border-border/35 border-dashed bg-card/25 px-2 py-2 text-muted-foreground/60"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border/40 border-dashed">
        <Clock3 className="size-4" aria-hidden="true" />
      </span>
      <div>
        <p className="font-semibold text-sm">Invitation pending</p>
        <p className="mt-0.5 text-xs">
          Slot {slotNumber} of {maxMembers}
        </p>
      </div>
    </article>
  );
}

function MetricSeparator() {
  return (
    <span
      className="size-1 shrink-0 rounded-full bg-muted-foreground/30"
      aria-hidden="true"
    />
  );
}

function usePendingInviteElapsedTime(createdAt: string) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(intervalId);
  }, []);

  const createdAtTime = Date.parse(createdAt);
  if (Number.isNaN(createdAtTime)) return "Pending";

  const elapsedMinutes = Math.max(
    0,
    Math.floor((now - createdAtTime) / 60_000),
  );
  if (elapsedMinutes < 1) return "Now";
  if (elapsedMinutes < 60) return `${elapsedMinutes}m`;

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  return elapsedHours < 48
    ? `${elapsedHours}h`
    : `${Math.floor(elapsedHours / 24)}d`;
}

function formatPercent(score: number) {
  return Math.round(score > 0 && score <= 1 ? score * 100 : score);
}
