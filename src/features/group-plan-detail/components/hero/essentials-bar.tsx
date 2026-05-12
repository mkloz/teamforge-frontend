import {
  Banknote,
  CalendarClock,
  type LucideIcon,
  MapPin,
  Unlock,
  UsersRound,
} from "lucide-react";
import type { ReactNode } from "react";
import { GroupPlanActionButton } from "@/features/group-plan-detail/components/group-plan-action-button";
import { useGroupPlanActionState } from "@/features/group-plan-detail/hooks/use-group-plan-action-state";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import {
  formatCost,
  formatLocation,
  formatPlanDateTime,
} from "@/features/group-plan-detail/lib/group-plan-detail-formatters";
import { Avatar } from "@/shared/components/common/avatar";

interface EssentialsBarProps {
  detail: GroupPlanDetail;
}

export function EssentialsBar({ detail }: EssentialsBarProps) {
  const planTime = formatPlanDateTime(detail.plan?.dateTime);
  const leadMembers = detail.members.slice(0, 4);
  const extraMembers = Math.max(0, detail.members.length - leadMembers.length);
  const action = useGroupPlanActionState(detail);

  return (
    <div className="rounded-4xl bg-card/60 p-4 shadow-sm ring-1 ring-border/50 backdrop-blur-xl sm:p-5">
      <div className="lg:main-action-grid grid gap-3 lg:items-center lg:gap-5">
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 lg:grid-cols-5">
          <MemberStackCell
            members={leadMembers}
            extra={extraMembers}
            active={detail.group.activeMembersCount}
            max={detail.group.maxMembers}
          />
          <Fact
            icon={CalendarClock}
            label="When"
            value={planTime.full === "Date TBD" ? planTime.date : planTime.full}
          />
          <Fact icon={MapPin} label="Where" value={formatLocation(detail)} />
          <Fact icon={Banknote} label="Cost" value={formatCost(detail.plan)} />
          <Fact
            icon={Unlock}
            label="Access"
            value={detail.group.access === "OPEN" ? "Open" : "By request"}
          />
        </div>

        <div className="lg:min-w-52">
          <PrimaryCta detail={detail} action={action} />
        </div>
      </div>
    </div>
  );
}

function PrimaryCta({
  detail,
  action,
}: {
  detail: GroupPlanDetail;
  action: ReturnType<typeof useGroupPlanActionState>;
}) {
  return (
    <GroupPlanActionButton
      action={action.primary}
      className="w-full"
      size="md"
      ariaLabel={`${action.primary.label} - ${detail.group.name}`}
    />
  );
}

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-start gap-2">
      <Icon
        className="mt-0.5 size-4 shrink-0 text-forge-teal"
        aria-hidden="true"
      />
      <div className="min-w-0">
        <p className="type-signature-label font-bold text-muted-foreground uppercase tracking-widest">
          {label}
        </p>
        <p className="truncate font-black text-foreground text-sm leading-tight">
          {value}
        </p>
      </div>
    </div>
  );
}

function MemberStackCell({
  members,
  extra,
  active,
  max,
}: {
  members: GroupPlanDetail["members"];
  extra: number;
  active: number;
  max: number;
}): ReactNode {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex shrink-0">
        {members.map((member) => (
          <Avatar
            key={member.userId}
            src={member.avatar}
            name={member.name}
            className="-ml-2 size-8 border-2 border-card first:ml-0"
          />
        ))}
        {extra > 0 ? (
          <span className="-ml-2 flex size-8 items-center justify-center rounded-full border-2 border-card bg-muted font-black text-foreground text-xs">
            +{extra}
          </span>
        ) : null}
      </div>
      <div className="min-w-0">
        <p className="type-signature-label font-bold text-muted-foreground uppercase tracking-widest">
          Members
        </p>
        <p className="truncate font-black text-foreground text-sm leading-tight">
          <UsersRound
            className="mr-1 inline size-3.5 -translate-y-px align-middle text-forge-teal"
            aria-hidden="true"
          />
          {active}/{max} in
        </p>
      </div>
    </div>
  );
}
