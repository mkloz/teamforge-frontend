import { type LucideIcon, ShieldCheck, Target, UserMinus } from "lucide-react";
import type { GroupMember } from "@/features/activity/lib/activity-contract";
import { AdminCrownBadge } from "@/shared/components/common/admin-crown-badge";
import { Avatar, AvatarStatus } from "@/shared/components/common/avatar";
import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface MemberCardProps {
  canRemove?: boolean;
  isViewer?: boolean;
  member: GroupMember;
  onRemove?: (memberId: string) => Promise<void> | void;
  onShowProfile?: (member: GroupMember) => void;
  removing?: boolean;
  showFit?: boolean;
}

export function MemberCard({
  canRemove = false,
  isViewer = false,
  member,
  onRemove,
  onShowProfile,
  removing = false,
  showFit = true,
}: MemberCardProps) {
  const isAdmin = member.role === "ADMIN";
  const memberName = member.user?.name ?? "Member";
  const trustPercent = formatPercent(member.user?.trustScore ?? null);
  const fitScore =
    showFit && typeof member.compatibilityScore === "number"
      ? formatPercent(member.compatibilityScore)
      : null;
  const isHighTrust = typeof trustPercent === "number" && trustPercent >= 80;
  const isHighCompatibility = typeof fitScore === "number" && fitScore >= 80;
  const onlineStatus = member.user?.onlineStatus;

  const memberSummary = (
    <>
      <div className="relative shrink-0">
        <Avatar
          src={member.user?.avatar}
          name={member.user?.name}
          className={cn(
            "size-10 ring-1 ring-border/20 transition-all group-hover/member:ring-border/40",
            isHighTrust ? "ring-2 ring-forge-teal/30" : "ring-border/40",
          )}
          imageClassName="transition-transform duration-500 group-hover/member:scale-110"
        />
        {onlineStatus && (
          <AvatarStatus status={onlineStatus} borderClassName="border-canvas" />
        )}
        {isAdmin && (
          <AdminCrownBadge
            aria-label="Group admin"
            className="absolute -top-1 -left-1"
            iconClassName="size-2.5"
          />
        )}
      </div>

      <div className="min-w-0 flex-1 overflow-hidden">
        <div className="mb-0.5 flex min-w-0 items-center gap-1.5">
          <p className="min-w-0 truncate font-black text-foreground text-sm leading-tight">
            {memberName}
          </p>
          {isViewer ? (
            <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 font-bold text-micro text-muted-foreground">
              You
            </span>
          ) : null}
          {member.user?.personalityType ? (
            <span className="h-4 shrink-0 rounded-full bg-forge-teal px-1.5 font-bold text-micro text-white leading-4">
              {member.user.personalityType}
            </span>
          ) : null}
        </div>
        <div className="mt-1.5 flex min-w-0 items-center gap-1.5">
          {typeof trustPercent === "number" ? (
            <MemberMetric
              icon={ShieldCheck}
              label="Trust"
              tone={isHighTrust ? "teal" : "muted"}
              value={`${trustPercent}%`}
            />
          ) : null}
          {typeof fitScore === "number" ? (
            <MemberMetric
              icon={Target}
              label="Fit"
              tone={isHighCompatibility ? "teal" : "muted"}
              value={`${fitScore}%`}
            />
          ) : null}
        </div>
      </div>
    </>
  );

  return (
    <article
      className={cn(
        "group/member flex min-h-16 w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors duration-150 focus-within:bg-muted/50 hover:bg-muted/50",
        isAdmin && "bg-forge-teal/5",
      )}
    >
      {onShowProfile ? (
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center justify-start gap-3 rounded-xl text-left text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/30"
          aria-label={`Open ${memberName} details`}
          onClick={() => onShowProfile(member)}
        >
          {memberSummary}
        </button>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {memberSummary}
        </div>
      )}

      {canRemove && onRemove ? (
        <div className="relative z-20 shrink-0">
          <ActionDialog
            cancelLabel="Keep member"
            confirmLabel={removing ? "Removing..." : "Remove member"}
            description={`${
              member.user?.name ?? "This member"
            } will lose access to the group chat and planning workspace.`}
            loading={removing}
            onConfirm={() => onRemove(member.userId)}
            onContentClick={(event) => event.stopPropagation()}
            title="Remove member?"
            tone="danger"
            trigger={
              <Button
                variant="destructive"
                size="icon-xs"
                type="button"
                disabled={removing}
                onClick={(event) => {
                  event.stopPropagation();
                }}
                className="size-8 max-md:opacity-100 md:opacity-0 md:transition-all md:duration-150 md:group-hover/member:opacity-100 focus-visible:md:opacity-100"
                aria-label={`Remove ${memberName} from group`}
              >
                <UserMinus className="size-3.5" />
              </Button>
            }
          />
        </div>
      ) : null}
    </article>
  );
}

interface MemberMetricProps {
  icon: LucideIcon;
  label: string;
  tone: "muted" | "teal";
  value: string;
}

function MemberMetric({ icon: Icon, label, tone, value }: MemberMetricProps) {
  return (
    <span
      className={cn(
        "inline-flex h-5 shrink-0 items-center gap-1 rounded-full px-1.5 font-bold text-xs",
        tone === "teal"
          ? "bg-forge-teal/10 text-forge-teal"
          : "bg-muted/50 text-muted-foreground",
      )}
      title={`${label} ${value}`}
    >
      <Icon className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
      <span className="sr-only">{label}</span>
      <span>{value}</span>
    </span>
  );
}

function formatPercent(score: number | null) {
  if (typeof score !== "number") {
    return null;
  }

  return Math.round(score > 0 && score <= 1 ? score * 100 : score);
}
